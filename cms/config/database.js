module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'projectdes_academy'),
      user: env('DATABASE_USERNAME', 'projectdes'),
      password: env('DATABASE_PASSWORD', 'localpassword'),
      ssl: env.bool('DATABASE_SSL', false),
    },
    debug: false,
  },
});