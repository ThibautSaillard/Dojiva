import { Router, type IRouter } from "express";
import healthRouter from "./health";
import academyRouter from "./academy";
import tradingRouter from "./trading";

const router: IRouter = Router();

router.use(healthRouter);
router.use(academyRouter);
router.use(tradingRouter);

export default router;
