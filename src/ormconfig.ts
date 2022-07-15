import { ConnectionOptions } from "typeorm";
import * as dotenv from 'dotenv';
dotenv.config();

const config: ConnectionOptions = {
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: 5432,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: false,
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    ssl: true,
    extra: {
        ssl: {
            rejectUnauthorized: false
        }
    },
    cli: {
        migrationsDir: 'src/migrations',
    },
};

export default config;