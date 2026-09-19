import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

const ACCESS_TOKEN_KEY = "mmc.accessToken";
const REFRESH_TOKEN_KEY = "mmc.refreshToken";
const USER_KEY = "mmc.user";

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  userId: number;
  name: string;
  surname: string;
  email: string;
  roleId: number;
  roleName: string;
}

type AuthStatus = "idle" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  hydrate: () => Promise<void>;
  setSession: (tokens: SessionTokens, user: AuthUser) => Promise<void>;
  setTokens: (tokens: SessionTokens) => Promise<void>;
  clearSession: () => Promise<void>;
}

async function persistTokens(tokens: SessionTokens): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "idle",
  user: null,
  accessToken: null,
  refreshToken: null,

  hydrate: async () => {
    if (get().status !== "idle") {
      return;
    }

    const [accessToken, refreshToken, storedUser] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.getItemAsync(USER_KEY),
    ]);

    if (!accessToken || !refreshToken || !storedUser) {
      await clearPersistedSession();
      set({ status: "unauthenticated", user: null, accessToken: null, refreshToken: null });
      return;
    }

    let user: AuthUser;

    try {
      user = JSON.parse(storedUser) as AuthUser;
    } catch {
      await clearPersistedSession();
      set({ status: "unauthenticated", user: null, accessToken: null, refreshToken: null });
      return;
    }

    set({ status: "authenticated", user, accessToken, refreshToken });
  },

  setSession: async (tokens, user) => {
    await persistTokens(tokens);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    set({ status: "authenticated", user, ...tokens });
  },

  setTokens: async (tokens) => {
    await persistTokens(tokens);
    set(tokens);
  },

  clearSession: async () => {
    await clearPersistedSession();
    set({ status: "unauthenticated", user: null, accessToken: null, refreshToken: null });
  },
}));

async function clearPersistedSession(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}
