module.exports = {
  // Before creating a translation
  async beforeCreate(event) {
    const { data } = event.params;
    const ctx = strapi.requestContext.get();
    const user = ctx?.state?.user;

    // Only set submittedBy and user-specific logic if we have an authenticated user
    if (user) {
      data.submittedBy = user.id;
      data.submittedAt = new Date();
      
      // Content editors can only create drafts
      if (user.role.name === 'Content Editor') {
        data.approvalStatus = 'draft';
        data.publishedAt = null; // Ensure not published
      }
    } else {
      // For seeding or programmatic creation without user context
      // Set default values if not already provided
      if (!data.submittedAt) {
        data.submittedAt = new Date();
      }
      
      // If no approval status is set, default to approved for seeding
      if (!data.approvalStatus) {
        data.approvalStatus = 'approved';
      }
    }
  },

  // Before updating a translation
  async beforeUpdate(event) {
    const { data, where } = event.params;
    const ctx = strapi.requestContext.get();
    const user = ctx.state.user;

    // Get current translation
    const currentTranslation = await strapi.entityService.findOne(
      'api::translation.translation',
      where.id
    );

    // Content Editor submitting for review
    if (user.role.name === 'Content Editor' && data.approvalStatus === 'pending_review') {
      data.submittedBy = user.id;
      data.submittedAt = new Date();
      data.publishedAt = null; // Ensure not published
      
      // Notify Super Admin
      await notifySuperAdmin(where.id, user);
    }

    // Super Admin reviewing
    if (user.role.name === 'Super Admin' && data.approvalStatus === 'under_review') {
      data.reviewedBy = user.id;
      data.reviewedAt = new Date();
    }

    // Super Admin approving
    if (user.role.name === 'Super Admin' && data.approvalStatus === 'approved') {
      data.reviewedBy = user.id;
      data.reviewedAt = new Date();
      data.publishedAt = new Date(); // Auto-publish on approval
      
      // Notify content editor of approval
      await notifyContentEditor(where.id, 'approved', data.reviewNotes);
    }

    // Super Admin requesting changes
    if (user.role.name === 'Super Admin' && data.approvalStatus === 'changes_requested') {
      data.reviewedBy = user.id;
      data.reviewedAt = new Date();
      data.publishedAt = null; // Unpublish if changes needed
      
      // Notify content editor of rejection
      await notifyContentEditor(where.id, 'changes_requested', data.reviewNotes);
    }

    // Increment version on significant changes
    if (currentTranslation && 
        (currentTranslation.ru !== data.ru || 
         currentTranslation.en !== data.en || 
         currentTranslation.he !== data.he)) {
      data.version = (currentTranslation.version || 1) + 1;
    }
  },

  // After updating (for cache invalidation)
  async afterUpdate(event) {
    const { result } = event;
    
    // If translation was approved and published
    if (result.approvalStatus === 'approved' && result.publishedAt) {
      // Clear cache for this translation
      await clearTranslationCache(result.key);
      
      // Log the approval
      await strapi.entityService.create('api::audit-log.audit-log', {
        data: {
          action: 'TRANSLATION_APPROVED',
          entityType: 'translation',
          entityId: result.id,
          entityKey: result.key,
          performedBy: result.reviewedBy,
          timestamp: new Date(),
          details: {
            version: result.version,
            languages: {
              ru: !!result.ru,
              en: !!result.en,
              he: !!result.he
            }
          }
        }
      });
    }
  }
};

// Helper function to notify Super Admin
async function notifySuperAdmin(translationId, submittedByUser) {
  const translation = await strapi.entityService.findOne(
    'api::translation.translation',
    translationId,
    { populate: ['submittedBy'] }
  );

  // Get all Super Admins
  const superAdmins = await strapi.entityService.findMany('admin::user', {
    filters: {
      roles: {
        name: 'Super Admin'
      }
    }
  });

  // Send email to each Super Admin
  for (const admin of superAdmins) {
    await strapi.plugins['email'].services.email.send({
      to: admin.email,
      subject: `Translation Approval Required: ${translation.key}`,
      text: `
        A new translation needs your approval:
        
        Key: ${translation.key}
        Category: ${translation.category}
        Submitted by: ${submittedByUser.firstname} ${submittedByUser.lastname}
        
        Russian: ${translation.ru ? 'Yes' : 'No'}
        English: ${translation.en ? 'Yes' : 'No'}
        Hebrew: ${translation.he ? 'Yes' : 'No'}
        
        Please review at: ${process.env.STRAPI_ADMIN_URL}/admin/content-manager/collectionType/api::translation.translation/${translationId}
      `,
      html: `
        <h2>Translation Approval Required</h2>
        <p>A new translation needs your approval:</p>
        
        <table>
          <tr><td><strong>Key:</strong></td><td>${translation.key}</td></tr>
          <tr><td><strong>Category:</strong></td><td>${translation.category}</td></tr>
          <tr><td><strong>Submitted by:</strong></td><td>${submittedByUser.firstname} ${submittedByUser.lastname}</td></tr>
        </table>
        
        <h3>Content:</h3>
        <ul>
          ${translation.ru ? `<li><strong>Russian:</strong> ${translation.ru}</li>` : ''}
          ${translation.en ? `<li><strong>English:</strong> ${translation.en}</li>` : ''}
          ${translation.he ? `<li><strong>Hebrew:</strong> ${translation.he}</li>` : ''}
        </ul>
        
        <p>
          <a href="${process.env.STRAPI_ADMIN_URL}/admin/content-manager/collectionType/api::translation.translation/${translationId}" 
             style="background: #4945ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
            Review Translation
          </a>
        </p>
      `
    });
  }

  // Create in-app notification
  await strapi.entityService.create('api::notification.notification', {
    data: {
      type: 'APPROVAL_REQUIRED',
      title: `Translation "${translation.key}" needs approval`,
      message: `Submitted by ${submittedByUser.firstname} ${submittedByUser.lastname}`,
      targetRole: 'Super Admin',
      relatedEntity: 'translation',
      relatedEntityId: translationId,
      isRead: false,
      priority: 'high'
    }
  });
}

// Helper function to notify Content Editor
async function notifyContentEditor(translationId, status, notes) {
  const translation = await strapi.entityService.findOne(
    'api::translation.translation',
    translationId,
    { populate: ['submittedBy', 'reviewedBy'] }
  );

  if (!translation.submittedBy) return;

  const statusMessages = {
    'approved': {
      subject: `Translation Approved: ${translation.key}`,
      title: 'Your translation has been approved!',
      color: '#5cb85c'
    },
    'changes_requested': {
      subject: `Changes Required: ${translation.key}`,
      title: 'Your translation needs changes',
      color: '#f0ad4e'
    }
  };

  const messageConfig = statusMessages[status];

  await strapi.plugins['email'].services.email.send({
    to: translation.submittedBy.email,
    subject: messageConfig.subject,
    html: `
      <h2 style="color: ${messageConfig.color};">${messageConfig.title}</h2>
      
      <table>
        <tr><td><strong>Key:</strong></td><td>${translation.key}</td></tr>
        <tr><td><strong>Reviewed by:</strong></td><td>${translation.reviewedBy.firstname} ${translation.reviewedBy.lastname}</td></tr>
        <tr><td><strong>Status:</strong></td><td>${status.replace('_', ' ').toUpperCase()}</td></tr>
      </table>
      
      ${notes ? `
        <h3>Review Notes:</h3>
        <p>${notes}</p>
      ` : ''}
      
      ${status === 'changes_requested' ? `
        <p>
          <a href="${process.env.STRAPI_ADMIN_URL}/admin/content-manager/collectionType/api::translation.translation/${translationId}" 
             style="background: #4945ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
            Edit Translation
          </a>
        </p>
      ` : ''}
    `
  });
}

// Helper function to clear cache
async function clearTranslationCache(key) {
  // If using Redis
  if (strapi.redis) {
    await strapi.redis.del(`trans:*:${key}`);
  }
  
  // Trigger webhook to clear Next.js cache
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/clear-translation-cache`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': process.env.WEBHOOK_SECRET
      },
      body: JSON.stringify({ key })
    });
  } catch (error) {
    console.error('Failed to clear Next.js cache:', error);
  }
}