// src/store/usersStore.ts
// Caching strategy: results are stored in Zustand keyed by "query+page".
// This avoids redundant API calls when navigating back to a previously visited page.
// Cache is in-memory (cleared on full page refresh), preventing stale data issues.

import { create } from "zustand";
import { User, PaginatedUsers } from "@/types";

interface UsersState {
  users: User[];
  total: number;
  currentPage: number;
  limit: number;
  searchQuery: string;
  loading: boolean;
  error: string | null;
  // Cache: key = "query-page", value = PaginatedUsers
  cache: Record<string, PaginatedUsers>;

  setPage: (page: number) => void;
  setSearchQuery: (q: string) => void;
  fetchUsers: (page?: number, query?: string) => Promise<void>;
  fetchUserById: (id: number) => Promise<User | null>;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  total: 0,
  currentPage: 1,
  limit: 10,
  searchQuery: "",
  loading: false,
  error: null,
  cache: {},

  setPage: (page) => set({ currentPage: page }),
  setSearchQuery: (q) => set({ searchQuery: q, currentPage: 1 }),

  fetchUsers: async (page, query) => {
    const state = get();
    const currentPage = page ?? state.currentPage;
    const searchQuery = query !== undefined ? query : state.searchQuery;
    const limit = state.limit;
    const skip = (currentPage - 1) * limit;

    // Check cache before making API call
    const cacheKey = `${searchQuery}-${currentPage}`;
    if (state.cache[cacheKey]) {
      const cached = state.cache[cacheKey];
      set({ users: cached.users, total: cached.total, loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      const url = searchQuery
        ? `https://dummyjson.com/users/search?q=${encodeURIComponent(searchQuery)}&limit=${limit}&skip=${skip}`
        : `https://dummyjson.com/users?limit=${limit}&skip=${skip}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data: PaginatedUsers = await res.json();

      // Store in cache
      set((s) => ({
        users: data.users,
        total: data.total,
        loading: false,
        cache: { ...s.cache, [cacheKey]: data },
      }));
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : "Unknown error", loading: false });
    }
  },

  fetchUserById: async (id) => {
    try {
      const res = await fetch(`https://dummyjson.com/users/${id}`);
      if (!res.ok) throw new Error("User not found");
      return await res.json();
    } catch {
      return null;
    }
  },
}));
