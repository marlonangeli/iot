import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthService, User, UserRole } from '@/lib/auth-utils';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  hasPermission: (requiredRole: UserRole) => boolean;
}

const ROLE_HIERARCHY = {
  [UserRole.ADMIN]: 4,
  [UserRole.MANAGER]: 3,
  [UserRole.OPERATOR]: 2,
  [UserRole.VIEWER]: 1
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const { user, token } = await AuthService.login({ email, password });

          set({
            user,
            token,
            isAuthenticated: true
          });
        } catch (error) {
          set({ user: null, token: null, isAuthenticated: false });
          throw error;
        }
      },

      signup: async (userData) => {
        try {
          const { user, token } = await AuthService.signup(userData);

          set({
            user,
            token,
            isAuthenticated: true
          });
        } catch (error) {
          set({ user: null, token: null, isAuthenticated: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      },

      refreshToken: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const newToken = await AuthService.refreshToken(token);

          set({ token: newToken });
        } catch {
          // Logout on refresh failure
          set({
            user: null,
            token: null,
            isAuthenticated: false
          });
        }
      },

      hasPermission: (requiredRole: UserRole) => {
        const { user } = get();
        if (!user) return false;

        return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[requiredRole];
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
