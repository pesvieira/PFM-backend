import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import usersRouter from './routes/usersRoutes.ts';
import accountsRouter from './routes/accountsRoutes.ts';
import transactionsRouter from './routes/transactionsRoutes.ts';

const app = express();

app.use(helmet());
app.use(helmet.hidePoweredBy());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());


app.use('/api/users', usersRouter);

app.use('/api/accounts', accountsRouter);

app.use('/api/transactions', transactionsRouter);

export default app;
