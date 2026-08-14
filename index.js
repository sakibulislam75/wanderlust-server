const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT;

app.get('/', (req, res) => {
   res.send('server is running successfully');
});

app.listen(port, () => {
   console.log(`server is running on port ${port}`);
});
