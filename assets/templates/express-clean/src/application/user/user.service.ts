import type { User } from '../../domain/user'
import type {
  UserCreateInput,
  UserRepository,
  UserUpdateInput
} from '../../domain/user-repository'

export class UserService {
  constructor(private readonly repository: UserRepository) {}

  async create(input: UserCreateInput): Promise<User> {
    return this.repository.create(input)
  }

  async list(): Promise<User[]> {
    return this.repository.findAll()
  }

  async getById(id: number): Promise<User | null> {
    return this.repository.findById(id)
  }

  async update(id: number, input: UserUpdateInput): Promise<User | null> {
    return this.repository.update(id, input)
  }

  async remove(id: number): Promise<boolean> {
    return this.repository.delete(id)
  }
}
