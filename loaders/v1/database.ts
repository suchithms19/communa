import { PrismaClient } from '@prisma/client';
import Logger from '@universe/v1/libraries/logger';

class Database {
  static instance: PrismaClient;

  static async Loader() {
    try {
      const client = new PrismaClient();
      await client.$connect();
      Database.instance = client;
      Logger.instance.info('Database connected successfully');
    } catch (error) {
      Logger.instance.error('Database connection failed:', error);
      process.exit(1);
    }
  }
}

export default Database; 