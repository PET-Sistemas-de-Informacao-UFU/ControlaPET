CREATE TABLE refresh_tokens (
    token_hash varchar(64) PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at timestamp with time zone NOT NULL
);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);
