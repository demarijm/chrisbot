import { drizzle } from 'drizzle-orm/libsql';
const db = drizzle({ 
    connection: {
        url: process.env.DATABASE_URL || 'postgres://localhost:5432/drizzle',
        authToken: process.env.DATABASE_AUTH_TOKEN
    }
});

export default db;