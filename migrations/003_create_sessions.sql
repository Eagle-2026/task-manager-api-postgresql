CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,

    user_id INTEGER
        NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    refresh_token_hash TEXT
        NOT NULL,

    expires_at TIMESTAMP
        NOT NULL,

    revoked BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    created_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
);