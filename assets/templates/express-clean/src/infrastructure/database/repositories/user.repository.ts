import type { DataSource, Repository } from 'typeorm'
import type { User } from '../../../domain/user'
import type {
  UserCreateInput,
  UserRepository,
  UserUpdateInput
} from '../../../domain/user-repository'
import { UserEntity } from '../entities/user.entity'

export class TypeOrmUserRepository implements UserRepository {
  private readonly repository: Repository<UserEntity>

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(UserEntity)
  }

  async create(input: UserCreateInput): Promise<User> {
    const entity = this.repository.create(input)
    const saved = await this.repository.save(entity)
    return toDomain(saved)
  }

  async findAll(): Promise<User[]> {
    const entities = await this.repository.find()
    return entities.map(toDomain)
  }

  async findById(id: number): Promise<User | null> {
    const entity = await this.repository.findOneBy({ id })
    return entity ? toDomain(entity) : null
  }

  async update(id: number, input: UserUpdateInput): Promise<User | null> {
    const entity = await this.repository.findOneBy({ id })
    if (!entity) {
      return null
    }

    this.repository.merge(entity, input)
    const saved = await this.repository.save(entity)
    return toDomain(saved)
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete({ id })
    return Boolean(result.affected)
  }
}

function toDomain(entity: UserEntity): User {
  return {
    id: entity.id,
    name: entity.name,
    email: entity.email,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt
  }
}
