import { PrismaClient } from '@prisma/client';

class Database {
  static instance: PrismaClient;

  static async Loader() {
    try {
      const client = new PrismaClient();
      await client.$connect();
      Database.instance = client;
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error);
      process.exit(1);
    }
  }
}

export default Database; 