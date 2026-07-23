import express from 'express';
import { getUserAccounts } from '../controllers/accountsController.ts';

const router = express.Router();

router.get('/:userId', getUserAccounts);

export default router;
