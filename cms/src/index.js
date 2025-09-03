'use strict';

async function setupPublicPermissions(strapi) {
  console.log('🔐 Setting up public permissions for Translation API...');
  
  try {
    // Find the public role
    const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: 'public' }
    });
    
    if (!publicRole) {
      console.error('❌ Public role not found');
      return;
    }
    
    // Check if permissions already exist
    const existingPermissions = await strapi.db.query('plugin::users-permissions.permission').findMany({
      where: {
        role: publicRole.id,
        action: {
          $in: ['api::translation.translation.find', 'api::translation.translation.findOne']
        }
      }
    });
    
    // Create permissions if they don't exist
    const permissionsToCreate = [];
    const requiredActions = ['api::translation.translation.find', 'api::translation.translation.findOne'];
    
    for (const action of requiredActions) {
      const exists = existingPermissions.some(p => p.action === action);
      if (!exists) {
        permissionsToCreate.push({
          role: publicRole.id,
          action: action,
          enabled: true
        });
      }
    }
    
    if (permissionsToCreate.length > 0) {
      for (const permission of permissionsToCreate) {
        await strapi.db.query('plugin::users-permissions.permission').create({
          data: permission
        });
      }
      console.log('✅ Public permissions created for Translation API');
    } else {
      // Enable existing permissions if they're disabled
      for (const permission of existingPermissions) {
        if (!permission.enabled) {
          await strapi.db.query('plugin::users-permissions.permission').update({
            where: { id: permission.id },
            data: { enabled: true }
          });
        }
      }
      console.log('✅ Public permissions already configured for Translation API');
    }
    
  } catch (error) {
    console.error('❌ Error setting up public permissions:', error);
    console.log('📝 Please manually configure permissions in Strapi admin panel:');
    console.log('   1. Go to Settings → Users & Permissions → Roles');
    console.log('   2. Click on "Public" role');
    console.log('   3. Under "Translation" section, enable "find" and "findOne"');
    console.log('   4. Save changes');
  }
}

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    console.log('🚀 Starting ProjectDes Academy CMS Bootstrap...');
    
    // Run the setup script for roles and users
    const setupRolesAndUsers = require('./bootstrap/setup-roles-and-users');
    await setupRolesAndUsers();
    
    // Set up public permissions for Translation API
    await setupPublicPermissions(strapi);
    
    // Set up webhook handlers for cache invalidation
    strapi.webhooks = {
      // Called when translation is approved and published
      onTranslationPublished: async (translation) => {
        console.log(`📢 Translation published: ${translation.key}`);
        
        // If Redis is configured, clear cache
        if (strapi.redis) {
          await strapi.redis.del(`trans:*:${translation.key}`);
          console.log(`   ✅ Cache cleared for: ${translation.key}`);
        }
        
        // Notify Next.js app to clear its cache
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/translation-published`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Secret': process.env.WEBHOOK_SECRET
            },
            body: JSON.stringify({
              key: translation.key,
              languages: {
                ru: translation.ru,
                en: translation.en,
                he: translation.he
              }
            })
          });
          
          if (response.ok) {
            console.log(`   ✅ Next.js notified of translation update`);
          }
        } catch (error) {
          console.error('   ❌ Failed to notify Next.js:', error);
        }
      }
    };
    
    console.log('✅ Bootstrap completed!');
  },
};