import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../lib/auth';
import { indexRoutes } from './routes/router';

dotenv.config();

const app = express();
app.use(cors());

app.use("/api/auth", toNodeHandler(auth));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use("/api/v1",indexRoutes);

export default app;