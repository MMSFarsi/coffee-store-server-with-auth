const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ptiwh.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    const coffeeCollection = client.db("coffeeDB").collection("coffee");
    const userCollection = client.db("coffeeDB").collection("users");

    // Coffee-related APIs
    app.get('/coffee', async (req, res) => {
      try {
        const result = await coffeeCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.error('Error fetching coffee:', error);
        res.status(500).send({ message: 'Failed to fetch coffee' });
      }
    });

    app.get('/coffee/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const result = await coffeeCollection.findOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (error) {
        console.error('Error fetching coffee by ID:', error);
        res.status(500).send({ message: 'Failed to fetch coffee by ID' });
      }
    });

    app.post('/coffee', async (req, res) => {
      try {
        const newCoffee = req.body;
        console.log('Adding new coffee:', newCoffee);
        const result = await coffeeCollection.insertOne(newCoffee);
        res.send(result);
      } catch (error) {
        console.error('Error adding coffee:', error);
        res.status(500).send({ message: 'Failed to add coffee' });
      }
    });

    app.put('/coffee/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const updatedCoffee = req.body;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const coffee = {
          $set: {
            name: updatedCoffee.name,
            quantity: updatedCoffee.quantity,
            supplier: updatedCoffee.supplier,
            taste: updatedCoffee.taste,
            category: updatedCoffee.category,
            details: updatedCoffee.details,
            photo: updatedCoffee.photo,
          },
        };
        const result = await coffeeCollection.updateOne(filter, coffee, options);
        res.send(result);
      } catch (error) {
        console.error('Error updating coffee:', error);
        res.status(500).send({ message: 'Failed to update coffee' });
      }
    });

    app.delete('/coffee/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const result = await coffeeCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (error) {
        console.error('Error deleting coffee:', error);
        res.status(500).send({ message: 'Failed to delete coffee' });
      }
    });

    // User-related APIs
    app.get('/users',async(req,res)=>{
      const cursor=userCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.post('/users', async (req, res) => {
      try {
        const newUser = req.body;
        console.log('Received user data:', newUser);
        const result = await userCollection.insertOne(newUser);
        res.send(result);
      } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).send({ message: 'Failed to save user' });
      }
    });

    app.patch('/users/:email',async(req,res)=>{
      const email=req.params.email;
      const filter={email}
      const updatedDoc={
        $set:{
          lastSignInTime: req.body?.lastSignInTime
        }
      }
      const result=await userCollection.updateOne(filter,updatedDoc);
      res.send(result)
    })

    app.delete('/users/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id: new ObjectId(id)}
      const result=await userCollection.deleteOne(query)
      res.send(result)

    })


    // Confirm successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB!");
  } finally {
    // Uncomment this if you want to close the connection after each request
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Coffee making server is running');
});

app.listen(port, () => {
  console.log(`Coffee server is running on port: ${port}`);
});
