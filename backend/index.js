import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./utils/connectDB.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
import agentRoutes from "./routes/agent.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import adminRoutes from "./routes/admin.routes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/admin", adminRoutes);


app.listen(process.env.PORT || 8000, () => {
    connectDB();
    console.log(`Server listening on ${process.env.PORT || 8000}`);
});