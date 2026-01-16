import express from 'express';

import { signUpController, signInController } from '../controller/authController';
export const authRouter = express.Router();

authRouter.post('/signup', signUpController);
authRouter.post('/signin', signInController);
authRouter.post('/google', googleController);