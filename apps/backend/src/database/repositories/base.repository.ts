import {
  Attributes,
  CreationAttributes,
  ModelStatic,
  Transaction,
  WhereOptions,
} from 'sequelize';
import { Model } from 'sequelize-typescript';
import { MakeNullishOptional } from 'sequelize/types/utils';

export class BaseRepository<T extends Model> {
  constructor(protected model: ModelStatic<T>) {}

  async findAll() {
    return this.model.findAll();
  }

  async findById(id: string) {
    return this.model.findByPk(id);
  }
  async findOneBy(where: WhereOptions<Attributes<T>>) {
    return this.model.findOne({ where });
  }

  async findAllBy(where: WhereOptions<Attributes<T>>) {
    return this.model.findAll({ where });
  }

  async create(
    data: MakeNullishOptional<T['_creationAttributes']>,
    transaction?: Transaction,
  ) {
    return this.model.create(data, { transaction });
  }

  async update(
    id: string,
    data: MakeNullishOptional<T['_creationAttributes']>,
    transaction: Transaction,
  ) {
    const record = await this.model.findByPk(id);
    if (record) {
      return record.update(data, { transaction });
    }
    return null;
  }

  async updateWhere(
    where: WhereOptions<Attributes<T>>,
    data: CreationAttributes<T>,
    transaction: Transaction,
  ) {
    return this.model.update(data, { where, transaction });
  }

  async delete(where: WhereOptions<Attributes<T>>, transaction: Transaction) {
    return this.model.destroy({ where, transaction });
  }
}
