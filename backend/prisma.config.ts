import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
 datasource: {
  url:
    process.env.NODE_ENV === "test"
      ? process.env.DATABASE_URL_TEST
      : process.env.DATABASE_URL,
},
});