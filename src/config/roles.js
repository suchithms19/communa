const Role = require('../models/Role');

const defaultRoles = [
  {
    name: 'Community Admin'
  },
  {
    name: 'Community Moderator'
  },
  {
    name: 'Community Member'
  }
];

const initializeRoles = async () => {
  try {
    for (const role of defaultRoles) {
      const existingRole = await Role.findOne({ name: role.name });
      if (!existingRole) {
        await Role.create(role);
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