import { DataSource } from "typeorm";
import { ENV } from "./index";

export const AppDataSource = new DataSource({
  type: "mssql",
  host: ENV.DB_SERVER,
  port: ENV.DB_PORT,
  username: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
  synchronize: false,
  logging: true,
  entities: ["src/modules/**/*.model.ts"],
  options: {
    encrypt: false,
    trustServerCertificate: true,
    instanceName: ENV.DB_INSTANCE,
  },
});
