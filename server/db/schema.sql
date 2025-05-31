-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    display_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create clubs table
CREATE TABLE IF NOT EXISTS clubs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    logo_url VARCHAR(255),
    member_limit INTEGER,
    application_required BOOLEAN DEFAULT false,
    experience_level VARCHAR(50),
    commitment_level VARCHAR(50),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_published BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- Create club_tags table
CREATE TABLE IF NOT EXISTS club_tags (
    id SERIAL PRIMARY KEY,
    club_id INTEGER REFERENCES clubs(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    value VARCHAR(100) NOT NULL,
    UNIQUE(club_id, category, value)
);

-- Create club_social_links table
CREATE TABLE IF NOT EXISTS club_social_links (
    id SERIAL PRIMARY KEY,
    club_id INTEGER REFERENCES clubs(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    url VARCHAR(255) NOT NULL,
    UNIQUE(club_id, platform)
);

-- Create meeting_times table
CREATE TABLE IF NOT EXISTS meeting_times (
    id SERIAL PRIMARY KEY,
    club_id INTEGER REFERENCES clubs(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

-- Create club_members table
CREATE TABLE IF NOT EXISTS club_members (
    id SERIAL PRIMARY KEY,
    club_id INTEGER REFERENCES clubs(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(club_id, user_id)
);

-- Create club_applications table
CREATE TABLE IF NOT EXISTS club_applications (
    id SERIAL PRIMARY KEY,
    club_id INTEGER REFERENCES clubs(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'PENDING',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(club_id, user_id)
); 