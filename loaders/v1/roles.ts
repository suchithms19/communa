import prisma from '../../src/config/prisma';
import Logger from '../../universe/v1/libraries/logger';

interface RoleType {
  name: string;
}

const defaultRoles: RoleType[] = [
  { name: 'Community Admin' },
  { name: 'Community Moderator' },
  { name: 'Community Member' }
];

const initializeRoles = async (): Promise<void> => {
  try {
    for (const role of defaultRoles) {
      const existingRole = await prisma.role.findFirst({
        where: { name: role.name }
      });
      if (!existingRole) {
        await prisma.role.create({
          data: role
        });
      }
    }
    Logger.instance.info('Roles initialization completed');
  } catch (error) {
    Logger.instance.error('Error initializing roles:', error);
  }
};

export { defaultRoles, initializeRoles };
