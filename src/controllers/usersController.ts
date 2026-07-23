import type { Request, Response } from 'express';
import prisma from '../db.ts';


export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId || Array.isArray(userId)) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const data = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    const responseData = {
      userId: data?.id,
      firstName: data?.firstName,
      lastName: data?.lastName,
    };

    res.status(200).json(responseData);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
