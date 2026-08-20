import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from './user.model';
import { config } from '../../config/env';
import { AppError, asyncHandler } from '../../shared/errorHandler';
import { createSuccessResponse, AuthRequest } from '../../shared/types';

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { fullName, email, password, gender, dateOfBirth, heightCm, dietaryPreference, weeklyBudgetInr, preferredLanguage } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    let passwordHash = undefined;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await User.create({
      fullName,
      email,
      passwordHash,
      gender,
      dateOfBirth,
      heightCm,
      dietaryPreference,
      weeklyBudgetInr: weeklyBudgetInr || 1000,
      preferredLanguage: preferredLanguage || 'en',
    });

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    return res.status(201).json(
      createSuccessResponse(
        {
          token,
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth,
            heightCm: user.heightCm,
            dietaryPreference: user.dietaryPreference,
            weeklyBudgetInr: user.weeklyBudgetInr,
            preferredLanguage: user.preferredLanguage,
          },
        },
        'User registered successfully'
      )
    );
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    return res.status(200).json(
      createSuccessResponse(
        {
          token,
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth,
            heightCm: user.heightCm,
            dietaryPreference: user.dietaryPreference,
            weeklyBudgetInr: user.weeklyBudgetInr,
            preferredLanguage: user.preferredLanguage,
          },
        },
        'Login successful'
      )
    );
  });

  static getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return res.status(200).json(createSuccessResponse(user, 'Profile retrieved'));
  });

  static updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const updates = req.body;

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-passwordHash');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return res.status(200).json(createSuccessResponse(user, 'Profile updated successfully'));
  });
}
