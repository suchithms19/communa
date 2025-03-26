import { IRole } from "@interfaces/v1/role";
import prisma from "@loaders/v1/prisma";
import { RoleColumn } from "@schema/v1/RoleColumn";
import collections from "@schema/v1/meta";

class RoleService {
  static async getAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit
      }),
      prisma.role.count()
    ]);

    return {
      roles,
      total,
      pages: Math.ceil(total / limit),
      page
    };
  }

  static async getSingle(id: number) {
    return prisma.role.findUnique({
      where: { id }
    });
  }

  static async getByName(name: string) {
    return prisma.role.findFirst({
      where: { name }
    });
  }

  static async create(data: IRole) {
    return prisma.role.create({
      data
    });
  }

  static async update(id: number, data: Partial<IRole>) {
    return prisma.role.update({
      where: { id },
      data
    });
  }

  static async delete(id: number) {
    return prisma.role.delete({
      where: { id }
    });
  }
}

export default RoleService; 