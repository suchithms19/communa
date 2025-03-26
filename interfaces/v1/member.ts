export interface IMember {
  id?: number;
  userId: number;
  communityId: number;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
} 