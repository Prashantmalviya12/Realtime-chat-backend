import express, { Application, Request, Response } from "express";
import cors from "cors";
import chatRoutes from "./modules/chat/chat.routes";
import messageRoutes from "./modules/message/message.routes";
import userRoutes from "./modules/user/user.routes";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

const app: Application = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Chat backend is running"
  });
});

app.use("/chat", chatRoutes);
app.use("/chat", messageRoutes);
app.use("/user", userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
