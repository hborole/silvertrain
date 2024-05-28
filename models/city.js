import mongoose from 'mongoose';

const citySchema = new mongoose.Schema({
  name: String,
  ascii: String,
  lat: Number,
  long: Number,
  feat_class: String,
  feat_code: String,
  country: String,
  population: Number,
  coordinates: [Number],
  tz: String,
});

const City = mongoose.model('City', citySchema);

export default City;
