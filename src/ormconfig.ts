import {ConnectionOptions} from "typeorm";
import * as fs from 'fs';
import * as dotenv from 'dotenv';

const environment = process.env.NODE_ENV || 'development';
const {
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_USERNAME,
    DATABASE_PASSWORD,
    DATABASE_NAME
} = dotenv.parse(fs.readFileSync(`${environment}.env`));

const config: ConnectionOptions = {
    type: 'postgres',
    host: DATABASE_HOST,
    port: parseInt(DATABASE_PORT) || 5432,
    username: DATABASE_USERNAME,
    password: DATABASE_PASSWORD,
    database: DATABASE_NAME,
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: false,
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    cli: {
        migrationsDir: 'src/migrations',
    },
};

export default config;