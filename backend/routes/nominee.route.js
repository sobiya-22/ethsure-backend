import express from "express";
import { addNominee} from "../controllers/nominee.controller.js";

const router = express.Router();

router.post("/add", addNominee);

export default router;
