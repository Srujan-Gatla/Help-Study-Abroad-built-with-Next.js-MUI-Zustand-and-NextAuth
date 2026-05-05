// src/store/productsStore.ts
// Caching strategy: cache keyed by "query-category-page" in Zustand memory.
// Categories list is also cached to avoid refetching on every filter open.
// This reduces API calls significantly during normal browsing.

import { create } from "zustand";
import { Product, PaginatedProducts } from "@/types";

interface ProductsState {
  products: Product[];
  total: number;
  currentPage: number;
  limit: number;
  searchQuery: string;
  selectedCategory: string;
  categories: string[];
  loading: boolean;
  error: string | null;
  cache: Record<string, PaginatedProducts>;
  categoriesLoaded: boolean;

  setPage: (page: number) => void;
  setSearchQuery: (q: string) => void;
  setCategory: (cat: string) => void;
  fetchProducts: (page?: number, query?: string, category?: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchProductById: (id: number) => Promise<Product | null>;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  total: 0,
  currentPage: 1,
  limit: 12,
  searchQuery: "",
  selectedCategory: "",
  categories: [],
  loading: false,
  error: null,
  cache: {},
  categoriesLoaded: false,

  setPage: (page) => set({ currentPage: page }),
  setSearchQuery: (q) => set({ searchQuery: q, currentPage: 1, selectedCategory: "" }),
  setCategory: (cat) => set({ selectedCategory: cat, currentPage: 1, searchQuery: "" }),

  fetchProducts: async (page, query, category) => {
    const state = get();
    const currentPage = page ?? state.currentPage;
    const searchQuery = query !== undefined ? query : state.searchQuery;
    const selectedCategory = category !== undefined ? category : state.selectedCategory;
    const limit = state.limit;
    const skip = (currentPage - 1) * limit;

    const cacheKey = `${searchQuery}-${selectedCategory}-${currentPage}`;
    if (state.cache[cacheKey]) {
      const cached = state.cache[cacheKey];
      set({ products: cached.products, total: cached.total, loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      let url = "";
      if (searchQuery) {
        url = `https://dummyjson.com/products/search?q=${encodeURIComponent(searchQuery)}&limit=${limit}&skip=${skip}`;
      } else if (selectedCategory) {
        url = `https://dummyjson.com/products/category/${encodeURIComponent(selectedCategory)}?limit=${limit}&skip=${skip}`;
      } else {
        url = `https://dummyjson.com/products?limit=${limit}&skip=${skip}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data: PaginatedProducts = await res.json();

      set((s) => ({
        products: data.products,
        total: data.total,
        loading: false,
        cache: { ...s.cache, [cacheKey]: data },
      }));
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : "Unknown error", loading: false });
    }
  },

  fetchCategories: async () => {
    const { categoriesLoaded } = get();
    if (categoriesLoaded) return; // cached — no refetch needed

    try {
      const res = await fetch("https://dummyjson.com/products/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      // API returns array of objects with slug/name
      const cats = data.map((c: { slug: string; name: string } | string) =>
        typeof c === "string" ? c : c.slug
      );
      set({ categories: cats, categoriesLoaded: true });
    } catch {
      set({ categories: [] });
    }
  },

  fetchProductById: async (id) => {
    try {
      const res = await fetch(`https://dummyjson.com/products/${id}`);
      if (!res.ok) throw new Error("Product not found");
      return await res.json();
    } catch {
      return null;
    }
  },
}));
