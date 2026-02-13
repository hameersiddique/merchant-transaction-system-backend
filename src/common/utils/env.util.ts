import { ConfigService } from '@nestjs/config';

export const getEnv = (config: ConfigService) => ({
    // app
    nodeEnv: config.get<string>('NODE_ENV') || 'development',
    port: Number(config.get<string>('PORT')) || 3001,

    // DB
    databaseHost: config.get<string>('DATABASE_HOST') || 'localhost',
    databasePort: Number(config.get<string>('DATABASE_PORT')) || 5433,
    databaseUser: config.get<string>('DATABASE_USER') || 'merchant_user',
    databasePassword: config.get<string>('DATABASE_PASSWORD') || 'merchant_pass',
    databaseName: config.get<string>('DATABASE_NAME') || 'merchant_db',

    // JWT
    jwtSecret: config.get<string>('JWT_SECRET') || 'super-secret-jwt-key-change-this-in-production',
    jwtExpiresIn: Number(config.get<string>('JWT_EXPIRES_IN')) || 3600,
    refreshTokenExpiry: Number(config.get<string>('REFRESH_TOKEN_EXPIRY')) || 36000,

    // redis
    redisHost: config.get<string>('REDIS_HOST') || 'localhost',
    redisPort: Number(config.get<string>('REDIS_PORT')) || 6379,
    redisPassword: config.get<string>('REDIS_PASSWORD') || '',
    redisTtl: Number(config.get<string>('REDIS_TTL')) || 30000, // 30 sec

    // rabbitMQ
    rabbitUrl: config.get<string>('RABBITMQ_URL') || 'amqp://merchant:merchant_rabbitmq@localhost:5672',
    rabbitUser: config.get<string>('RABBITMQ_DEFAULT_USER') || 'merchant',
    rabbitPassword: config.get<string>('RABBITMQ_DEFAULT_PASS') || 'merchant_rabbitmq',
    rabbitVHost: config.get<string>('RABBITMQ_DEFAULT_VHOST') || '/',
    rabbitExchange: config.get<string>('RABBITMQ_EXCHANGE') || 'merchant.transactions',
    rabbitQueue: config.get<string>('RABBITMQ_QUEUE') || 'transaction.created',
    rabbitRoutingKey: config.get<string>('RABBITMQ_ROUTING_KEY') || 'transaction.created',

    // cors
    corsOrigin: config.get<string>('CORS_ORIGIN') || 'http://localhost:3000',

    // logging
    logLevel: config.get<string>('LOG_LEVEL') || 'debug',

    // docker
    networkName: config.get<string>('NETWORK_NAME') || 'merchant-network',

    postgresImage: config.get<string>('POSTGRES_IMAGE') || 'postgres:15-alpine',
    postgresContainerName: config.get<string>('POSTGRES_CONTAINER_NAME') || 'merchant-postgres',
    postgresHostPort: Number(config.get<string>('POSTGRES_HOST_PORT')) || 5433,
    postgresContainerPort: Number(config.get<string>('POSTGRES_CONTAINER_PORT')) || 5432,
    postgresVolumeName: config.get<string>('POSTGRES_VOLUME_NAME') || 'postgres_data',

    redisImage: config.get<string>('REDIS_IMAGE') || 'redis:7-alpine',
    redisContainerName: config.get<string>('REDIS_CONTAINER_NAME') || 'merchant-redis',
    redisHostPort: Number(config.get<string>('REDIS_HOST_PORT')) || 6379,
    redisContainerPort: Number(config.get<string>('REDIS_CONTAINER_PORT')) || 6379,
    redisAppendOnly: config.get<string>('REDIS_APPENDONLY') || 'yes',

    rabbitmqImage: config.get<string>('RABBITMQ_IMAGE') || 'rabbitmq:3-management-alpine',
    rabbitmqContainerName: config.get<string>('RABBITMQ_CONTAINER_NAME') || 'merchant-rabbitmq',
    rabbitmqHostPort: Number(config.get<string>('RABBITMQ_HOST_PORT')) || 5672,
    rabbitmqContainerPort: Number(config.get<string>('RABBITMQ_CONTAINER_PORT')) || 5672,
    rabbitmqManagementHostPort: Number(config.get<string>('RABBITMQ_MANAGEMENT_HOST_PORT')) || 15672,
    rabbitmqManagementContainerPort: Number(config.get<string>('RABBITMQ_MANAGEMENT_CONTAINER_PORT')) || 15672,
    rabbitmqDataVolumeName: config.get<string>('RABBITMQ_DATA_VOLUME_NAME') || 'rabbitmq_data',
    rabbitmqLogVolumeName: config.get<string>('RABBITMQ_LOG_VOLUME_NAME') || 'rabbitmq_log',

    backendContainerName: config.get<string>('BACKEND_CONTAINER_NAME') || 'merchant-backend',
    backendDockerfile: config.get<string>('BACKEND_DOCKERFILE') || 'Dockerfile',
    backendBuildTarget: config.get<string>('BACKEND_BUILD_TARGET') || 'development',
    backendHostPort: Number(config.get<string>('BACKEND_HOST_PORT')) || 3001,
    backendStartCommand: config.get<string>('BACKEND_START_COMMAND') || 'npm run start:dev',
    debugPort: Number(config.get<string>('DEBUG_PORT')) || 9229,

    restartPolicy: config.get<string>('RESTART_POLICY') || 'unless-stopped',
});
