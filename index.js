const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ObjectId } = require('mongodb');

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

      const db = client.db('wanderlust');
      const destinationsCollection = db.collection('destinations');

      //get-destination
      app.get('/destination', async (req, res) => {
         const result = await destinationsCollection.find().toArray();
         console.log('Successfully got all destinations', result);
         res.send(result);
      });
      //single-destination
      app.get('/destination/:id', async (req, res) => {
         const { id } = req.params;
         const query = { _id: new ObjectId(id) };
         const result = await destinationsCollection.findOne(query);
         res.send(result);
      });

      //add-destination
      app.post('/destination', async (req, res) => {
         const destination = req.body;
         const result = await destinationsCollection.insertOne(destination);
         console.log('Successfully added a destination', result);
         res.send(result);
      });

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
