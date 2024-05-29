import app from './app.js';
import { connectDB } from './config/db.js';

const port = process.env.PORT || 80;

const start = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};

start();
