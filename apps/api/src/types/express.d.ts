import "express";

declare global {
  namespace Express {
    // Augmenting Express.User (rather than declaring Request.user directly)
    // so this composes correctly with @types/passport, which itself types
    // `Request.user` as `Express.User`.
    interface User {
      id: string;
      email: string;
    }
  }
}

export {};
