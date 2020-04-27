import { Router } from 'express';
import { getRepository, getCustomRepository } from 'typeorm';
import multer from 'multer';
import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import Transaction from '../models/Transaction';

const upload = multer(uploadConfig);
const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getRepository(Transaction);
  const transactionsCustomRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find({
    select: [
      'id',
      'title',
      'value',
      'type',
      'category_id',
      'created_at',
      'updated_at'
    ],
    relations: ['category'],
    });

  const balance = await transactionsCustomRepository.getBalance(transactions);

  return response.json({transactions, balance});
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  })

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  await new DeleteTransactionService().execute(id);

  return response.status(204).send();
});

transactionsRouter.post('/import', upload.single('files'), async (request, response) => {
  const importTransactionsService = new ImportTransactionsService();

  const importedTransactions = await importTransactionsService.execute(request.file.filename);

  return response.json(importedTransactions);
});

export default transactionsRouter;
