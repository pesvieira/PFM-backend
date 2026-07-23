import type { Request, Response } from 'express';
import prisma from '../db.ts';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const YEAR_MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

export const getTransactionsByAccountAndEffectiveDate = async (
  req: Request,
  res: Response,
) => {
  try {
    const { accountId, effectiveDate } = req.body as {
      accountId?: unknown;
      effectiveDate?: unknown;
    };

    if (typeof accountId !== 'string' || !UUID_PATTERN.test(accountId)) {
      return res.status(400).json({ error: 'A valid account ID is required' });
    }

    if (typeof effectiveDate !== 'string') {
      return res.status(400).json({ error: 'Effective date is required' });
    }

    const effectiveDateMatch = YEAR_MONTH_PATTERN.exec(effectiveDate);
    if (!effectiveDateMatch) {
      return res.status(400).json({
        error: 'Effective date must use the YYYY-MM format',
      });
    }

    const year = Number(effectiveDateMatch[1]);
    const monthIndex = Number(effectiveDateMatch[2]) - 1;
    const monthStart = new Date(Date.UTC(
      year,
      monthIndex,
      1,
    ));
    const nextMonthStart = new Date(Date.UTC(
      year,
      monthIndex + 1,
      1,
    ));

    const transactions = await prisma.transaction.findMany({
      where: {
        accountId,
        entryType: 'DEBIT',
        effectiveDate: {
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
      select: {
        id: true,
        categoryId: true,
        category: {
          select: {
            name: true,
            color: true,
            icon: true,
          },
        },
        project: {
          select: {
            name: true,
          },
        },
        scheduledTransactionId: true,
        transferTransactionId: true,
        entryType: true,
        amount: true,
        description: true,
        status: true,
        transactionDate: true,
        effectiveDate: true,
      },
      orderBy: [
        { category: { name: 'asc' } },
        { transactionDate: 'desc' },
      ],
    });

    const categories = new Map<string, {
      categoryId: string;
      categoryName: string;
      categoryColor: string | null;
      categoryIcon: string | null;
      transactions: Array<{
        id: string;
        projectName: string | null;
        scheduledTransactionId: string | null;
        transferTransactionId: string | null;
        entryType: string;
        amount: string;
        description: string | null;
        status: string;
        transactionDate: Date;
        effectiveDate: Date;
      }>;
    }>();

    for (const {
      categoryId,
      category,
      project,
      amount,
      ...transaction
    } of transactions) {
      const categoryGroup = categories.get(categoryId) ?? {
        categoryId,
        categoryName: category.name,
        categoryColor: category.color,
        categoryIcon: category.icon,
        transactions: [],
      };

      categoryGroup.transactions.push({
        ...transaction,
        projectName: project?.name ?? null,
        amount: amount.toFixed(2),
      });
      categories.set(categoryId, categoryGroup);
    }

    return res.status(200).json(Array.from(categories.values()));
  } catch (err) {
    console.error('Error fetching transactions by effective date:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTransactionByAccountId = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    if (!accountId || Array.isArray(accountId)) {
      return res.status(400).json({ error: 'Account ID is required' });
    }

    const transactions = await prisma.transaction.findMany({
      where: { accountId },
      select: {
        id: true,
        account: {
          select: {
            name: true,
          },
        },
        category: {
          select: {
            name: true,
            icon: true,
          },
        },
        project: {
          select: {
            name: true,
          },
        },
        scheduledTransactionId: true,
        transferTransactionId: true,
        entryType: true,
        amount: true,
        description: true,
        status: true,
        transactionDate: true,
        effectiveDate: true,
      },
    });

    const responseData = transactions.map(({
      account,
      category,
      project,
      ...transaction
    }) => ({
      id: transaction.id,
      accountName: account.name,
      categoryName: category.name,
      categoryIcon: category.icon,
      projectName: project?.name ?? null,
      scheduledTransactionId: transaction.scheduledTransactionId,
      transferTransactionId: transaction.transferTransactionId,
      entryType: transaction.entryType,
      amount: transaction.amount,
      description: transaction.description,
      status: transaction.status,
      transactionDate: transaction.transactionDate,
      effectiveDate: transaction.effectiveDate,
    }));

    res.status(200).json(responseData);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
