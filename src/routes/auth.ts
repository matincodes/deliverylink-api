import express, { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // For password hashing
import session from 'express-session';
import cookieParser from 'cookie-parser';


const prisma = new PrismaClient();

const app = express();

// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;

app.use(session({
    secret: 'secret-key',
    resave: false,
    cookie: {maxAge: oneDay},
    saveUninitialized: true,
}));

app.use(cookieParser());


const router = Router();
app.use(router)

declare module 'express-session' {
    interface Session {
      userId?: string; 
    }
  }


router.post('/signup', async (req: Request, res: Response) => {
    const { userName, password } = req.body;

    try {
        if (!req.body.userName) {
            // Handle the case of missing username, e.g., return an error
            return res.status(400).json({ error: 'Username is required' });
          }

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
    
                if (req.session) {
                req.session.userId = newUser.id;
            } else {
                // Handle the case where session is not available
                console.error('Session is not initialized');
            }
    
            res.json({ success: true, message: 'Signup successful', user: newUser });
        }                                                                             

    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/login', async (req: Request, res: Response) => {
    const { userName, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { userName },
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            req.session.userId = user.id; // Store user ID in session
            res.json({ success: true, message: 'Login successful', user });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

export function verifySession(req: Request, res: Response, next: NextFunction) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    next();
}

export default router;