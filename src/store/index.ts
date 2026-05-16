import { create } from "zustand";
import {
  JobApplication,
  ApplicationFormData,
  FilterOptions,
  SortOptions,
  AppSettings,
} from "@/types";
import { applicationService } from "@/lib/supabase/applications";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_SOURCES, DEFAULT_INDUSTRIES } from "@/config/constants";

// Application Store
interface ApplicationState {
  applications: JobApplication[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  filters: FilterOptions;
  sort: SortOptions;
  _hasHydrated: boolean;

  // Actions
  fetchApplications: () => Promise<void>;
  addApplication: (data: ApplicationFormData) => Promise<string>;
  updateApplication: (
    id: string,
    data: Partial<ApplicationFormData>
  ) => Promise<void>;
  updateApplicationStatus: (
    id: string,
    status: JobApplication["status"]
  ) => Promise<void>;
  updateApplicationNotes: (
    id: string,
    notes: string
  ) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  importApplications: (items: ApplicationFormData[]) => Promise<number>;
  setFollowUp: (id: string, date: string | null) => Promise<void>;
  completeFollowUp: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: FilterOptions) => void;
  setSort: (sort: SortOptions) => void;
  clearFilters: () => void;
  getApplicationById: (id: string) => JobApplication | undefined;
  getFilteredApplications: () => JobApplication[];
  setHasHydrated: (state: boolean) => void;
}

export const useApplicationStore = create<ApplicationState>()((set, get) => ({
  applications: [],
  isLoading: false,
  error: null,
  searchQuery: "",
  filters: {},
  sort: { field: "applicationDate", order: "desc" },
  _hasHydrated: false,

  setHasHydrated: (state) => {
    set({ _hasHydrated: state });
  },

  fetchApplications: async () => {
    set({ isLoading: true, error: null });
    try {
      const applications = await applicationService.getAll();
      set({ applications, isLoading: false, _hasHydrated: true });
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false,
        _hasHydrated: true,
      });
    }
  },

  addApplication: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const newApp = await applicationService.create(data, user.id);
      set((state) => ({
        applications: [newApp, ...state.applications],
        isLoading: false,
      }));
      return newApp.id;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateApplication: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await applicationService.update(id, data);
      set((state) => ({
        applications: state.applications.map((app) =>
          app.id === id ? updated : app
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateApplicationStatus: async (id, status) => {
    const previous = get().applications.find((app) => app.id === id);
    if (!previous || previous.status === status) return;

    // Optimistic update without toggling global loading state.
    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === id ? { ...app, status } : app
      ),
    }));

    try {
      const updated = await applicationService.update(id, { status });
      set((state) => ({
        applications: state.applications.map((app) =>
          app.id === id ? updated : app
        ),
      }));
    } catch (error) {
      set((state) => ({
        applications: state.applications.map((app) =>
          app.id === id ? previous : app
        ),
        error: (error as Error).message,
      }));
    }
  },

  updateApplicationNotes: async (id, notes) => {
    const previous = get().applications.find((app) => app.id === id);
    if (!previous) return;

    const nextNotes = notes.trim();
    // Optimistic update without toggling global loading state.
    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === id ? { ...app, notes: nextNotes } : app
      ),
    }));

    try {
      const updated = await applicationService.update(id, { notes: nextNotes });
      set((state) => ({
        applications: state.applications.map((app) =>
          app.id === id ? updated : app
        ),
      }));
    } catch (error) {
      set((state) => ({
        applications: state.applications.map((app) =>
          app.id === id ? previous : app
        ),
        error: (error as Error).message,
      }));
    }
  },

  deleteApplication: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const app = get().applications.find((item) => item.id === id);
      if (app?.resumePath) {
        const supabase = createClient();
        await supabase.storage.from("resumes").remove([app.resumePath]);
      }
      await applicationService.delete(id);
      set((state) => ({
        applications: state.applications.filter((item) => item.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  togglePin: async (id) => {
    const app = get().applications.find((a) => a.id === id);
    if (!app) return;

    // Optimistic update
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === id ? { ...a, isPinned: !a.isPinned } : a
      ),
    }));

    try {
      await applicationService.togglePin(id, app.isPinned);
    } catch (error) {
      // Revert on error
      set((state) => ({
        applications: state.applications.map((a) =>
          a.id === id ? { ...a, isPinned: app.isPinned } : a
        ),
        error: (error as Error).message,
      }));
    }
  },

  importApplications: async (items) => {
    const supabaseClient = createClient();
    const { data: u } = await supabaseClient.auth.getUser();
    if (!u.user) throw new Error("Not authenticated");
    const { inserted } = await applicationService.createMany(items, u.user.id);
    // Refresh to pull canonical rows (id, created_at, ...) back into the store.
    await get().fetchApplications();
    return inserted;
  },

  setFollowUp: async (id, date) => {
    const previous = get().applications.find((a) => a.id === id);
    if (!previous) return;

    // Optimistic update — null clears, string sets/re-arms
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === id
          ? {
              ...a,
              followUpDate: date || undefined,
              followUpSentAt: undefined,
              followUpCompletedAt: undefined,
            }
          : a,
      ),
    }));

    try {
      if (date) {
        await applicationService.setFollowUp(id, date);
      } else {
        await applicationService.clearFollowUp(id);
      }
    } catch (error) {
      set((state) => ({
        applications: state.applications.map((a) =>
          a.id === id ? previous : a,
        ),
        error: (error as Error).message,
      }));
      throw error;
    }
  },

  completeFollowUp: async (id) => {
    const previous = get().applications.find((a) => a.id === id);
    if (!previous) return;
    const now = new Date().toISOString();

    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === id ? { ...a, followUpCompletedAt: now } : a,
      ),
    }));

    try {
      await applicationService.completeFollowUp(id);
    } catch (error) {
      set((state) => ({
        applications: state.applications.map((a) =>
          a.id === id ? previous : a,
        ),
        error: (error as Error).message,
      }));
      throw error;
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilters: (filters) => set({ filters }),

  setSort: (sort) => set({ sort }),

  clearFilters: () => set({ filters: {}, searchQuery: "" }),

  getApplicationById: (id) => {
    return get().applications.find((app) => app.id === id);
  },

  getFilteredApplications: () => {
    const { applications, searchQuery, filters, sort } = get();

    let filtered = [...applications];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.companyName.toLowerCase().includes(query) ||
          app.position.toLowerCase().includes(query) ||
          app.companyLocation.toLowerCase().includes(query) ||
          app.companyIndustry.toLowerCase().includes(query) ||
          app.notes?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((app) => filters.status!.includes(app.status));
    }

    // Filter by source
    if (filters.source && filters.source.length > 0) {
      filtered = filtered.filter((app) => filters.source!.includes(app.source));
    }

    // Filter by work type
    if (filters.workType && filters.workType.length > 0) {
      filtered = filtered.filter((app) =>
        filters.workType!.includes(app.workType)
      );
    }

    // Filter by industry
    if (filters.industry && filters.industry.length > 0) {
      filtered = filtered.filter((app) =>
        filters.industry!.includes(app.companyIndustry)
      );
    }

    // Filter by date range
    if (filters.dateRange) {
      if (filters.dateRange.from) {
        filtered = filtered.filter(
          (app) =>
            new Date(app.applicationDate) >= new Date(filters.dateRange!.from!)
        );
      }
      if (filters.dateRange.to) {
        filtered = filtered.filter(
          (app) =>
            new Date(app.applicationDate) <= new Date(filters.dateRange!.to!)
        );
      }
    }

    // Filter by pinned
    if (filters.isPinned !== undefined) {
      filtered = filtered.filter((app) => app.isPinned === filters.isPinned);
    }

    // Hide rejected
    if (filters.hideRejected) {
      filtered = filtered.filter((app) => app.status !== "rejected");
    }

    // Sort - pinned always first
    filtered.sort((a, b) => {
      // Pinned items first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // Then sort by selected field
      const aValue = a[sort.field];
      const bValue = b[sort.field];

      if (
        sort.field === "applicationDate" ||
        sort.field === "createdAt" ||
        sort.field === "updatedAt"
      ) {
        const aDate = new Date(aValue as string).getTime();
        const bDate = new Date(bValue as string).getTime();
        return sort.order === "asc" ? aDate - bDate : bDate - aDate;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sort.order === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

    return filtered;
  },
}));

// Settings Store (keeping local for now)
interface SettingsState {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addCustomSource: (source: string) => void;
  removeCustomSource: (source: string) => void;
  addCustomIndustry: (industry: string) => void;
  removeCustomIndustry: (industry: string) => void;
  getAllSources: () => string[];
  getAllIndustries: () => string[];
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  settings: {
    theme: "system",
    language: "en",
    customSources: [],
    customIndustries: [],
    followUpEmails: true,
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  addCustomSource: (source) => {
    set((state) => ({
      settings: {
        ...state.settings,
        customSources: [...state.settings.customSources, source],
      },
    }));
  },

  removeCustomSource: (source) => {
    set((state) => ({
      settings: {
        ...state.settings,
        customSources: state.settings.customSources.filter((s) => s !== source),
      },
    }));
  },

  addCustomIndustry: (industry) => {
    set((state) => ({
      settings: {
        ...state.settings,
        customIndustries: [...state.settings.customIndustries, industry],
      },
    }));
  },

  removeCustomIndustry: (industry) => {
    set((state) => ({
      settings: {
        ...state.settings,
        customIndustries: state.settings.customIndustries.filter(
          (i) => i !== industry
        ),
      },
    }));
  },

  getAllSources: () => {
    const { settings } = get();
    return [...DEFAULT_SOURCES, ...settings.customSources];
  },

  getAllIndustries: () => {
    const { settings } = get();
    return [...DEFAULT_INDUSTRIES, ...settings.customIndustries];
  },
}));
