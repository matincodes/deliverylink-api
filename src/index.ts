import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from "cors";
import * as dotenv from 'dotenv';
import authRoutes from './routes/auth';
import itemsRoutes from './routes/items';


dotenv.config();

const app = express();
const port = process.env.PORT  || 3000;


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
