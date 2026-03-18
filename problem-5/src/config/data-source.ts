import "reflect-metadata";
import path from "path";
import { DataSource } from "typeorm";
import { env } from "./env";
import { Resource } from "../entities/Resource.entity";

const isDev = env.NODE_ENV !== "production";
const shouldSync = isDev || env.DB_SYNCHRONIZE;

const databasePath = path.isAbsolute(env.SQLITE_DATABASE)
  ? env.SQLITE_DATABASE
  : path.resolve(process.cwd(), env.SQLITE_DATABASE);

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: databasePath,
  synchronize: shouldSync,
  logging: true,
  entities: [Resource],
  migrations: [],
  subscribers: [],
});
