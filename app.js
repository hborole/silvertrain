import express from 'express';
import cors from 'cors';
import City from './models/city.js';

const app = express();
app.use(express.json());
app.use(cors());

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
        $project: {
          _id: 1,
          name: 1,
          state: '$admin1',
          country: 1,
          lat: 1,
          long: 1,
          fullName: {
            $cond: {
              if: { $ifNull: ['$admin1', false] },
              then: { $concat: ['$name', ', ', '$admin1', ', ', '$country'] },
              else: { $concat: ['$name', ', ', '$country'] },
            },
          },
        },
      },
      {
        $sort: { name: 1, state: 1, country: 1 },
      },
    ]);

    if (!lat || !long) {
      return res.status(200).json({ suggestions: searchResults });
    }

    const ids = searchResults.map((doc) => doc._id);

    const suggestions = await City.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(long), parseFloat(lat)],
          },
          distanceField: 'distance',
          spherical: true,
          query: { _id: { $in: ids } },
        },
      },
    ]);

    const transformedSuggestions = suggestions.map((suggestion) => {
      const { name, admin1, country, coordinates, lat, long, distance } =
        suggestion;
      const fullName = admin1
        ? `${name}, ${admin1}, ${country}`
        : `${name}, ${country}`;
      return {
        name,
        admin1,
        country,
        coordinates,
        lat,
        long,
        fullName,
        distance: distance.toFixed(2), // Formatting the distance to two decimal places
      };
    });

    // const suggestions = await City.find({
    //   _id: { $in: ids },
    //   coordinates: {
    //     $near: {
    //       $geometry: { type: 'Point', coordinates: [long, lat] },
    //     },
    //   },
    // });

    // const transformedSuggestions = suggestions.map((suggestion) => {
    //   const { name, admin1, country, coordinates, lat, long } = suggestion;
    //   const fullName = admin1
    //     ? `${name}, ${admin1}, ${country}`
    //     : `${name}, ${country}`;
    //   return {
    //     name,
    //     state: admin1,
    //     country,
    //     coordinates,
    //     lat,
    //     long,
    //     fullName,
    //   };
    // });

    res.status(200).json({ suggestions: transformedSuggestions });
  } catch (error) {
    console.error('Error during aggregation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the City Suggestion API');
});

export default app;
