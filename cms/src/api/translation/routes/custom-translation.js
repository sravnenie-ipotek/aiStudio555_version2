module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/translations/:id/approve',
      handler: 'translation.approve',
      config: {
        policies: [],
        middlewares: [],
        description: 'Approve a translation (Super Admin only)'
      }
    },
    {
      method: 'POST',
      path: '/translations/:id/reject',
      handler: 'translation.reject',
      config: {
        policies: [],
        middlewares: [],
        description: 'Reject a translation with feedback (Super Admin only)'
      }
    },
    {
      method: 'POST',
      path: '/translations/:id/submit-for-approval',
      handler: 'translation.submitForApproval',
      config: {
        policies: [],
        middlewares: [],
        description: 'Submit translation for approval (Content Editor only)'
      }
    },
    {
      method: 'GET',
      path: '/translations/pending-approvals',
      handler: 'translation.getPendingApprovals',
      config: {
        policies: [],
        middlewares: [],
        description: 'Get all pending approvals (Super Admin only)'
      }
    },
    {
      method: 'GET',
      path: '/translations/approval-stats',
      handler: 'translation.getApprovalStats',
      config: {
        policies: [],
        middlewares: [],
        description: 'Get approval statistics for dashboard'
      }
    }
  ]
};