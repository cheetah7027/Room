-- ==============================================================================
-- ROOM SaaS Schema Migration
-- Multi-tenant event management & creator CRM
-- Compliant with ARCHITECTURE.md & TECH_STACK.md
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organisations
CREATE TABLE IF NOT EXISTS organisations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'agency',
    logo_url TEXT,
    plan VARCHAR(50) NOT NULL DEFAULT 'Starter',
    settings JSONB NOT NULL DEFAULT '{"currency": "INR", "timezone": "Asia/Kolkata"}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. User Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Organisation Members (Multi-tenant binding)
CREATE TABLE IF NOT EXISTS organisation_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'OPERATIONS_STAFF',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organisation_id, user_id)
);

-- 4. Events
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL DEFAULT 'Brand Launch',
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(100) NOT NULL DEFAULT 'Asia/Kolkata',
    venue_name VARCHAR(255) NOT NULL,
    venue_city VARCHAR(100) NOT NULL,
    venue_address TEXT,
    capacity INT NOT NULL DEFAULT 100,
    visibility VARCHAR(50) NOT NULL DEFAULT 'invitation_only',
    cover_image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Event Members (Event scope assignment)
CREATE TABLE IF NOT EXISTS event_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'OPERATIONS_STAFF',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- 6. Guests (Reusable organisation-level CRM database)
CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    city VARCHAR(100),
    organisation VARCHAR(255),
    category VARCHAR(50) NOT NULL DEFAULT 'General',
    social_links JSONB DEFAULT '{}'::jsonb,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    relationship_owner VARCHAR(255),
    communication_preferences JSONB DEFAULT '{"email": true, "whatsapp": true}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Event Guests (Join table for event participation)
CREATE TABLE IF NOT EXISTS event_guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL DEFAULT 'General',
    status VARCHAR(50) NOT NULL DEFAULT 'invited',
    plus_ones_allowed INT NOT NULL DEFAULT 0,
    plus_ones_registered INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, guest_id)
);

-- 8. Invitations
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    event_guest_id UUID NOT NULL REFERENCES event_guests(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    channel VARCHAR(50) NOT NULL DEFAULT 'email',
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    secure_token VARCHAR(100) UNIQUE NOT NULL,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. QR Passes
CREATE TABLE IF NOT EXISTS qr_passes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    event_guest_id UUID NOT NULL REFERENCES event_guests(id) ON DELETE CASCADE UNIQUE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    secure_token VARCHAR(100) NOT NULL UNIQUE,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Check-ins (Idempotent single entry per event_guest)
CREATE TABLE IF NOT EXISTS check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    event_guest_id UUID NOT NULL REFERENCES event_guests(id) ON DELETE CASCADE UNIQUE,
    pass_id UUID NOT NULL REFERENCES qr_passes(id) ON DELETE CASCADE,
    operator_id UUID REFERENCES profiles(id),
    operator_name VARCHAR(255) NOT NULL,
    method VARCHAR(50) NOT NULL DEFAULT 'qr_scan',
    checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    idempotency_key VARCHAR(255) UNIQUE NOT NULL
);

-- 11. Creators CRM (P1 Core)
CREATE TABLE IF NOT EXISTS creators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    handle VARCHAR(100) NOT NULL,
    profile_image TEXT,
    location VARCHAR(100) NOT NULL,
    categories TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    audience_size VARCHAR(50),
    engagement_rate VARCHAR(50),
    primary_platform VARCHAR(50) NOT NULL DEFAULT 'Instagram',
    social_links JSONB DEFAULT '{}'::jsonb,
    collaboration_count INT DEFAULT 0,
    average_sentiment VARCHAR(50) DEFAULT 'High',
    notes TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Content Submissions (P1 Tracking)
CREATE TABLE IF NOT EXISTS content_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES creators(id) ON DELETE SET NULL,
    creator_name VARCHAR(255) NOT NULL,
    post_url TEXT NOT NULL,
    platform VARCHAR(50) NOT NULL DEFAULT 'Instagram',
    post_type VARCHAR(50) NOT NULL DEFAULT 'Reel',
    published_at TIMESTAMPTZ NOT NULL,
    campaign_hashtags TEXT[] DEFAULT '{}',
    metrics JSONB DEFAULT '{"views": 0, "likes": 0, "comments": 0, "shares": 0}'::jsonb,
    evidence_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
    actor_id VARCHAR(100) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for high-speed tenant-scoped lookups
CREATE INDEX IF NOT EXISTS idx_events_org ON events(organisation_id);
CREATE INDEX IF NOT EXISTS idx_guests_org ON guests(organisation_id);
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_phone ON guests(phone);
CREATE INDEX IF NOT EXISTS idx_event_guests_event ON event_guests(event_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(secure_token);
CREATE INDEX IF NOT EXISTS idx_qr_passes_token ON qr_passes(secure_token);
CREATE INDEX IF NOT EXISTS idx_check_ins_event ON check_ins(event_id);
CREATE INDEX IF NOT EXISTS idx_creators_org ON creators(organisation_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organisation_id);

-- RLS Enablement
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Sample RLS Policy for Multi-tenant isolation:
-- Users can only read events belonging to organisations they are active members of.
CREATE POLICY "Users can access events of their organisations"
ON events
FOR ALL
USING (
    organisation_id IN (
        SELECT organisation_id FROM organisation_members
        WHERE user_id = auth.uid() AND status = 'active'
    )
);
