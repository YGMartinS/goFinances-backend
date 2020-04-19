import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(transactions: Transaction[]): Promise<Balance> {

    const totalIncome = transactions
      .filter(transaction => transaction.type === 'income')
      .map(transaction => transaction.value)
      .reduce(function(acumulador, atual) {
        return acumulador + atual
      }, 0);

    const totalOutcome = transactions
      .filter(transaction => transaction.type === 'outcome')
      .map(transaction => transaction.value)
      .reduce(function(acumulador, atual) {
        return acumulador + atual
      }, 0);

    const total = totalIncome - totalOutcome;

    const balance: Balance = {
      income: totalIncome,
      outcome: totalOutcome,
      total
    }

    return balance;
  }
}

export default TransactionsRepository;
