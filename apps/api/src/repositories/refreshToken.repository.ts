import { prisma } from "../config/prisma";
import { RefreshToken } from "../config/prisma";

export const refreshTokenRepository = {
  create(data: { token: string; userId: string; expiresAt: Date }): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data });
  },

  findByToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({ where: { token } });
  },

  revoke(token: string): Promise<RefreshToken> {
    return prisma.refreshToken.update({ where: { token }, data: { revoked: true } });
  },

  revokeAllForUser(userId: string): Promise<{ count: number }> {
    return prisma.refreshToken.updateMany({ where: { userId, revoked: false }, data: { revoked: true } });
  },

  deleteExpired(): Promise<{ count: number }> {
    return prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  },
};
