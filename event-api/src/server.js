import express from "express";
import bodyParser from "body-parser";
import routes from "./routes/index.js";
import errorHandler from "./middlewares/errorHandler.js";
import notFoundHandler from "./middlewares/notFoundHandler.js";
import cors from "./middlewares/cors.js";

const app = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors);

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}/`);
});
