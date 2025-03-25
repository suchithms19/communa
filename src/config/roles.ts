import prisma from './prisma';

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
    console.log('Roles initialization completed');
  } catch (error) {
    console.error('Error initializing roles:', error);
  }
};

export { defaultRoles, initializeRoles };
