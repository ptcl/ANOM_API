import { MongoClient, Db } from 'mongodb';
import { getMongoConfig, isProd, isSandbox, isDev } from '../utils/environment';

class DatabaseService {
    private static instance: DatabaseService;
    private client: MongoClient | null = null;
    private db: Db | null = null;

    private constructor() { }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    async connect(): Promise<void> {
        const { uri, dbName } = getMongoConfig();
        const envLabel = isProd() ? 'Production' : isSandbox() ? 'Sandbox' : 'Development';
        const maskedUri = uri.replace(/\/\/.*@/, '//***@');

        console.log(`🔌 MongoDB → ${envLabel} | ${dbName}`);

        try {
            this.client = new MongoClient(uri, {
                maxPoolSize: isProd() ? 10 : 5,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                family: 4
            });

            await this.client.connect();
            this.db = this.client.db(dbName);

            console.log(`✅ Connected to MongoDB (${dbName})`);
        } catch (err) {
            console.error('❌ MongoDB connection error:', err);
            throw err;
        }
    }

    getDb(): Db {
        if (!this.db) throw new Error('Database not initialized. Call connect() first.');
        return this.db;
    }

    async close(): Promise<void> {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.db = null;
            console.log('📴 MongoDB connection closed');
        }
    }

    async healthCheck(): Promise<boolean> {
        try {
            if (!this.client) return false;
            await this.client.db('admin').command({ ping: 1 });
            return true;
        } catch {
            return false;
        }
    }
}

const databaseService = DatabaseService.getInstance();

export const connectDB = () => databaseService.connect();
export const getDB = () => databaseService.getDb();
export const closeDB = () => databaseService.close();
export const dbHealthCheck = () => databaseService.healthCheck();
