export type Role =
  | "PLATFORM_SUPER_ADMIN"
  | "ORGANISATION_OWNER"
  | "ORGANISATION_ADMIN"
  | "EVENT_MANAGER"
  | "BRAND_MANAGER"
  | "OPERATIONS_STAFF"
  | "CREATOR"
  | "GUEST";

export type EventStatus =
  | "draft"
  | "published"
  | "ongoing"
  | "completed"
  | "cancelled";

export type GuestCategory =
  | "VIP"
  | "VVIP"
  | "Creator"
  | "Media"
  | "Brand Partner"
  | "Industry"
  | "General";

export type InvitationStatus =
  | "draft"
  | "sent"
  | "delivered"
  | "opened"
  | "accepted"
  | "declined"
  | "waitlisted"
  | "cancelled";

export type CheckInStatus =
  | "not_checked_in"
  | "checked_in"
  | "cancelled"
  | "invalid_pass";

export interface Organisation {
  id: string;
  name: string;
  slug: string;
  type: "agency" | "brand" | "enterprise";
  logo_url?: string;
  plan: "Starter" | "Growth" | "Enterprise";
  created_at: string;
  settings: {
    currency: string;
    timezone: string;
    allowed_domains?: string[];
  };
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: Role;
  organisation_id: string;
  created_at: string;
}

export interface EventMember {
  id: string;
  event_id: string;
  user_id: string;
  role: Role;
  user?: UserProfile;
}

export interface EventItem {
  id: string;
  organisation_id: string;
  name: string;
  description: string;
  category: "Brand Launch" | "Influencer Activation" | "Networking Experience" | "Private Showcase" | "Pop-up";
  status: EventStatus;
  start_time: string;
  end_time: string;
  timezone: string;
  venue_name: string;
  venue_city: string;
  venue_address: string;
  capacity: number;
  visibility: "invitation_only" | "public";
  cover_image: string;
  created_at: string;
  updated_at: string;
  assigned_members?: UserProfile[];
}

export interface Guest {
  id: string;
  organisation_id: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  organisation: string;
  category: GuestCategory;
  social_links: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  tags: string[];
  notes?: string;
  relationship_owner?: string;
  communication_preferences: {
    email: boolean;
    whatsapp: boolean;
  };
  created_at: string;
}

export interface EventGuest {
  id: string;
  event_id: string;
  guest_id: string;
  category: GuestCategory;
  status: "invited" | "confirmed" | "declined" | "waitlisted" | "checked_in" | "cancelled";
  plus_ones_allowed: number;
  plus_ones_registered: number;
  guest?: Guest;
  invitation?: Invitation;
  qr_pass?: QRPass;
  check_in?: CheckIn;
}

export interface Invitation {
  id: string;
  event_id: string;
  event_guest_id: string;
  recipient_email: string;
  recipient_name: string;
  channel: "email" | "whatsapp";
  status: InvitationStatus;
  secure_token: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  responded_at?: string;
  created_at: string;
}

export interface QRPass {
  id: string;
  event_id: string;
  event_guest_id: string;
  token_hash: string;
  secure_token: string;
  qr_code_url?: string;
  is_revoked: boolean;
  issued_at: string;
  expires_at: string;
}

export interface CheckIn {
  id: string;
  event_id: string;
  event_guest_id: string;
  pass_id: string;
  operator_id: string;
  operator_name: string;
  method: "qr_scan" | "manual_search" | "emergency_override";
  checked_in_at: string;
  idempotency_key: string;
}

export interface Creator {
  id: string;
  organisation_id: string;
  name: string;
  handle: string;
  profile_image: string;
  location: string;
  categories: string[];
  languages: string[];
  audience_size: string;
  engagement_rate: string;
  primary_platform: "Instagram" | "YouTube" | "LinkedIn";
  social_links: {
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };
  collaboration_count: number;
  average_sentiment: "High" | "Neutral" | "Very High";
  notes?: string;
  is_verified: boolean;
  provenance?: "Agency Verified" | "Creator Provided" | "Manually Entered" | "API Sync";
  last_synced_at?: string;
  created_at: string;
}

export interface ContentSubmission {
  id: string;
  event_id: string;
  creator_id: string;
  creator_name: string;
  post_url: string;
  platform: "Instagram" | "YouTube" | "LinkedIn" | "Twitter";
  post_type: "Reel" | "Story" | "Post" | "Video";
  published_at: string;
  campaign_hashtags: string[];
  metrics: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
  };
  evidence_url?: string;
  notes?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  organisation_id: string;
  actor_id: string;
  actor_name: string;
  action: string;
  resource_type: string;
  resource_id: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}
