import { EntityRepository, Repository, getRepository } from 'typeorm';

import Category from '../models/Category';

@EntityRepository(Category)
class CategoryRepository extends Repository<Category> {
  public async createCategory(category: string): Promise<Category> {
    const categoriesRepository = getRepository(Category);

    const categoryExists = await categoriesRepository.findOne({
      where: { title: category }
    })

    if(!categoryExists) {
      const newCategory = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(newCategory);

      return newCategory;
    }
    else {

      return categoryExists;
    }
  }
}

export default CategoryRepository;
