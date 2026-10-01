CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,

    title VARCHAR(255)
        NOT NULL,

    description TEXT,

    completed BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    user_id INTEGER
        NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    created_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
);