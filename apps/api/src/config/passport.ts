import passport from "passport";
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from "passport-google-oauth20";
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from "passport-github2";
import { env } from "./env";
import { userRepository } from "../repositories/user.repository";
import { oauthAccountRepository } from "../repositories/oauthAccount.repository";

/**
 * Resolves (or provisions) a local User for an OAuth login.
 * - If an OAuthAccount already exists for this provider+id, use its user.
 * - Else if a User with the same verified email exists, link the account.
 * - Else create a brand new (passwordless) User.
 */
async function findOrCreateOAuthUser(params: {
  provider: string;
  providerAccountId: string;
  email: string | undefined;
  name: string | undefined;
  accessToken?: string;
  refreshToken?: string;
}) {
  const { provider, providerAccountId, email, name, accessToken, refreshToken } = params;

  const existingAccount = await oauthAccountRepository.findByProviderAccount(provider, providerAccountId);
  if (existingAccount) {
    return userRepository.findById(existingAccount.userId);
  }

  if (!email) {
    throw new Error(`${provider} account has no public email; cannot sign in`);
  }

  let user = await userRepository.findByEmail(email);
  if (!user) {
    user = await userRepository.create({
      name: name ?? email.split("@")[0] ?? email,
      email,
      emailVerifiedAt: new Date(),
    });
  }

  await oauthAccountRepository.create({
    provider,
    providerAccountId,
    userId: user.id,
    accessToken,
    refreshToken,
  });

  return user;
}

if (env.oauth.google.clientId) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.oauth.google.clientId,
        clientSecret: env.oauth.google.clientSecret,
        callbackURL: env.oauth.google.callbackUrl,
        scope: ["profile", "email"],
      },
      (accessToken: string, refreshToken: string, profile: GoogleProfile, done: (err: any, user?: any) => void) => {
        findOrCreateOAuthUser({
          provider: "google",
          providerAccountId: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          accessToken,
          refreshToken,
        })
          .then((user) => done(null, user))
          .catch((err) => done(err));
      }
    )
  );
}

if (env.oauth.github.clientId) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: env.oauth.github.clientId,
        clientSecret: env.oauth.github.clientSecret,
        callbackURL: env.oauth.github.callbackUrl,
        scope: ["user:email"],
      },
      (accessToken: string, refreshToken: string, profile: GitHubProfile, done: (err: any, user?: any) => void) => {
        findOrCreateOAuthUser({
          provider: "github",
          providerAccountId: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName ?? profile.username,
          accessToken,
          refreshToken,
        })
          .then((user) => done(null, user))
          .catch((err) => done(err));
      }
    )
  );
}

export default passport;
