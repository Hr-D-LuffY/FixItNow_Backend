import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes";
import { env } from "./config/env";

const app: Application = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    errorDetails: null,
  });
});

export default app;