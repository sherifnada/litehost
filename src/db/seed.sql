CREATE TABLE subdomain_owner (
    subdomain TEXT NOT NULL UNIQUE,
    id UUID NOT NULL PRIMARY KEY,
    owner TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_subdomain ON subdomain_owner (subdomain);
CREATE INDEX idx_owner ON subdomain_owner (owner);
