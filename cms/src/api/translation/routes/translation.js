'use strict';

/**
 * translation router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::translation.translation', {
  config: {
    find: {
      auth: false, // Make public
      policies: [],
      middlewares: [],
    },
    findOne: {
      auth: false, // Make public
      policies: [],
      middlewares: [],
    },
    create: {
      auth: false, // Make public for seeding
      policies: [],
      middlewares: [],
    },
    update: {
      auth: false, // Make public for seeding
      policies: [],
      middlewares: [],
    },
    delete: {
      policies: [],
      middlewares: [],
    },
  },
});