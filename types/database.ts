export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          name: string;
          bio: string | null;
          avatar_url: string | null;
          template: string;
          profession: string | null;
          company_name: string | null;
          industry: string | null;
          location: string | null;
          website_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          name: string;
          bio?: string | null;
          avatar_url?: string | null;
          template?: string;
          profession?: string | null;
          company_name?: string | null;
          industry?: string | null;
          location?: string | null;
          website_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          name?: string;
          bio?: string | null;
          avatar_url?: string | null;
          template?: string;
          profession?: string | null;
          company_name?: string | null;
          industry?: string | null;
          location?: string | null;
          website_url?: string | null;
          updated_at?: string;
        };
      };
      cards: {
        Row: {
          id: string;
          card_code: string;
          owner_id: string | null;
          profile_id: string | null;
          status: string;
          activated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          card_code: string;
          owner_id?: string | null;
          profile_id?: string | null;
          status?: string;
          activated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          owner_id?: string | null;
          profile_id?: string | null;
          status?: string;
          activated_at?: string | null;
          updated_at?: string;
        };
      };
      card_actions: {
        Row: {
          id: string;
          card_id: string;
          action_type: string;
          destination_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          card_id: string;
          action_type: string;
          destination_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          action_type?: string;
          destination_url?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      profile_links: {
        Row: {
          id: string;
          profile_id: string;
          type: string;
          title: string;
          url: string;
          icon: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          type: string;
          title: string;
          url: string;
          icon?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          type?: string;
          title?: string;
          url?: string;
          icon?: string | null;
          sort_order?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          card_id: string | null;
          profile_id: string | null;
          event_type: string;
          destination: string | null;
          user_agent: string | null;
          ip_hash: string | null;
          referrer: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          card_id?: string | null;
          profile_id?: string | null;
          event_type: string;
          destination?: string | null;
          user_agent?: string | null;
          ip_hash?: string | null;
          referrer?: string | null;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
      user_roles: {
        Row: {
          user_id: string;
          role: string;
        };
        Insert: {
          user_id: string;
          role?: string;
        };
        Update: {
          role?: string;
        };
      };
    };
  };
}
