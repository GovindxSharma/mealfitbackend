import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './user.model';
import { config } from '../../config/env';
import { AppError, asyncHandler } from '../../shared/errorHandler';
import { createSuccessResponse, AuthRequest } from '../../shared/types';

export class AuthController {
  private static sanitizeUser(user: any) {
    const now = Date.now();
    const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt).getTime() : (user.updatedAt ? new Date(user.updatedAt).getTime() : now);
    const diffMins = Math.round((now - lastActive) / (1000 * 60));
    
    let activityStatus: 'active_now' | 'active_today' | 'idle' = 'idle';
    if (diffMins <= 30) {
      activityStatus = 'active_now';
    } else if (diffMins <= 1440) { // 24 hours
      activityStatus = 'active_today';
    }

    return {
      id: user._id?.toString() || user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role || 'user',
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      heightCm: user.heightCm,
      weightKg: user.weightKg,
      targetWeightKg: user.targetWeightKg,
      goalType: user.goalType,
      dietaryPreference: user.dietaryPreference,
      weeklyBudgetInr: user.weeklyBudgetInr,
      preferredLanguage: user.preferredLanguage,
      city: user.city,
      avatarUrl: user.avatarUrl,
      dailyCalorieTarget: user.dailyCalorieTarget,
      proteinTargetG: user.proteinTargetG,
      carbsTargetG: user.carbsTargetG,
      fatTargetG: user.fatTargetG,
      lastActiveAt: user.lastActiveAt || user.updatedAt || user.createdAt,
      activityStatus,
      isActiveToday: activityStatus !== 'idle',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // 1. Native Email & Password Registration (Strong Encrypted)
  static register = asyncHandler(async (req: Request, res: Response) => {
    const {
      fullName,
      email,
      password,
      gender,
      dateOfBirth,
      heightCm,
      weightKg,
      targetWeightKg,
      goalType,
      dietaryPreference,
      weeklyBudgetInr,
      preferredLanguage,
      city,
    } = req.body;

    const normalizedEmail = (email || '').toLowerCase().trim();
    if (!normalizedEmail) {
      throw new AppError('Email is required', 400);
    }
    if (!password || password.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new AppError('An account with this email already exists. Please sign in instead.', 409);
    }

    // Encrypt password with strong bcrypt salt rounds
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const isGovind = normalizedEmail === 'govindsharma2839@gmail.com' || normalizedEmail === 'govind@mealfit.in';
    const user = await User.create({
      fullName: (fullName || 'MealFit Member').trim(),
      email: normalizedEmail,
      passwordHash,
      role: isGovind ? 'super_admin' : 'user',
      gender: gender || 'male',
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date('2000-01-01'),
      heightCm: heightCm || 170,
      weightKg: weightKg || 70,
      targetWeightKg: targetWeightKg || 65,
      goalType: goalType || 'fat_loss',
      dietaryPreference: dietaryPreference || 'veg',
      weeklyBudgetInr: weeklyBudgetInr || 1000,
      preferredLanguage: preferredLanguage || 'en',
      city: city || 'delhi',
      dailyCalorieTarget: 1800,
      proteinTargetG: 120,
      carbsTargetG: 180,
      fatTargetG: 50,
    });

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '90d' }
    );

    return res.status(201).json(
      createSuccessResponse(
        {
          token,
          user: AuthController.sanitizeUser(user),
        },
        'User registered successfully'
      )
    );
  });

  // 2. Native Email & Password Login (Standard Verification)
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const normalizedEmail = (email || '').toLowerCase().trim();
    if (!normalizedEmail || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await User.findOne({ email: normalizedEmail });

    // Reject if account does not exist in database
    if (!user) {
      throw new AppError('No account found with this email. Please create a new account.', 404);
    }

    if (!user.passwordHash) {
      throw new AppError('Account does not have a local password set. Please sign up or contact support.', 401);
    }

    // Verify encrypted password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Incorrect password. Please verify your password and try again.', 401);
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '90d' }
    );

    return res.status(200).json(
      createSuccessResponse(
        {
          token,
          user: AuthController.sanitizeUser(user),
        },
        'Login successful'
      )
    );
  });

  // 3. Get User Profile (Authenticated)
  static getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized: Missing user identity', 401);
    }

    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return res.status(200).json(createSuccessResponse(AuthController.sanitizeUser(user), 'Profile retrieved'));
  });

  // 4. Update Profile & Sync Preferences (Authenticated)
  static updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Unauthorized: Missing user identity', 401);
    }

    const updates = { ...req.body };
    delete updates.password;
    delete updates.passwordHash;
    delete updates.role;
    delete updates._id;

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-passwordHash');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return res.status(200).json(createSuccessResponse(AuthController.sanitizeUser(user), 'Profile updated successfully'));
  });

  // 5. Super Admin: List All Registered Users, Active Metrics & Roles
  static getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const requesterRole = req.user?.role;
    const requesterEmail = req.user?.email?.toLowerCase();
    const isSuperAdmin = requesterRole === 'super_admin' || requesterEmail === 'govindsharma2839@gmail.com' || requesterEmail === 'govind@mealfit.in';

    if (!isSuperAdmin) {
      throw new AppError('Forbidden: Only Super Admin can access user directory', 403);
    }

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const users = await User.find().select('-passwordHash').sort({ updatedAt: -1 }).lean();
    const sanitized = users.map((u) => AuthController.sanitizeUser(u));

    const totalUsers = sanitized.length;
    const activeToday = sanitized.filter((u) => u.isActiveToday).length;
    const activeNow = sanitized.filter((u) => u.activityStatus === 'active_now').length;
    const activeThisWeek = users.filter((u) => {
      const last = u.lastActiveAt ? new Date(u.lastActiveAt) : (u.updatedAt ? new Date(u.updatedAt) : new Date(u.createdAt));
      return last >= sevenDaysAgo;
    }).length;
    const newToday = users.filter((u) => new Date(u.createdAt) >= startOfToday).length;

    const superAdmins = sanitized.filter((u) => u.role === 'super_admin').length;
    const adminTesters = sanitized.filter((u) => u.role === 'admin').length;
    const regularUsers = sanitized.filter((u) => u.role === 'user' || !u.role).length;

    const activePercentage = totalUsers > 0 ? Math.round((activeToday / totalUsers) * 100) : 0;

    return res.status(200).json(
      createSuccessResponse(
        {
          totalUsers,
          activeToday,
          activeNow,
          activeThisWeek,
          newToday,
          activePercentage,
          roleCounts: {
            super_admin: superAdmins,
            admin: adminTesters,
            user: regularUsers,
          },
          users: sanitized,
        },
        'All users and active metrics retrieved successfully'
      )
    );
  });

  // 6. Super Admin: Update User Role (e.g. Promote to Super Admin / Admin / User)
  static updateUserRole = asyncHandler(async (req: AuthRequest, res: Response) => {
    const requesterRole = req.user?.role;
    const requesterEmail = req.user?.email?.toLowerCase();
    const isSuperAdmin = requesterRole === 'super_admin' || requesterEmail === 'govindsharma2839@gmail.com' || requesterEmail === 'govind@mealfit.in';

    if (!isSuperAdmin) {
      throw new AppError('Forbidden: Only Super Admin can modify user roles', 403);
    }

    const { targetUserId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin', 'super_admin'].includes(role)) {
      throw new AppError('Invalid role specified', 400);
    }

    const user = await User.findByIdAndUpdate(targetUserId, { role }, { new: true }).select('-passwordHash');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return res.status(200).json(createSuccessResponse(AuthController.sanitizeUser(user), `User role updated to ${role}`));
  });
}
