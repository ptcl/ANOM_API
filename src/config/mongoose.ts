import mongoose from 'mongoose';
import { getMongoConfig, isDev } from '../utils/environment';

let connection: mongoose.Connection | null = null;

export const connectMongoose = async (): Promise<void> => {
    try {
        const mongoConfig = getMongoConfig();

        console.log('🔌 Connecting to MongoDB with Mongoose...');
        console.log(`   Environment: ${isDev() ? 'Development' : 'Production'}`);
        console.log(`   Database: ${mongoConfig.dbName}`);
        console.log(`   URI: ${mongoConfig.uri.replace(/\/\/.*@/, '//***@')}`); // Masque les credentials
        
        // Configurer les options de connexion Mongoose
        mongoose.set('strictQuery', false);
        
        // Augmenter le délai de connexion pour éviter les timeouts
        const mongooseOptions = {
            serverSelectionTimeoutMS: 30000, // 30 secondes au lieu de 10
            socketTimeoutMS: 45000,
            maxPoolSize: isDev() ? 5 : 10,
            family: 4
        };
        
        // Connexion à MongoDB avec Mongoose
        await mongoose.connect(mongoConfig.uri, mongooseOptions);
        
        connection = mongoose.connection;
        
        // Événements de connexion
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
