import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './env';

export interface DbHealthStatus {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  isConnected: boolean;
  latencyMs: number | null;
  host: string | null;
  databaseName: string | null;
  error?: string;
  isMemoryDb?: boolean;
}

let isConnecting = false;
let mongoMemoryServer: MongoMemoryServer | null = null;
let isUsingMemoryDb = false;

export const connectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1 || isConnecting) {
    return;
  }

  isConnecting = true;
  try {
    const isCloudUri = config.mongoUri.startsWith('mongodb+srv://');

    if (isCloudUri) {
      console.log(`🔌 Connecting to MongoDB Atlas Cloud: ${config.mongoUri.replace(/:([^:@]+)@/, ':****@')}`);
      await mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });
      console.log('✅ MongoDB Atlas connected successfully');
    } else {
      // Try local MongoDB port first
      try {
        console.log(`🔌 Attempting connection to local MongoDB: ${config.mongoUri}`);
        await mongoose.connect(config.mongoUri, {
          serverSelectionTimeoutMS: 2000,
          connectTimeoutMS: 3000,
        });
        console.log('✅ Local MongoDB daemon connected successfully');
      } catch (localErr) {
        // If local daemon is not running, spin up embedded local MongoMemoryServer
        console.log('🍃 Starting automated embedded local MongoDB instance...');
        mongoMemoryServer = await MongoMemoryServer.create();
        const memoryUri = mongoMemoryServer.getUri();
        isUsingMemoryDb = true;

        await mongoose.connect(memoryUri, {
          dbName: 'mealfit',
        });
        console.log('✅ Local MongoDB instance started & connected successfully!');
      }
    }
  } catch (error: any) {
    console.warn(`⚠️ MongoDB connection warning: ${error?.message || error}`);
  } finally {
    isConnecting = false;
  }
};

mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connection state: Connected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('🔌 Mongoose connection state: Disconnected');
});

export const checkDbHealth = async (): Promise<DbHealthStatus> => {
  const readyState = mongoose.connection.readyState;
  const isConnected = readyState === 1;

  if (!isConnected || !mongoose.connection.db) {
    return {
      status: 'disconnected',
      isConnected: false,
      latencyMs: null,
      host: null,
      databaseName: null,
      error: 'Database not connected',
      isMemoryDb: isUsingMemoryDb,
    };
  }

  try {
    const start = Date.now();
    await mongoose.connection.db.admin().ping();
    const latencyMs = Date.now() - start;

    return {
      status: 'connected',
      isConnected: true,
      latencyMs,
      host: isUsingMemoryDb ? 'localhost (Embedded Local MongoDB)' : mongoose.connection.host,
      databaseName: mongoose.connection.name,
      isMemoryDb: isUsingMemoryDb,
    };
  } catch (err: any) {
    return {
      status: 'error',
      isConnected: false,
      latencyMs: null,
      host: mongoose.connection.host || null,
      databaseName: mongoose.connection.name || null,
      error: err.message,
      isMemoryDb: isUsingMemoryDb,
    };
  }
};

export const closeDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('🛑 MongoDB connection closed gracefully');
  }
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
    console.log('🛑 Local MongoDB server stopped');
  }
};
