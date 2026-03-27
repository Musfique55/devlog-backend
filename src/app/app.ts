import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../lib/auth';
import { indexRoutes } from './routes/router';
import cookieParser from 'cookie-parser';
import { globalErrorHandler } from './middleware/globalErrorHandler';
import { notFound } from './middleware/notFound';
import cron from "node-cron"
import { inviteServices } from './module/invite/invite.services';
import path from "path";

dotenv.config();

const app = express();

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), "src/app/templates"));

app.use(cors());

app.use("/api/auth", toNodeHandler(auth));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


cron.schedule("0 0 * * *",async () => {
  await inviteServices.updateExpiredTokens();
})


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use("/api/v1",indexRoutes);

app.use(globalErrorHandler);
app.use(notFound);

export default app;