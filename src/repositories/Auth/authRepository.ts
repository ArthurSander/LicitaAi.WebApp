import type { AuthUser } from "../../types/Auth/AuthUser";

export type SignInWithPasswordParams = {
  email: string;
  password: string;
};

export interface AuthRepository {
  signInWithPassword(params: SignInWithPasswordParams): Promise<AuthUser>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
}
