import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest, authenticateJwt } from '../../shared/validate';
import { RegisterUserSchema, LoginUserSchema, UpdateProfileSchema } from './auth.dto';

const router = Router();

router.post('/register', validateRequest(RegisterUserSchema), AuthController.register);
router.post('/login', validateRequest(LoginUserSchema), AuthController.login);
router.get('/profile', authenticateJwt, AuthController.getProfile);
router.get('/me', authenticateJwt, AuthController.getProfile);
router.patch('/profile', authenticateJwt, validateRequest(UpdateProfileSchema), AuthController.updateProfile);
router.put('/profile', authenticateJwt, validateRequest(UpdateProfileSchema), AuthController.updateProfile);

export const authRoutes = router;
