export interface IUser {
  id: number;
  email: string;
  password: string;
  name: string | null;
  createdAt: Date;
}

export interface IUserCreate {
  name?: string | null;
  email: string;
  password: string;
} 