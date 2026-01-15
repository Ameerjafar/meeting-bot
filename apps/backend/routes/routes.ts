import express from 'express';
import { authRouter } from './authRouter';

export const router = express.Router();

router.use('/auth', authRouter);