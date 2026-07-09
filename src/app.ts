import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes";
import { env } from "./config/env";
import { notFound } from "./middlewares/notFound.middleware";
import { errorHandler } from "./middlewares/errorHandler.middleware";

const app: Application = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl }));
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
