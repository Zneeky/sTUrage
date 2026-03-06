import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { apiLimiter } from './middleware/rateLimiter';
import routes from './routes';

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiLimiter);
app.use('/api', routes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
