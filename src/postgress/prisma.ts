import { PrismaClient } from "@prisma/client/extension";
const databaseUrl=process.env.DATABASE_URL

if(!databaseUrl)  throw new Error("DATABASE_URL environment variable is missing");

const prisma = new PrismaClient(
//     {
//  datasources: {
//     db: {
//       url: databaseUrl,
//     },
//   }
// }
);

export default prisma;