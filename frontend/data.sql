-- 1. Create the USERS table
CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       email VARCHAR(255) UNIQUE NOT NULL,
                       password TEXT NOT NULL,
                       username VARCHAR(100) UNIQUE NOT NULL,
                       zip_root VARCHAR(255),
                       image_root VARCHAR(255),
                       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create the ZIPS table
-- Represents the ZIP files uploaded by a user
CREATE TABLE zips (
                      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                      zip_name VARCHAR(255) NOT NULL,
                      status VARCHAR(50) DEFAULT 'pending', -- e.g., pending, processing, completed
                      total_files INTEGER DEFAULT 0,
                      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create the IMAGES table
-- Represents individual images extracted from a ZIP or uploaded separately
CREATE TABLE images (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        zip_id UUID REFERENCES zips(id) ON DELETE SET NULL, -- Nullable if images are uploaded outside a zip
                        public_id TEXT NOT NULL, -- The Cloudinary Public ID
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for Performance
-- Crucial for fast lookups when a user views their gallery
CREATE INDEX idx_zips_user_id ON zips(user_id);
CREATE INDEX idx_images_user_id ON images(user_id);
CREATE INDEX idx_images_zip_id ON images(zip_id);