const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT;
const client = new MongoClient(process.env.MONGODB_URI);

const run = async () => {
   // ❌ export CommonJS এ কাজ করে না
   try {
      await client.connect();
      console.log('You successfully connected to MongoDB!');
      return client;
   } catch (err) {
      console.dir(err);
   }
};

run();

app.get('/', (req, res) => {
   res.send('server is running successfully');
});

app.listen(port, () => {
   console.log(`server is running on port ${port}`);
});
