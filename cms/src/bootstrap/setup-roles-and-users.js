/**
 * Strapi Bootstrap Script
 * Sets up roles and creates initial admin users
 * Run this on first Strapi startup
 */

module.exports = async () => {
  console.log('🚀 Setting up roles and users for ProjectDes Academy CMS...');

  try {
    // 1. Create or update Content Editor role
    let contentEditorRole = await strapi.db.query('admin::role').findOne({
      where: { name: 'Content Editor' }
    });

    if (!contentEditorRole) {
      contentEditorRole = await strapi.db.query('admin::role').create({
        data: {
          name: 'Content Editor',
          code: 'content-editor',
          description: 'Can create and edit content but needs approval to publish',
        }
      });
      console.log('✅ Created Content Editor role');
    }

    // 2. Create or update Super Admin role
    let superAdminRole = await strapi.db.query('admin::role').findOne({
      where: { name: 'Super Admin' }
    });

    if (!superAdminRole) {
      superAdminRole = await strapi.db.query('admin::role').create({
        data: {
          name: 'Super Admin',
          code: 'super-admin',
          description: 'Full control with content approval authority',
        }
      });
      console.log('✅ Created Super Admin role');
    }

    // 3. Create default Super Admin user (if not exists)
    const defaultSuperAdmin = await strapi.db.query('admin::user').findOne({
      where: { email: 'superadmin@projectdes.ai' }
    });

    if (!defaultSuperAdmin) {
      const hashedPassword = await strapi.service('admin::auth').hashPassword('SuperAdmin2025!');
      
      await strapi.db.query('admin::user').create({
        data: {
          firstname: 'Super',
          lastname: 'Admin',
          email: 'superadmin@projectdes.ai',
          password: hashedPassword,
          isActive: true,
          roles: [superAdminRole.id],
          blocked: false,
          preferedLanguage: 'en'
        }
      });
      console.log('✅ Created default Super Admin user');
      console.log('   Email: superadmin@projectdes.ai');
      console.log('   Password: SuperAdmin2025! (CHANGE THIS!)');
    }

    // 4. Create sample Content Editor user (if not exists)
    const defaultEditor = await strapi.db.query('admin::user').findOne({
      where: { email: 'editor@projectdes.ai' }
    });

    if (!defaultEditor) {
      const hashedPassword = await strapi.service('admin::auth').hashPassword('Editor2025!');
      
      await strapi.db.query('admin::user').create({
        data: {
          firstname: 'Content',
          lastname: 'Editor',
          email: 'editor@projectdes.ai',
          password: hashedPassword,
          isActive: true,
          roles: [contentEditorRole.id],
          blocked: false,
          preferedLanguage: 'ru' // Russian as default for content editor
        }
      });
      console.log('✅ Created default Content Editor user');
      console.log('   Email: editor@projectdes.ai');
      console.log('   Password: Editor2025! (CHANGE THIS!)');
    }

    // 5. Set up permissions for Content Editor role
    await setupContentEditorPermissions(contentEditorRole.id);
    
    // 6. Set up permissions for Super Admin role
    await setupSuperAdminPermissions(superAdminRole.id);

    console.log('✅ Roles and users setup completed!');

  } catch (error) {
    console.error('❌ Error setting up roles and users:', error);
  }
};

async function setupContentEditorPermissions(roleId) {
  // Translation permissions
  const translationPermissions = [
    { action: 'api::translation.translation.find' },
    { action: 'api::translation.translation.findOne' },
    { action: 'api::translation.translation.create' },
    { action: 'api::translation.translation.update', conditions: ['created_by_id'] }, // Only own content
    { action: 'api::translation.translation.submitForApproval' }
  ];

  // Media permissions
  const mediaPermissions = [
    { action: 'plugin::upload.content-api.find' },
    { action: 'plugin::upload.content-api.findOne' },
    { action: 'plugin::upload.content-api.upload' },
    { action: 'plugin::upload.content-api.destroy', conditions: ['created_by_id'] }
  ];

  // Content manager permissions
  const contentManagerPermissions = [
    { action: 'plugin::content-manager.explorer.find' },
    { action: 'plugin::content-manager.explorer.findOne' },
    { action: 'plugin::content-manager.explorer.create' },
    { action: 'plugin::content-manager.explorer.update', conditions: ['created_by_id'] }
  ];

  // Create permissions
  for (const perm of [...translationPermissions, ...mediaPermissions, ...contentManagerPermissions]) {
    await strapi.db.query('admin::permission').create({
      data: {
        ...perm,
        role: roleId
      }
    });
  }

  console.log('   ✅ Content Editor permissions configured');
}

async function setupSuperAdminPermissions(roleId) {
  // Give all permissions to Super Admin
  const allPermissions = [
    // Translation full control
    { action: 'api::translation.translation.find' },
    { action: 'api::translation.translation.findOne' },
    { action: 'api::translation.translation.create' },
    { action: 'api::translation.translation.update' },
    { action: 'api::translation.translation.delete' },
    { action: 'api::translation.translation.publish' },
    { action: 'api::translation.translation.unpublish' },
    { action: 'api::translation.translation.approve' },
    { action: 'api::translation.translation.reject' },
    { action: 'api::translation.translation.getPendingApprovals' },
    { action: 'api::translation.translation.getApprovalStats' },
    
    // Media full control
    { action: 'plugin::upload.content-api.find' },
    { action: 'plugin::upload.content-api.findOne' },
    { action: 'plugin::upload.content-api.upload' },
    { action: 'plugin::upload.content-api.destroy' },
    
    // Admin panel access
    { action: 'admin::marketplace.read' },
    { action: 'admin::marketplace.plugins.install' },
    { action: 'admin::marketplace.plugins.uninstall' },
    { action: 'admin::users.create' },
    { action: 'admin::users.read' },
    { action: 'admin::users.update' },
    { action: 'admin::users.delete' },
    { action: 'admin::roles.create' },
    { action: 'admin::roles.read' },
    { action: 'admin::roles.update' },
    { action: 'admin::roles.delete' },
    
    // Content manager full control
    { action: 'plugin::content-manager.explorer.create' },
    { action: 'plugin::content-manager.explorer.read' },
    { action: 'plugin::content-manager.explorer.update' },
    { action: 'plugin::content-manager.explorer.delete' },
    { action: 'plugin::content-manager.explorer.publish' },
    { action: 'plugin::content-manager.explorer.unpublish' }
  ];

  // Create permissions
  for (const perm of allPermissions) {
    await strapi.db.query('admin::permission').create({
      data: {
        ...perm,
        role: roleId
      }
    });
  }

  console.log('   ✅ Super Admin permissions configured');
}