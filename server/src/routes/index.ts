import { Router } from "express";
import { albumRouter } from "./album.routes";
import { authRouter } from "./auth.routes";
import { commentRouter } from "./comment.routes";
import { photoRouter } from "./photo.routes";
import { searchRouter } from "./search.routes";
import { userRouter } from "./user.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/photos", photoRouter);
apiRouter.use("/albums", albumRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/search", searchRouter);
apiRouter.use("/comments", commentRouter);
