import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./env";
import { Resource } from "../entities/Resource.entity";

const isDev = env.NODE_ENV !== "production";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: isDev,
  logging: true,
  entities: [Resource],
  migrations: [],
  subscribers: [],
});
