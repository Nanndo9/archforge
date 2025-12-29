import type { User } from './user'

export type UserCreateInput = {
  name: string
  email: string
}

export type UserUpdateInput = {
  name?: string
  email?: string
}

export interface UserRepository {
  create(input: UserCreateInput): Promise<User>
  findAll(): Promise<User[]>
  findById(id: number): Promise<User | null>
  update(id: number, input: UserUpdateInput): Promise<User | null>
  delete(id: number): Promise<boolean>
}
