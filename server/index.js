const express = require('express');
const cors = require('cors');
const pool = require('./db/config');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Get all clubs
app.get('/api/clubs', async (req, res) => {
  try {
    // First, get all user-created clubs
    console.log('Attempting to fetch user-created clubs...');
    const userClubsResult = await pool.query(`
      SELECT 
        c.*,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT CASE WHEN ct.category IS NOT NULL 
          THEN ct.category || ':' || ct.value 
          ELSE NULL END), NULL) as tags,
        COALESCE(
          JSON_OBJECT_AGG(DISTINCT csl.platform, csl.url) FILTER (WHERE csl.platform IS NOT NULL),
          '{}'::json
        ) as social_links,
        COALESCE(
          JSON_OBJECT_AGG(DISTINCT mt.day_of_week, 
            ARRAY_AGG(mt.start_time || ' - ' || mt.end_time ORDER BY mt.start_time)
          ) FILTER (WHERE mt.day_of_week IS NOT NULL),
          '{}'::json
        ) as meeting_times,
        u.display_name as created_by_name,
        u.profile_image as created_by_image
      FROM clubs c
      LEFT JOIN club_tags ct ON c.id = ct.club_id
      LEFT JOIN club_social_links csl ON c.id = csl.club_id
      LEFT JOIN meeting_times mt ON c.id = mt.club_id
      LEFT JOIN users u ON c.created_by = u.id
      WHERE c.created_by IS NOT NULL
      GROUP BY c.id, u.id, u.display_name, u.profile_image
      ORDER BY c.created_at DESC
    `);
    console.log('Successfully fetched user-created clubs');

    // Then, get all filler/sample clubs
    console.log('Attempting to fetch sample clubs...');
    const fillerClubsResult = await pool.query(`
      SELECT 
        c.*,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT CASE WHEN ct.category IS NOT NULL 
          THEN ct.category || ':' || ct.value 
          ELSE NULL END), NULL) as tags,
        COALESCE(
          JSON_OBJECT_AGG(DISTINCT csl.platform, csl.url) FILTER (WHERE csl.platform IS NOT NULL),
          '{}'::json
        ) as social_links,
        COALESCE(
          JSON_OBJECT_AGG(DISTINCT mt.day_of_week, 
            ARRAY_AGG(mt.start_time || ' - ' || mt.end_time ORDER BY mt.start_time)
          ) FILTER (WHERE mt.day_of_week IS NOT NULL),
          '{}'::json
        ) as meeting_times
      FROM clubs c
      LEFT JOIN club_tags ct ON c.id = ct.club_id
      LEFT JOIN club_social_links csl ON c.id = csl.club_id
      LEFT JOIN meeting_times mt ON c.id = mt.club_id
      WHERE c.created_by IS NULL 
        AND c.is_published = true 
        AND c.status = 'ACTIVE'
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    console.log('Successfully fetched sample clubs');

    // Combine and format the results
    const allClubs = [
      ...userClubsResult.rows.map(row => ({
        ...row,
        tags: row.tags || [],
        social_links: row.social_links || {},
        meeting_times: row.meeting_times || {},
        is_user_created: true
      })),
      ...fillerClubsResult.rows.map(row => ({
        ...row,
        tags: row.tags || [],
        social_links: row.social_links || {},
        meeting_times: row.meeting_times || {},
        is_user_created: false,
        created_by_name: null,
        created_by_image: null
      }))
    ];

    console.log(`Sending response with ${allClubs.length} clubs`);
    res.json(allClubs);
  } catch (error) {
    console.error('Detailed error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
      hint: error.hint
    });
  }
});

// Get a single club
app.get('/api/clubs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        c.*,
        array_agg(DISTINCT ct.category || ':' || ct.value) as tags,
        json_object_agg(DISTINCT csl.platform, csl.url) FILTER (WHERE csl.platform IS NOT NULL) as social_links,
        json_object_agg(DISTINCT mt.day_of_week, 
          json_agg(mt.start_time || ' - ' || mt.end_time) 
          FILTER (WHERE mt.day_of_week IS NOT NULL)
        ) FILTER (WHERE mt.day_of_week IS NOT NULL) as meeting_times
      FROM clubs c
      LEFT JOIN club_tags ct ON c.id = ct.club_id
      LEFT JOIN club_social_links csl ON c.id = csl.club_id
      LEFT JOIN meeting_times mt ON c.id = mt.club_id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Club not found' });
    }

    res.json({
      ...result.rows[0],
      tags: result.rows[0].tags || [],
      social_links: result.rows[0].social_links || {},
      meeting_times: result.rows[0].meeting_times || {}
    });
  } catch (error) {
    console.error('Error fetching club:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a club
app.post('/api/clubs', async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, description, logo_url, member_limit, application_required, 
            experience_level, commitment_level, created_by, tags, social_links, 
            meeting_times } = req.body;

    await client.query('BEGIN');

    // Insert club
    const clubResult = await client.query(
      `INSERT INTO clubs (
        name, description, logo_url, member_limit, 
        application_required, experience_level, commitment_level,
        created_by, status, is_published
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING id`,
      [
        name, description, logo_url, member_limit,
        application_required, experience_level, commitment_level,
        created_by, 'ACTIVE', true
      ]
    );

    const clubId = clubResult.rows[0].id;

    // Insert tags
    if (tags?.interests) {
      for (const interest of tags.interests) {
        await client.query(
          'INSERT INTO club_tags (club_id, category, value) VALUES ($1, $2, $3)',
          [clubId, 'Interest', interest]
        );
      }
    }

    // Insert social links
    if (social_links) {
      for (const [platform, url] of Object.entries(social_links)) {
        if (url) {
          await client.query(
            'INSERT INTO club_social_links (club_id, platform, url) VALUES ($1, $2, $3)',
            [clubId, platform, url]
          );
        }
      }
    }

    // Insert meeting times
    if (meeting_times) {
      for (const [day, times] of Object.entries(meeting_times)) {
        for (const time of times) {
          const [start, end] = time.split(' - ');
          await client.query(
            'INSERT INTO meeting_times (club_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4)',
            [clubId, day, start, end]
          );
        }
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ id: clubId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating club:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Join a club
app.post('/api/clubs/:id/join', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { userId } = req.body;

    await client.query('BEGIN');

    // Check if user is already a member
    const memberCheck = await client.query(
      'SELECT id FROM club_members WHERE club_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (memberCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User is already a member of this club' });
    }

    // Add user to club members
    await client.query(
      'INSERT INTO club_members (club_id, user_id) VALUES ($1, $2)',
      [id, userId]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Successfully joined club' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error joining club:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Leave a club
app.post('/api/clubs/:id/leave', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { userId } = req.body;

    await client.query('BEGIN');

    // Check if user is a member
    const memberCheck = await client.query(
      'SELECT id FROM club_members WHERE club_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(400).json({ error: 'User is not a member of this club' });
    }

    // Remove user from club members
    await client.query(
      'DELETE FROM club_members WHERE club_id = $1 AND user_id = $2',
      [id, userId]
    );

    await client.query('COMMIT');
    res.status(200).json({ message: 'Successfully left club' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error leaving club:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Apply to a club
app.post('/api/clubs/:id/apply', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const result = await pool.query(
      'INSERT INTO club_applications (club_id, user_id, status) VALUES ($1, $2, $3) RETURNING id',
      [id, userId, 'PENDING']
    );

    res.status(201).json({ id: result.rows[0].id });
  } catch (error) {
    console.error('Error applying to club:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 