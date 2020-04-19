import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';
import CategoryRepository from '../repositories/CategoryRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({ title, value, type, category } : Request): Promise<Transaction> {
    const transactionsRepository = getRepository(Transaction);
    const transactionsCustomRepo = getCustomRepository(TransactionRepository);
    const transactions = await transactionsRepository.find();

    if(type === "outcome") {
      const { total = 0 } = await transactionsCustomRepo.getBalance(transactions);

      if(value > total) {
        throw new AppError('You dont have enough credit to complete this transaction', 400);
      }
    }
    const categoryRepository = new CategoryRepository();

    const categoryVerified = await categoryRepository.createCategory(category);

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryVerified.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
