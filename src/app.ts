import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import routes from "./modules";
import { errorHandler } from "./common/middlewares/errorHandler";

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "blob:"],
        "script-src": ["'self'", "'unsafe-inline'", "https:"],
        "font-src": ["'self'", "https:", "data:"],
      },
    },
  })
);

app.use("/api/v1", routes);

app.use(errorHandler);

export default app;
