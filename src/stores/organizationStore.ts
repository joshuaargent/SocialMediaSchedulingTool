import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Organization, User, CooldownSettings, PostingLimits } from '@/types';

// ============================================
// Organization Store (Multi-Tenant Ready)
// ============================================

interface OrganizationState {
  organization: Organization | null;
  user: User | null;
  isLoading: boolean;
  
  // Actions
  setOrganization: (org: Organization) => void;
  setUser: (user: User) => void;
  updateCooldownSettings: (settings: Partial<CooldownSettings>) => void;
  updatePostingLimits: (limits: Partial<PostingLimits>) => void;
  reset: () => void;
}

const defaultCooldownSettings: CooldownSettings = {
  tiktok: 60,    // 1 hour
  facebook: 30,  // 30 minutes
  instagram: 60, // 1 hour
  youtube: 120,  // 2 hours
};

const defaultPostingLimits: PostingLimits = {
  tiktok: 10,     // per day
  facebook: 10,
  instagram: 10,
  youtube: 5,
};

// Single-tenant v1: create default org and user on init
const createDefaultOrganization = (): Organization => ({
  id: 'default-org',
  name: 'My Content Studio',
  planType: 'pro',
  settings: {
    cooldownSettings: defaultCooldownSettings,
    postingLimits: defaultPostingLimits,
    defaultOptimalTimes: {
      tiktok: ['09:00', '12:00', '20:00'],
      facebook: ['14:00', '15:00', '16:00'],
      instagram: ['12:00', '13:00', '20:00'],
      youtube: ['16:00'],
    },
  },
  defaultTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  createdAt: new Date(),
});

const createDefaultUser = (organizationId: string): User => ({
  id: 'default-user',
  organizationId,
  email: 'creator@example.com',
  role: 'owner',
  createdAt: new Date(),
});

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      organization: createDefaultOrganization(),
      user: createDefaultUser('default-org'),
      isLoading: false,

      setOrganization: (org) => set({ organization: org }),
      
      setUser: (user) => set({ user }),
      
      updateCooldownSettings: (settings) =>
        set((state) => ({
          organization: state.organization
            ? {
                ...state.organization,
                settings: {
                  ...state.organization.settings,
                  cooldownSettings: {
                    ...state.organization.settings.cooldownSettings,
                    ...settings,
                  },
                },
              }
            : null,
        })),
      
      updatePostingLimits: (limits) =>
        set((state) => ({
          organization: state.organization
            ? {
                ...state.organization,
                settings: {
                  ...state.organization.settings,
                  postingLimits: {
                    ...state.organization.settings.postingLimits,
                    ...limits,
                  },
                },
              }
            : null,
        })),
      
      reset: () =>
        set({
          organization: createDefaultOrganization(),
          user: createDefaultUser('default-org'),
        }),
    }),
    {
      name: 'organization-storage',
    }
  )
);