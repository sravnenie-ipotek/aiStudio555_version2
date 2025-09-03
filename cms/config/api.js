module.exports = {
  rest: {
    defaultLimit: 100,
    maxLimit: 500,
    withCount: true,
  },
  responses: {
    privateAttributes: ['_v', 'id', 'created_at'],
  },
};