import mongoose from 'mongoose';
import { getMongoConfig, isDev, isProd, isSandbox } from '../utils/environment';

let connection: mongoose.Connection | null = null;

export const connectMongoose = async (): Promise<void> => {
    try {
        const mongoConfig = getMongoConfig();

        console.log('🔌 Connecting to MongoDB with Mongoose...');
        console.log(`   Environment: ${isProd() ? 'Production' : isSandbox() ? 'Sandbox' : 'Development'}`);
        console.log(`   Database: ${mongoConfig.dbName}`);
        mongoose.set('strictQuery', false);

        const mongooseOptions = {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            maxPoolSize: isDev() ? 5 : 10,
            family: 4,
            dbName: mongoConfig.dbName
        };

        await mongoose.connect(mongoConfig.uri, mongooseOptions);

        connection = mongoose.connection;

        connection.on('error', (err) => {
            console.error('❌ Mongoose connection error:', err);
        });

        connection.on('disconnected', () => {
            console.log('❗ Mongoose disconnected');
        });

        connection.on('reconnected', () => {
            console.log('✅ Mongoose reconnected');
        });

        console.log('✅ Connected to MongoDB with Mongoose successfully');

    } catch (error) {
        console.error('❌ Mongoose connection error:', error);
        throw new Error(`Failed to connect to MongoDB with Mongoose: ${error}`);
    }
};

export const closeMongoose = async (): Promise<void> => {
    if (connection) {
        await mongoose.disconnect();
        console.log('📴 Mongoose connection closed');
    }
};

export const getMongooseConnection = (): mongoose.Connection => {
    if (!connection) {
        throw new Error('Mongoose not connected. Call connectMongoose() first.');
    }
    return connection;
};
