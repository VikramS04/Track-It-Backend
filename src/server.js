import { connectDb } from './db/dbConnection.js';
import app from './app.js';

const PORT = process.env.PORT || 5001;

try {
  await connectDb();

  app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
  });
} catch (error) {
  console.error("Failed to connect to MongoDB", error);
  process.exit(1);
}
