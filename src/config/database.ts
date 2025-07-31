import { MongoClient, Db } from 'mongodb';
import { getMongoConfig, isDev } from '../utils/environment';

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
        try {
            const mongoConfig = getMongoConfig();

            console.log('🔌 Connecting to MongoDB...');
            console.log(`   Environment: ${isDev() ? 'Development' : 'Production'}`);
            console.log(`   Database: ${mongoConfig.dbName}`);
            console.log(`   URI: ${mongoConfig.uri.replace(/\/\/.*@/, '//***@')}`); // Masque les credentials

            this.client = new MongoClient(mongoConfig.uri, {
                maxPoolSize: isDev() ? 5 : 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                family: 4
            });

            await this.client.connect();

            // Test the connection
            await this.client.db('admin').command({ ping: 1 });

            this.db = this.client.db(mongoConfig.dbName);

            console.log('✅ Connected to MongoDB successfully');
            console.log(`📊 Database: ${this.db.databaseName}`);

            // Create indexes
            await this.createIndexes();

        } catch (error) {
            console.error('❌ MongoDB connection error:', error);
            throw error;
        }
    }

    private async createIndexes(): Promise<void> {
        if (!this.db) return;

        try {
            console.log('🔧 Creating database indexes...');

            // Players collection indexes
            await this.db.collection('players').createIndex(
                { bungieId: 1 },
                { unique: true, name: 'bungieId_unique' }
            );
            await this.db.collection('players').createIndex(
                { displayName: 1 },
                { name: 'displayName_index' }
            );
            await this.db.collection('players').createIndex(
                { lastActivity: -1 },
                { name: 'lastActivity_desc' }
            );

            console.log('✅ Database indexes created successfully');
        } catch (error) {
            console.error('❌ Error creating indexes:', error);
            // Ne pas faire planter l'app pour les indexes
        }
    }

    getDb(): Db {
        if (!this.db) {
            throw new Error('Database not initialized. Call connect() first.');
        }
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
        } catch (error) {
            console.error('Database health check failed:', error);
            return false;
        }
    }
}

// Export singleton
const databaseService = DatabaseService.getInstance();

export const connectDB = () => databaseService.connect();
export const getDB = () => databaseService.getDb();
export const closeDB = () => databaseService.close();
export const dbHealthCheck = () => databaseService.healthCheck();