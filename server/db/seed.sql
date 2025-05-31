-- Insert sample users
INSERT INTO users (display_name, email, profile_image) VALUES
    ('John Doe', 'john@example.com', 'https://i.pravatar.cc/150?u=1'),
    ('Jane Smith', 'jane@example.com', 'https://i.pravatar.cc/150?u=2')
ON CONFLICT (email) DO NOTHING;

-- Insert sample clubs
INSERT INTO clubs (name, description, logo_url, member_limit, application_required, experience_level, commitment_level, is_published, status) VALUES
    ('Code Crafters', 'A club for passionate programmers to collaborate on exciting projects', 'https://source.unsplash.com/800x600/?coding', 50, true, 'Intermediate', 'Dedicated', true, 'ACTIVE'),
    ('Data Science Society', 'Explore the world of data analysis and machine learning', 'https://source.unsplash.com/800x600/?data', 40, true, 'Beginner', 'Standard', true, 'ACTIVE'),
    ('Web Dev Warriors', 'Learn and practice modern web development technologies', 'https://source.unsplash.com/800x600/?webdev', 30, false, 'Beginner', 'Casual', true, 'ACTIVE'),
    ('AI Innovators', 'Pushing the boundaries of artificial intelligence', 'https://source.unsplash.com/800x600/?ai', 25, true, 'Advanced', 'Intensive', true, 'ACTIVE'),
    ('Design Den', 'Creative space for UI/UX enthusiasts', 'https://source.unsplash.com/800x600/?design', 35, false, 'Beginner', 'Standard', true, 'ACTIVE');

-- Insert club tags
INSERT INTO club_tags (club_id, category, value) VALUES
    (1, 'Technology', 'Software Development'),
    (1, 'Technology', 'Web Development'),
    (2, 'Technology', 'Data Science'),
    (2, 'Technology', 'AI/Machine Learning'),
    (3, 'Technology', 'Web Development'),
    (3, 'Technology', 'UI/UX Design'),
    (4, 'Technology', 'AI/Machine Learning'),
    (4, 'Technology', 'Software Development'),
    (5, 'Arts', 'Design'),
    (5, 'Technology', 'UI/UX Design');

-- Insert social links
INSERT INTO club_social_links (club_id, platform, url) VALUES
    (1, 'github', 'https://github.com/codecrafters'),
    (1, 'discord', 'https://discord.gg/codecrafters'),
    (2, 'github', 'https://github.com/datasciencesociety'),
    (2, 'linkedin', 'https://linkedin.com/company/datasciencesociety'),
    (3, 'github', 'https://github.com/webdevwarriors'),
    (3, 'discord', 'https://discord.gg/webdevwarriors'),
    (4, 'github', 'https://github.com/aiinnovators'),
    (4, 'linkedin', 'https://linkedin.com/company/aiinnovators'),
    (5, 'github', 'https://github.com/designden'),
    (5, 'instagram', 'https://instagram.com/designden');

-- Insert meeting times
INSERT INTO meeting_times (club_id, day_of_week, start_time, end_time) VALUES
    (1, 'Monday', '18:00', '20:00'),
    (1, 'Thursday', '18:00', '20:00'),
    (2, 'Tuesday', '17:00', '19:00'),
    (2, 'Friday', '16:00', '18:00'),
    (3, 'Wednesday', '19:00', '21:00'),
    (4, 'Monday', '17:00', '19:00'),
    (4, 'Thursday', '17:00', '19:00'),
    (5, 'Tuesday', '18:00', '20:00'); 