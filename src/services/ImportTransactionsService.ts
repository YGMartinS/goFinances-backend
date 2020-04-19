import { getRepository } from 'typeorm';
import csvToJson from 'convert-csv-to-json';
import path from 'path';

import CreateTransactionService from '../services/CreateTransactionService';

import Transaction from '../models/Transaction';
import Category from '../models/Category';


interface TransactionDTO{
  title: string;
  value: number;
  type: "income" | "outcome";
  category: string;
}

class ImportTransactionsService {
  async execute(): Promise<Transaction[]> {

    const transactions: TransactionDTO[] = csvToJson
    .fieldDelimiter(',')
    .getJsonFromCsv(path.resolve(__dirname, '..', './archives/file.csv'));

    const createTransaction = new CreateTransactionService();

    const importedTransactions: Transaction[] = [];
    let index = 0;
    while(transactions.length > index){
      const { title, value, type, category} = transactions[index];
      const transactionCreated = await createTransaction.execute({
        title,
        value,
        type,
        category
      })
      index+=1;
      importedTransactions.push(transactionCreated);
    }

    return importedTransactions;
  }
}

export default ImportTransactionsService;
