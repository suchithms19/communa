const Role = require('../models/Role');

const defaultRoles = [
  {
    name: 'Community Admin',
    scopes: [
      'community.member.add',
      'community.member.remove',
      'community.member.view',
      'community.view',
      'community.update',
      'community.delete'
    ]
  },
  {
    name: 'Community Moderator',
    scopes: [
      'community.member.view',
      'community.member.add',
      'community.member.remove',
      'community.view',
    ]
  },
  {
    name: 'Community Member',
    scopes: [
      'community.view',
      'community.member.view'
    ]
  }
];

const initializeRoles = async () => {
  try {
    for (const role of defaultRoles) {
      const existingRole = await Role.findOne({ name: role.name });
      if (!existingRole) {
        await Role.create(role);
        console.log(`Created role: ${role.name}`);
      }
    }
    console.log('Roles initialization completed');
  } catch (error) {
    console.error('Error initializing roles:', error);
  }
};

module.exports = {
  defaultRoles,
  initializeRoles
}; 