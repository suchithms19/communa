import { ICommunity } from "@interfaces/v1/community";
import prisma from "@loaders/v1/prisma";
import { CommunityColumn } from "@schema/v1/CommunityColumn";
import collections from "@schema/v1/meta";

// Function to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

class CommunityService {
  static async getAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        include: {
          members: {
            where: { role: 'Community Admin' },
            include: { user: true }
          }
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit
      }),
      prisma.community.count()
    ]);

    return {
      communities,
      total,
      pages: Math.ceil(total / limit),
      page
    };
  }

  static async getUserCommunities(userId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        where: {
          members: {
            some: {
              userId,
              role: 'Community Admin'
            }
          }
        },
        include: {
          members: {
            where: { role: 'Community Admin' },
            include: { user: true }
          }
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit
      }),
      prisma.community.count({
        where: {
          members: {
            some: {
              userId,
              role: 'Community Admin'
            }
          }
        }
      })
    ]);

    return {
      communities,
      total,
      pages: Math.ceil(total / limit),
      page
    };
  }

  static async getUserMemberships(userId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        where: {
          members: {
            some: {
              userId
            }
          }
        },
        include: {
          members: {
            where: { 
              role: 'Community Admin'
            },
            include: { user: true }
          }
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit
      }),
      prisma.community.count({
        where: {
          members: {
            some: {
              userId
            }
          }
        }
      })
    ]);

    return {
      communities,
      total,
      pages: Math.ceil(total / limit),
      page
    };
  }

  static async getSingle(id: number) {
    return prisma.community.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });
  }

  static async getBySlug(slug: string) {
    return prisma.community.findUnique({
      where: { slug },
      include: {
        members: {
          include: {
            user: true
          }
        }
      }
    });
  }

  static async create(name: string, userId: number) {
    const slug = generateSlug(name);
    
    return prisma.community.create({
      data: {
        name,
        slug,
        members: {
          create: {
            userId,
            role: 'Community Admin'
          }
        }
      }
    });
  }

  static async update(id: number, data: Partial<ICommunity>) {
    // If name is being updated, regenerate the slug
    if (data.name) {
      data.slug = generateSlug(data.name);
    }
    
    return prisma.community.update({
      where: { id },
      data
    });
  }

  static async delete(id: number) {
    // Delete all members first
    await prisma.member.deleteMany({
      where: { communityId: id }
    });
    
    // Then delete the community
    return prisma.community.delete({
      where: { id }
    });
  }
}

export default CommunityService; 