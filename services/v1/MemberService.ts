import { IMember } from "@interfaces/v1/member";
import prisma from "@loaders/v1/prisma";

class MemberService {
  static async getAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [members, total] = await Promise.all([
      prisma.member.findMany({
        include: {
          user: true,
          community: true
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit
      }),
      prisma.member.count()
    ]);

    return {
      members,
      total,
      pages: Math.ceil(total / limit),
      page
    };
  }

  static async getSingle(id: number) {
    return prisma.member.findUnique({
      where: { id },
      include: {
        user: true,
        community: true
      }
    });
  }

  static async getByUserId(userId: number) {
    return prisma.member.findMany({
      where: { userId },
      include: {
        community: true
      }
    });
  }

  static async getByCommunityId(communityId: number) {
    return prisma.member.findMany({
      where: { communityId },
      include: {
        user: true
      }
    });
  }

  static async checkMemberExistence(userId: number, communityId: number) {
    return prisma.member.findFirst({
      where: {
        communityId,
        userId
      }
    });
  }

  static async checkCommunityAdmin(userId: number, communityId: number) {
    return prisma.member.findFirst({
      where: {
        userId,
        communityId,
        role: 'Community Admin'
      }
    });
  }

  static async create(data: IMember) {
    return prisma.member.create({
      data
    });
  }

  static async update(id: number, data: Partial<IMember>) {
    return prisma.member.update({
      where: { id },
      data
    });
  }

  static async delete(id: number) {
    return prisma.member.delete({
      where: { id }
    });
  }
}

export default MemberService; 