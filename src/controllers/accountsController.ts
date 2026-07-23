import type { Request, Response } from 'express';
import prisma from '../db.ts';


export const getUserAccounts = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId || Array.isArray(userId)) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const accounts = await prisma.account.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        accountNumber: true,
        type: true,
        initialBalance: true,
        createdAt: true,
        currency: true,
        bank: {
          select: {
            name: true,
            logo: true,
          },
        },
        transactions: {
          where: {
            status: 'POSTED',
          },
          select: {
            entryType: true,
            amount: true,
          },
        },
      },
    });

    const responseData = accounts.map(({
      bank,
      initialBalance,
      transactions,
      ...account
    }) => {
      const balance = transactions.reduce(
        (currentBalance, transaction) => (
          transaction.entryType === 'CREDIT'
            ? currentBalance.plus(transaction.amount)
            : currentBalance.minus(transaction.amount)
        ),
        initialBalance,
      );

      return {
        ...account,
        bankName: bank.name,
        bankLogo: bank.logo,
        balance: balance.toFixed(2),
      };
    });

    res.status(200).json(responseData);
  } catch (err) {
    console.error('Error fetching user accounts:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
