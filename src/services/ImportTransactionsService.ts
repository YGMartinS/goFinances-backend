import { getRepository, In } from 'typeorm';
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
  async execute(file_name: string): Promise<Transaction[]> {
    //Converting CSV File to JSON
    const transactions: TransactionDTO[] = csvToJson
    .fieldDelimiter(',')
    .getJsonFromCsv(path.resolve(__dirname, '..', '..', `./tmp/${file_name}`));
    //Verifying existing categories in database
    const categories = transactions.map(transaction => transaction.category);
    const categoriesRepository = getRepository(Category);

    const existentCategories = await categoriesRepository.find({
      where: { title: In(categories) }
    });

    const existentCategoriesTitles = existentCategories.map(
      category => category.title
    );

    const addCategories = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      addCategories.map(title => ({
        title,
      }))
    );

    await categoriesRepository.save(newCategories);

    //Adding all transactions with only ONE CONNECTION to the database.
    //BULK Insert                                                         //CONVENTIONAL FORM
    const transactionsRepository = getRepository(Transaction);            //const createTransaction = new CreateTransactionService();
    const allCategories = [ ...newCategories, ...existentCategories ];

    const importedTransactions = transactionsRepository.create(           //const importedTransactions: Transaction[] = [];
      transactions.map(transaction => ({                                  //for(let i = 0; transactions.length > i; i++){
        title: transaction.title,                                         //  const { title, value, type, category} = transactions[i];
        value: transaction.value,                                         //  const transactionCreated = await createTransaction.execute({
        type: transaction.type,                                           //  title, value, type, category });
        category: allCategories.find(                                     //  importedTransactions.push(transactionCreated);
          category => category.title === transaction.category),           //}
      }))
    )

    await transactionsRepository.save(importedTransactions);

    return importedTransactions;
  }
}

export default ImportTransactionsService;
