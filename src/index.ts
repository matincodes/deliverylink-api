import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import cors from "cors";
import * as dotenv from 'dotenv';
import authRoutes from './routes/auth';
import itemsRoutes from './routes/items';
import cookieParser from 'cookie-parser';


dotenv.config();

const app = express();
const port = process.env.PORT  || 3000;

app.use(cookieParser());

// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;

// Set up session and cookie middleware
app.use(session({
  secret: 'secret-key',
  resave: false,
  cookie: {maxAge: oneDay},
  saveUninitialized: true,
}));

const corsOptions: cors.CorsOptions = {
  origin: 'http://localhost:5173', 
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());




app.use((err: Error, req: Request, res: Response, next: () => void) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.use('/auth', authRoutes);
app.use('/items', itemsRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
