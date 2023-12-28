import express, { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // For password hashing



const prisma = new PrismaClient();

const app = express();



const router = Router();
app.use(router)

declare module 'express-session' {
    interface Session {
      userId?: string; 
    }
  }



router.post('/signup', async (req: Request, res: Response) => {
    const {userName, password } = req.body;
       
    try {

        const existingUser = await prisma.user.findUnique({
            where: { userName: req.body.userName },
        });

        if (existingUser?.userName) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }  else{

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: { userName, password: hashedPassword },
        });
    
        res.json({ success: true, message: 'Signup successful', user: newUser });
        console.log("sign successful")

        }                                                                             

    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/login', async (req: Request, res: Response, next:NextFunction) => {
    const { userName, password } = req.body;


    try {
        const user = await prisma.user.findUnique({
            where: { userName },
        });
        
        if (user){
            const passwordMatch = await bcrypt.compare(password, user?.password);
            if (user && passwordMatch) {
                req.session.userId = user?.id; // Store user ID in session
    
                console.log(req.session.userId)
                res.json({ success: true, message: 'Login successful', user });
                res.locals.session = req.session;
                next();
            }
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export function verifySession(req: Request, res: Response, next: NextFunction) {

    console.log("verify", req.session.userId, req.session, req.url, req.method)
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized session' });
    }

    next();
}

export default router;