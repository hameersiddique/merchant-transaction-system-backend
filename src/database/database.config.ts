import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { getEnv } from '../common/utils/env.util';

config();

const configService = new ConfigService();
const env = getEnv(configService);

const dbConfig = {
    type: 'postgres' as const,
    host: env.databaseHost,
    port: env.databasePort,
    username: env.databaseUser,
    password: env.databasePassword,
    database: env.databaseName,
    synchronize: false,
    logging: env.nodeEnv === 'development',
};

export const databaseConfig: TypeOrmModuleOptions = {
    ...dbConfig,
    autoLoadEntities: true,
    migrations: ['dist/database/migrations/*.js'],
    migrationsRun: true,
};

export default new DataSource({
    ...dbConfig,
    entities: ['src/modules/**/*.entity.ts'],
    migrations: ['src/database/migrations/*.ts'],
});