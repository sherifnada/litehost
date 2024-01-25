CREATE TABLE subdomain_owner (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    subdomain TEXT NOT NULL UNIQUE,
    owner TEXT NOT NULL
);

CREATE INDEX idx_subdomain ON subdomain_owner (subdomain);
CREATE INDEX idx_owner ON subdomain_owner (owner);
