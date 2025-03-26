import { IUser, IUserCreate } from "@interfaces/v1/user";
import prisma from "@loaders/v1/prisma";
import { UserColumn } from "@schema/v1/UserColumn";
import collections from "@schema/v1/meta";
import bcrypt from "bcryptjs";

class UserService {
  static async getAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit
      }),
      prisma.user.count()
    ]);

    return {
      users,
      total,
      pages: Math.ceil(total / limit),
      page
    };
  }

  static async getSingle(id: number) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });
  }

  static async getByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });
  }

  static async create(data: IUserCreate) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });
  }

  static async update(id: number, data: Partial<IUser>) {
    // If password is being updated, hash it
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });
  }

  static async delete(id: number) {
    return prisma.user.delete({
      where: { id }
    });
  }

  static async getUserWithPassword(id: number) {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  static async getByEmailWithPassword(email: string) {
    return prisma.user.findUnique({
      where: { email }
    });
  }
}

export default UserService;