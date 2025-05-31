import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.REACT_APP_DB_USER || 'postgres',
  host: process.env.REACT_APP_DB_HOST || 'localhost',
  database: process.env.REACT_APP_DB_NAME || 'edtech',
  password: process.env.REACT_APP_DB_PASSWORD || 'postgres',
  port: process.env.REACT_APP_DB_PORT || 5432,
});

export default pool; 