import { prisma } from "../config/prisma";
import { User } from "../config/prisma";

/**
 * Data access layer for users. No business logic lives here — only
 * translation between Prisma calls and the domain.
 */
export const userRepository = {
  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  create(data: { name: string; email: string; passwordHash: string }): Promise<User> {
    return prisma.user.create({ data });
  },

  updatePassword(data: { passwordHash: string, userId: string}): Promise<User | null> {
    return prisma.user.update({
      where: { id : data.userId },
      data: {
        passwordHash : data.passwordHash
      }
    })
  },
};
