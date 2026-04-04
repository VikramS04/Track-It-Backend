import express from 'express';
import { connectDb } from './src/db/dbConnection.js';
import { configDotenv } from 'dotenv';
import cors from 'cors';
import errorHandler from './src/middlewares/errorHandler.js';


configDotenv();
connectDb();

const app = express();

const PORT = process.env.PORT || 5001;


app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use(express.json()); 

app.get('/', (req,res)=>{
  res.send("API Running...")
});

//Routes

// app.use('/api/expense', );
// app.use('/api/users', );
app.use(errorHandler);


app.listen(PORT,()=>{
console.log(`Server is running on ${PORT}`);
})