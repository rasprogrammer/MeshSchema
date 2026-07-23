import { PrismaClient } from "../generated/client";

import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env";

const adapter = new PrismaPg({ connectionString: env.databaseUrl });

export const prisma = new PrismaClient({ adapter });

export type * from "../generated/client";