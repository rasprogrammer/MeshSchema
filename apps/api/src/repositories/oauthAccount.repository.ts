import { prisma } from "../config/prisma";
import { OAuthAccount } from "../config/prisma";

export const oauthAccountRepository = {
  findByProviderAccount(provider: string, providerAccountId: string): Promise<OAuthAccount | null> {
    return prisma.oAuthAccount.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
    });
  },

  create(data: {
    provider: string;
    providerAccountId: string;
    userId: string;
    accessToken?: string;
    refreshToken?: string;
  }): Promise<OAuthAccount> {
    return prisma.oAuthAccount.create({ data });
  },
};
