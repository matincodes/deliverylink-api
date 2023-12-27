import express, { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifySession } from './auth'; // Verify user session


const router = Router();
const prisma = new PrismaClient();



router.get('/', verifySession, async (req: Request, res: Response) => {

    const userId = req.session.userId;
    console.log("items", req.session)
    try {
        const items = await prisma.item.findMany({
            where: { userId },
        });

        res.json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/', verifySession, async (req: Request, res: Response) => {
    const { title, userId } = req.body;

    try {
        if (!req.session.userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
          }
          
        const newItem = await prisma.item.create({
            data: { title, userId },
        });

        res.json({ success: true, item: newItem });
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.put('/:id', verifySession, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title } = req.body;
    const userId = req.session.userId;

    try {
        const item = await prisma.item.update({
            where: { id, userId }, // Ensure user can only update their own items
            data: { title },
        });

        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        res.json({ success: true, item });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.delete('/:id', verifySession, async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.session.userId;

    try {
        const deletedItem = await prisma.item.delete({
            where: { id, userId }, // Ensure user can only delete their own items
        });

        if (!deletedItem) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        res.json({ success: true, message: 'Item deleted' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export default router;