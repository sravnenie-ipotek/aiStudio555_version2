module.exports = {
  // Define custom roles with specific permissions
  roles: {
    'content-editor': {
      name: 'Content Editor',
      description: 'Can create and edit content but cannot publish without approval',
      permissions: {
        'api::translation': {
          controllers: {
            translation: {
              find: { enabled: true },
              findOne: { enabled: true },
              create: { 
                enabled: true,
                policy: 'is-content-editor'
              },
              update: {
                enabled: true,
                policy: 'is-content-editor',
                // Can only update specific fields
                fields: ['key', 'ru', 'en', 'he', 'category', 'page', 'section', 'description'],
                // Cannot update these fields
                blockedFields: ['approvalStatus', 'reviewedBy', 'reviewedAt', 'reviewNotes', 'publishedAt']
              },
              delete: { enabled: false },
              publish: { enabled: false },
              unpublish: { enabled: false }
            }
          }
        },
        'plugin::upload': {
          controllers: {
            'content-api': {
              upload: { enabled: true },
              find: { enabled: true },
              findOne: { enabled: true },
              destroy: { enabled: false }
            }
          }
        },
        'plugin::content-manager': {
          explorer: {
            create: { enabled: true },
            read: { enabled: true },
            update: { 
              enabled: true,
              conditions: ['is-owner'] // Can only edit own content
            },
            delete: { enabled: false },
            publish: { enabled: false },
            unpublish: { enabled: false }
          }
        }
      }
    },
    
    'super-admin': {
      name: 'Super Admin',
      description: 'Full control with approval authority',
      permissions: {
        'api::translation': {
          controllers: {
            translation: {
              find: { enabled: true },
              findOne: { enabled: true },
              create: { enabled: true },
              update: { 
                enabled: true,
                // Can update all fields including approval
                fields: ['*']
              },
              delete: { enabled: true },
              publish: { enabled: true },
              unpublish: { enabled: true },
              approve: { 
                enabled: true,
                action: 'custom',
                controller: 'translation',
                method: 'approve'
              },
              reject: {
                enabled: true,
                action: 'custom',
                controller: 'translation',
                method: 'reject'
              }
            }
          }
        },
        'plugin::upload': {
          controllers: {
            'content-api': {
              '*': { enabled: true } // Full media control
            }
          }
        },
        'plugin::content-manager': {
          explorer: {
            '*': { enabled: true } // Full content control
          },
          components: {
            '*': { enabled: true }
          },
          'single-types': {
            '*': { enabled: true }
          }
        },
        'admin::api-tokens': {
          '*': { enabled: true }
        },
        'admin::users': {
          '*': { enabled: true }
        }
      }
    },
    
    'admin': {
      name: 'Admin',
      description: 'Can approve specific language content',
      permissions: {
        'api::translation': {
          controllers: {
            translation: {
              find: { enabled: true },
              findOne: { enabled: true },
              create: { enabled: true },
              update: { 
                enabled: true,
                policy: 'is-language-admin',
                // Can approve only their assigned languages
                conditions: ['assigned-language']
              },
              delete: { enabled: false },
              publish: { 
                enabled: true,
                policy: 'is-language-admin'
              },
              unpublish: { enabled: true }
            }
          }
        }
      }
    }
  },
  
  // Custom policies
  policies: {
    'is-content-editor': async (ctx) => {
      const user = ctx.state.user;
      return user && user.role && user.role.name === 'Content Editor';
    },
    
    'is-super-admin': async (ctx) => {
      const user = ctx.state.user;
      return user && user.role && user.role.name === 'Super Admin';
    },
    
    'is-language-admin': async (ctx) => {
      const user = ctx.state.user;
      if (!user || !user.role || user.role.name !== 'Admin') {
        return false;
      }
      
      // Check if admin is assigned to the language being edited
      const { id } = ctx.params;
      const translation = await strapi.entityService.findOne(
        'api::translation.translation',
        id
      );
      
      // Check if user has permission for the languages being modified
      const userLanguages = user.assignedLanguages || [];
      const modifiedLanguages = [];
      
      if (ctx.request.body.ru) modifiedLanguages.push('ru');
      if (ctx.request.body.en) modifiedLanguages.push('en');
      if (ctx.request.body.he) modifiedLanguages.push('he');
      
      return modifiedLanguages.every(lang => userLanguages.includes(lang));
    },
    
    'is-owner': async (ctx) => {
      const user = ctx.state.user;
      const { id } = ctx.params;
      
      const entity = await strapi.entityService.findOne(
        ctx.params.model,
        id,
        { populate: ['submittedBy'] }
      );
      
      return entity && entity.submittedBy && entity.submittedBy.id === user.id;
    }
  }
};