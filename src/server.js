import { connectDb } from './db/dbConnection.js';
import app from './app.js';


connectDb();

const PORT = process.env.PORT || 5001;


app.listen(PORT,()=>{
console.log(`Server is running on ${PORT}`);
})
