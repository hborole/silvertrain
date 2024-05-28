import { configDotenv } from 'dotenv';
configDotenv();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import { connectDB } from './config/db.js';
import City from './models/city.js';

const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 80;

mongoose.connect(process.env.MONGO_URI);

app.get('/suggestions', async (req, res) => {
  const { q, lat, long } = req.query;
  if (!q) {
    return res.status(400).json({ message: 'Query parameter q is required' });
  }

  try {
    const searchResults = await City.aggregate([
      {
        $search: {
          index: 'city',
          autocomplete: {
            path: 'name',
            query: q,
          },
        },
      },
      {
        $addFields: {
          textScore: { $meta: 'searchScore' },
        },
      },
    ]);

    if (!lat || !long) {
      return res.status(200).json({ suggestions: searchResults });
    }

    const ids = searchResults.map((doc) => doc._id);

    const suggestions = await City.find({
      _id: { $in: ids },
      coordinates: {
        $near: {
          $geometry: { type: 'Point', coordinates: [long, lat] },
        },
      },
    });

    res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Error during aggregation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the City Suggestion API');
});

const start = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};

start();
