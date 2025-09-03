'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::translation.translation', ({ strapi }) => ({
  
  // Custom approve endpoint
  async approve(ctx) {
    const { id } = ctx.params;
    const { notes } = ctx.request.body;
    const user = ctx.state.user;

    // Check if user is Super Admin
    if (!user || user.role.name !== 'Super Admin') {
      return ctx.forbidden('Only Super Admin can approve translations');
    }

    try {
      // Update translation with approval
      const translation = await strapi.entityService.update(
        'api::translation.translation',
        id,
        {
          data: {
            approvalStatus: 'approved',
            reviewedBy: user.id,
            reviewedAt: new Date(),
            reviewNotes: notes,
            publishedAt: new Date() // Auto-publish on approval
          },
          populate: ['submittedBy']
        }
      );

      // Log approval action
      await strapi.entityService.create('api::audit-log.audit-log', {
        data: {
          action: 'TRANSLATION_APPROVED',
          entityType: 'translation',
          entityId: translation.id,
          entityKey: translation.key,
          performedBy: user.id,
          performedByName: `${user.firstname} ${user.lastname}`,
          timestamp: new Date(),
          notes: notes
        }
      });

      // Send notification to content editor
      if (translation.submittedBy) {
        await strapi.plugin('email').service('email').send({
          to: translation.submittedBy.email,
          subject: `Translation Approved: ${translation.key}`,
          text: `Your translation "${translation.key}" has been approved and published.`
        });
      }

      return ctx.send({
        message: 'Translation approved successfully',
        translation
      });

    } catch (error) {
      strapi.log.error('Error approving translation:', error);
      return ctx.badRequest('Failed to approve translation');
    }
  },

  // Custom reject endpoint
  async reject(ctx) {
    const { id } = ctx.params;
    const { reason, notes } = ctx.request.body;
    const user = ctx.state.user;

    // Check if user is Super Admin
    if (!user || user.role.name !== 'Super Admin') {
      return ctx.forbidden('Only Super Admin can reject translations');
    }

    if (!reason) {
      return ctx.badRequest('Rejection reason is required');
    }

    try {
      // Update translation with rejection
      const translation = await strapi.entityService.update(
        'api::translation.translation',
        id,
        {
          data: {
            approvalStatus: 'changes_requested',
            reviewedBy: user.id,
            reviewedAt: new Date(),
            reviewNotes: `Reason: ${reason}\n${notes || ''}`,
            publishedAt: null // Unpublish if it was published
          },
          populate: ['submittedBy']
        }
      );

      // Log rejection action
      await strapi.entityService.create('api::audit-log.audit-log', {
        data: {
          action: 'TRANSLATION_REJECTED',
          entityType: 'translation',
          entityId: translation.id,
          entityKey: translation.key,
          performedBy: user.id,
          performedByName: `${user.firstname} ${user.lastname}`,
          timestamp: new Date(),
          reason: reason,
          notes: notes
        }
      });

      // Send notification to content editor
      if (translation.submittedBy) {
        await strapi.plugin('email').service('email').send({
          to: translation.submittedBy.email,
          subject: `Changes Required: ${translation.key}`,
          text: `Your translation "${translation.key}" requires changes.\n\nReason: ${reason}\n${notes || ''}`
        });
      }

      return ctx.send({
        message: 'Translation rejected with feedback',
        translation
      });

    } catch (error) {
      strapi.log.error('Error rejecting translation:', error);
      return ctx.badRequest('Failed to reject translation');
    }
  },

  // Submit for approval (for Content Editors)
  async submitForApproval(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    // Check if user is Content Editor
    if (!user || user.role.name !== 'Content Editor') {
      return ctx.forbidden('Only Content Editor can submit for approval');
    }

    try {
      // Update status to pending review
      const translation = await strapi.entityService.update(
        'api::translation.translation',
        id,
        {
          data: {
            approvalStatus: 'pending_review',
            submittedBy: user.id,
            submittedAt: new Date()
          }
        }
      );

      // Get Super Admins for notification
      const superAdmins = await strapi.entityService.findMany('admin::user', {
        filters: {
          roles: {
            name: 'Super Admin'
          }
        }
      });

      // Send notifications to all Super Admins
      for (const admin of superAdmins) {
        await strapi.plugin('email').service('email').send({
          to: admin.email,
          subject: `Translation Pending Approval: ${translation.key}`,
          text: `Translation "${translation.key}" has been submitted for approval by ${user.firstname} ${user.lastname}.`
        });
      }

      return ctx.send({
        message: 'Translation submitted for approval',
        translation
      });

    } catch (error) {
      strapi.log.error('Error submitting for approval:', error);
      return ctx.badRequest('Failed to submit for approval');
    }
  },

  // Get pending approvals (for Super Admin dashboard)
  async getPendingApprovals(ctx) {
    const user = ctx.state.user;

    // Check if user is Super Admin
    if (!user || user.role.name !== 'Super Admin') {
      return ctx.forbidden('Only Super Admin can view pending approvals');
    }

    try {
      const pendingTranslations = await strapi.entityService.findMany(
        'api::translation.translation',
        {
          filters: {
            approvalStatus: {
              $in: ['pending_review', 'under_review']
            }
          },
          populate: ['submittedBy'],
          sort: { submittedAt: 'desc' }
        }
      );

      return ctx.send({
        count: pendingTranslations.length,
        translations: pendingTranslations
      });

    } catch (error) {
      strapi.log.error('Error fetching pending approvals:', error);
      return ctx.badRequest('Failed to fetch pending approvals');
    }
  },

  // Get approval statistics (for dashboard)
  async getApprovalStats(ctx) {
    const user = ctx.state.user;

    if (!user || (user.role.name !== 'Super Admin' && user.role.name !== 'Admin')) {
      return ctx.forbidden('Insufficient permissions');
    }

    try {
      const stats = {
        total: await strapi.entityService.count('api::translation.translation'),
        pending: await strapi.entityService.count('api::translation.translation', {
          filters: { approvalStatus: 'pending_review' }
        }),
        underReview: await strapi.entityService.count('api::translation.translation', {
          filters: { approvalStatus: 'under_review' }
        }),
        approved: await strapi.entityService.count('api::translation.translation', {
          filters: { approvalStatus: 'approved' }
        }),
        rejected: await strapi.entityService.count('api::translation.translation', {
          filters: { approvalStatus: 'changes_requested' }
        }),
        published: await strapi.entityService.count('api::translation.translation', {
          filters: { publishedAt: { $notNull: true } }
        })
      };

      return ctx.send(stats);

    } catch (error) {
      strapi.log.error('Error fetching approval stats:', error);
      return ctx.badRequest('Failed to fetch statistics');
    }
  }
}));