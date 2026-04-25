
import "dotenv/config";
const { defineConfig, env } = require('@prisma/config');;


export default defineConfig({
  earlyAccess: true,
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
