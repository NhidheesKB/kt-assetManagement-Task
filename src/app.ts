import express, { type Request, type Response } from 'express';
import path from 'node:path';
import cors from 'cors';
import apiRouter from './routes/index.js';
import viewRouter from './routes/view.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

export const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(process.cwd(), 'views'));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));

app.use('/', viewRouter);
app.use('/api', apiRouter);

app.use((req: Request, res: Response) => {
  if (req.accepts('html')) {
    res.status(404).send('<h2>404 - Page Not Found</h2><p><a href="/">Back to Home</a></p>');
    return;
  }
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

app.use(errorHandler);

export default app;
