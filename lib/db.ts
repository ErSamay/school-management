import mysql from 'mysql2/promise';

const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'samay#930',
  database: 'school_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Simplified - no auto database creation
export async function initializeDatabase(): Promise<void> {
  try {
    // Just test the connection
    await connection.execute('SELECT 1');
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export default connection;
