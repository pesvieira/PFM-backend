import express from 'express';
import { getUserById } from '../controllers/usersController.ts';


const router = express.Router();

router.get('/:userId', getUserById);

export default router;
