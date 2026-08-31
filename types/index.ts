export type CardStatus = "inactive" | "active" | "suspended";

export type ActionType =
  | "profile"
  | "instagram"
  | "whatsapp"
  | "website"
  | "tiktok"
  | "youtube"
  | "linkedin"
  | "custom";

export type ProfileTemplate =
  | "linktree"
  | "personal"
  | "company"
  | "cv"
  | "portfolio";

export type LinkType =
  | "instagram"
  | "tiktok"
  | "whatsapp"
  | "website"
  | "youtube"
  | "linkedin"
  | "email"
  | "phone"
  | "maps"
  | "shopee"
  | "tokopedia"
  | "custom";

export type EventType = "tap" | "profile_view" | "link_click";

export type UserRole = "customer" | "admin";

// ─── Domain types ───────────────────────────────────────────

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  template: ProfileTemplate;
  profession: string | null;
  company_name: string | null;
  industry: string | null;
  location: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  card_code: string;
  owner_id: string | null;
  profile_id: string | null;
  status: CardStatus;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CardAction {
  id: string;
  card_id: string;
  action_type: ActionType;
  destination_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileLink {
  id: string;
  profile_id: string;
  type: LinkType;
  title: string;
  url: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsEvent {
  id: string;
  card_id: string | null;
  profile_id: string | null;
  event_type: EventType;
  destination: string | null;
  user_agent: string | null;
  ip_hash: string | null;
  referrer: string | null;
  created_at: string;
}

// ─── Composed / view types ───────────────────────────────────

export interface CardWithAction extends Card {
  card_actions: CardAction | null;
  profiles: Profile | null;
}

export interface ProfileWithLinks extends Profile {
  profile_links: ProfileLink[];
}

// ─── Form types ──────────────────────────────────────────────

export interface ActivationData {
  template: ProfileTemplate;
  profileInfo: ProfileFormData;
  links: LinkFormData[];
  action: ActionFormData;
}

export interface ProfileFormData {
  name: string;
  username: string;
  bio?: string;
  profession?: string;
  company_name?: string;
  industry?: string;
  location?: string;
  website_url?: string;
}

export interface LinkFormData {
  id?: string;
  type: LinkType;
  title: string;
  url: string;
  is_active: boolean;
  sort_order: number;
}

export interface ActionFormData {
  action_type: ActionType;
  destination_url?: string;
}

// ─── Stats ───────────────────────────────────────────────────

export interface DashboardStats {
  totalCards: number;
  activeCards: number;
  totalTaps: number;
  profileViews: number;
}
