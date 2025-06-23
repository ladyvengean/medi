// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import userRouter from './routes/user.routes.js';
// // import wasteReportRouter from "./routes/wasteReport.routes.js";
// // import collectorRouter from "./routes/collector.routes.js";
// import geminiroute from "./routes/gemini.route.js";
// // import { healthcheck } from "./controllers/healthcheck.controller.js";
// import paperRouter from './routes/papers.routes.js';

// const app = express();

// app.use(cors({
//   origin: process.env.CORS_ORIGIN,
//   credentials: true
// }));

// app.use(express.json({limit: "16kb"}));
// app.use(express.urlencoded({extended: true, limit: "16kb"}));
// app.use(express.static("public"));
// app.use(cookieParser());

// // Root route
// app.get("/", (req, res) => {
//   res.send("Waste classification API is running");
// });

// // Routes declaration
// // app.use("/api/v1/users", userRouter);
// // app.use("/api/v1/waste-report", wasteReportRouter);
// // app.use("/api/v1/collectors", collectorRouter);
// // app.use("/api/v1/upload", geminiroute);
// // app.use("/api/v1/healthcheck", healthcheck);
// // app.use("/api/v1/papers", paperRouter);
// app.use("/api/v1/upload", geminiroute); // Uncomment this line

// export { app };


import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import geminiroute from "./routes/gemini.route.js";
import userRoutes from "./routes/user.routes.js";



const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

// Root route
app.get("/", (req, res) => {
  res.send("Waste classification API is running");
});

//Routes declaration
app.use("/api/v1/upload", geminiroute);
app.use("/api/v1/auth", userRoutes);

export { app };

