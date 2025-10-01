export const config = {
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
    env: process.env.NODE_ENV || 'development'
  },
  database: {
    url: process.env.DATABASE_URL || ''
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
} as const;
