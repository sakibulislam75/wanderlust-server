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
      const bookingCollection = db.collection('bookings');

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

      //update-destination packages
      app.patch('/destination/:id', async (req, res) => {
         const { id } = req.params;
         const updateData = req.body;
         const result = await destinationsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData },
         );
         console.log('Sucessfully updated a package:', result);
         res.send(result);
      });

      //delete-destinaiton package
      app.delete('/destination/:id', async (req, res) => {
         const { id } = req.params;
         const result = await destinationsCollection.deleteOne({ _id: new ObjectId(id) });
         console.log('Successfully deleted a package', result);
         res.send(result);
      });

      //add-booking
      app.post('/booking', async (req, res) => {
         const booking = req.body;
         const result = await bookingCollection.insertOne(booking);
         console.log('Successfully added a booking', result);
         res.send(result);
      });

      //get-bookings
      app.get('/booking', async (req, res) => {
         const result = await bookingCollection.find().toArray();
         console.log('Successfully got all bookings', result);
         res.send(result);
      });
      //delete-booking
      app.delete('/booking/:id', async (req, res) => {
         const { id } = req.params;
         const result = await bookingCollection.deleteOne({ _id: new ObjectId(id) });
         console.log('Successfully deleted a booking', result);
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
