export interface IRole {
  id?: number;
  name: string;
  permissions: string[];
  createdAt?: Date;
  updatedAt?: Date;
} 