CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       email VARCHAR(255) UNIQUE NOT NULL,
                       password TEXT NOT NULL,
                       username VARCHAR(100) UNIQUE NOT NULL,
                       zip_root VARCHAR(255),
                       image_root VARCHAR(255),
                       createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE images (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        width INTEGER NOT NULL,
                        height INTEGER NOT NULL,
                        image_type VARCHAR(255) NOT NULL,
                        public_id TEXT NOT NULL,
                        image_url TEXT NOT NULL,
                        createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
