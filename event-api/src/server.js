import express from "express";
import bodyParser from "body-parser";
import routes from "./routes/index.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);

app.use('/api', routes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export default app;
