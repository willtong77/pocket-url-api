const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const app = express();

const port = process.env.PORT || 4567;
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
require('dotenv').config();

// Setting up Mongoose
const Schema = mongoose.Schema;

const UrlSchema = new Schema({
  longUrl: { type: String, required: true},
  shortId: { type: String, required: true},
})

const Url = mongoose.model('Url', UrlSchema);

// Setting up Database
const password = process.env.DB_ADMIN_PASSWORD;
const dbname = process.env.DB_USERNAME;
const URI = `mongodb+srv://will:${password}@pocketurl-api.qyulk.mongodb.net/${dbname}?retryWrites=true&w=majority`

const option = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}

mongoose.connect(URI, option);

mongoose.connection.on('open', () => {
  console.log('Connected to MongoDB!');
  
  app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
  });
});

mongoose.connection.on('error', (err) => {
  console.log(err);
});

// Routes

// GET

app.get('/urls', async (req, res) => {
  const shortId = req.query.shortId;
  if (!shortId) {
    res
      .status(400)
      .json({
        message:'You must query the database based on a shortUrl.'
      })
  } else {
    try {
      const data = await Url.findOne({ shortId: shortId });
      res.json({ data: data });
    } catch (err) {
      res.json({ data: null });
      console.log(err);
    }
  }
});

// GET REDIRECT
app.get('/:shortId', async (req, res) => {
  const shortId = req.params.shortId;
  const url = await Url.findOne({ shortId: shortId });
  try {
    res.redirect(url.longUrl);
  } catch (err) { console.log(err); }
})

// POST
app.post('/urls/:short/', async function(req, res) {
  const { long } = req.body;
  if (!req.params.short || !long) {
    res.status(800).json({ message: "need long and short man!!!" })
    return;
  }
  
  const data = await Url.create({ longUrl: long, shortId: req.params.short });
  res.status(201).json({ data });
});