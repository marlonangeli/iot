import connectMongo from "./config/database";
import errorHandler from "./middlewares/errorHandler";
import express from 'express'
import dotenv from 'dotenv'

const app = express();
dotenv.config({
    path: '.env'
})

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;
