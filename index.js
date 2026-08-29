const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(
   cors({
      origin: process.env.CLIENT_URL, // যেমন https://wanderlust-client-tau-two.vercel.app
      credentials: true,
   }),
);

const port = process.env.PORT;
const client = new MongoClient(process.env.MONGODB_URI);

//middleware
const JWKS = createRemoteJWKSet(new URL(`${process.env.CLIENT_URL}/api/auth/jwks`));

//middleware-function
const verifyToken = async (req, res, next) => {
   const authHeader = req?.headers.authorization;
   if (!authHeader) {
      return res.status(401).send({ message: 'unauthorized access' });
   }

   const token = authHeader.split(' ')[1];
   if (!token) {
      return res.status(401).send({ message: 'unauthorized access' });
   }

   try {
      const { payload } = await jwtVerify(token, JWKS);
      console.log('JWT payload:', payload);
      next();
   } catch (error) {
      return res.status(403).send({ message: 'forbidden' });
   }
};

const run = async () => {
   // ❌ export CommonJS এ কাজ করে না
   try {
      // await client.connect();

      const db = client.db('wanderlust');
      const destinationsCollection = db.collection('destinations');
      const bookingCollection = db.collection('bookings');

      //get-destination
      app.get('/destination', async (req, res) => {
         const result = await destinationsCollection.find().toArray();
         console.log('Successfully got all destinations', result);
         res.send(result);
      });
      //single-destination-middleware
      app.get('/destination/:id', verifyToken, async (req, res) => {
         const { id } = req.params;
         const query = { _id: new ObjectId(id) };
         const result = await destinationsCollection.findOne(query);
         res.send(result);
      });

      //add-destination
      app.post('/destination', verifyToken, async (req, res) => {
         const destination = req.body;
         const result = await destinationsCollection.insertOne(destination);
         console.log('Successfully added a destination', result);
         res.send(result);
      });

      //update-destination packages
      app.patch('/destination/:id', verifyToken, async (req, res) => {
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
      app.delete('/destination/:id', verifyToken, async (req, res) => {
         const { id } = req.params;
         const result = await destinationsCollection.deleteOne({ _id: new ObjectId(id) });
         console.log('Successfully deleted a package', result);
         res.send(result);
      });

      //add-booking
      app.post('/booking', verifyToken, async (req, res) => {
         const booking = req.body;
         const result = await bookingCollection.insertOne(booking);
         console.log('Successfully added a booking', result);
         res.send(result);
      });

      //get-bookings
      app.get('/booking', verifyToken, async (req, res) => {
         const result = await bookingCollection.find().toArray();
         console.log('Successfully got all bookings', result);
         res.send(result);
      });
      //delete-booking
      app.delete('/booking/:id', verifyToken, async (req, res) => {
         const { id } = req.params;
         const result = await bookingCollection.deleteOne({ _id: id });
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
   console.log(`server is running `);
});
