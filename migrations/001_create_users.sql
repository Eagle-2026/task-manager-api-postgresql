CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    name VARCHAR(20)
        NOT NULL
        CHECK (char_length(name) >= 3),

    email VARCHAR(255)
        UNIQUE
        NOT NULL,

    password VARCHAR(255)
        NOT NULL,

    role VARCHAR(20)
        NOT NULL
        DEFAULT 'user'
        CHECK (role IN ('user', 'admin')),

    profile_image_url TEXT,

    profile_image_public_id TEXT,

    created_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
);