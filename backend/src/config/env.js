require('dotenv').config();

const config = {
  jwtSecret: process.env.JWT_SECRET || 'super-secret-key-rpl-library-2026',
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
};

module.exports = config;
