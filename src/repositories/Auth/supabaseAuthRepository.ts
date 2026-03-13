import type { AuthRepository, SignInWithPasswordParams } from "./authRepository";
import type { AuthUser } from "../../types/Auth/AuthUser";
import { supabase } from "../../lib/supabaseClient";

function toAuthUser(user: { id: string; email?: string | null } | null): AuthUser | null {
  if (!user) return null;
  return { id: user.id, email: user.email ?? null };
}

function isInvalidRefreshTokenError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybeMessage = "message" in error ? (error as { message?: unknown }).message : undefined;
  const message = typeof maybeMessage === "string" ? maybeMessage.toLowerCase() : "";
  return message.includes("invalid refresh token") || message.includes("refresh token not found");
}

export class SupabaseAuthRepository implements AuthRepository {
  async signInWithPassword(params: SignInWithPasswordParams): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: params.email,
      password: params.password,
    });

    if (error) throw error;

    const user = toAuthUser(data.user);
    if (!user) {
      throw new Error("Auth succeeded but no user returned.");
    }

    return user;
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      if (isInvalidRefreshTokenError(error)) {
        await supabase.auth.signOut({ scope: "local" });
      }
      return null;
    }
    return toAuthUser(data.session?.user ?? null);
  }
}
