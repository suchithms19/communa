import { IUser, IUserCreate } from "@interfaces/v1/user";
import Database from "@loaders/v1/database";
import bcrypt from "bcryptjs";

class UserService {
  static async getAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      Database.instance.user.findMany({
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
      Database.instance.user.count()
    ]);

    return {
      users,
      total,
      pages: Math.ceil(total / limit),
      page
    };
  }

  static async getSingle(id: number) {
    return Database.instance.user.findUnique({
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
    return Database.instance.user.findUnique({
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
    
    return Database.instance.user.create({
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
    
    // Create the update data object with type safety
    const updateData: Record<string, any> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.password !== undefined) updateData.password = data.password;
    
    return Database.instance.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });
  }

  static async delete(id: number) {
    return Database.instance.user.delete({
      where: { id }
    });
  }

  static async getUserWithPassword(id: number) {
    return Database.instance.user.findUnique({
      where: { id }
    });
  }

  static async getByEmailWithPassword(email: string) {
    return Database.instance.user.findUnique({
      where: { email }
    });
  }
}

export default UserService;