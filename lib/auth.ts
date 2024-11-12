import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = {
  id: string;
  name: string;
  role: 'vendedor' | 'bodeguero' | 'admin';
};

type AuthStore = {
  user: User | null;
  login: (credentials: { username: string; password: string; role: User['role'] }) => Promise<boolean>;
  logout: () => void;
};

// In a real app, this would be in a secure database
const MOCK_USERS = {
  'vendedor@demo.com': { id: '1', name: 'Juan Pérez', password: 'vendedor123', role: 'vendedor' as const },
  'bodega@demo.com': { id: '2', name: 'Ana García', password: 'bodega123', role: 'bodeguero' as const },
  'admin@demo.com': { id: '3', name: 'Carlos López', password: 'admin123', role: 'admin' as const },
};

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      login: async (credentials) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const user = Object.entries(MOCK_USERS).find(([email, data]) => 
          email === credentials.username && 
          data.password === credentials.password &&
          data.role === credentials.role
        );

        if (user) {
          const [, userData] = user;
          set({ user: { id: userData.id, name: userData.name, role: userData.role } });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ user: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);