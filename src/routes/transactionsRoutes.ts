import express from 'express';
import {
  getTransactionByAccountId,
  getTransactionsByAccountAndEffectiveDate,
} from '../controllers/transactionsController.ts';

const router = express.Router();

router.post('/expenses-by-category', getTransactionsByAccountAndEffectiveDate);
router.get('/:accountId', getTransactionByAccountId);

export default router;
