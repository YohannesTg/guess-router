const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = 3000;

const uri = "mongodb+srv://YohanzTg:Kidistmariam@cluster0.esrh3ji.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', async (req, res) => {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Get a reference to the collection you want to use
    const collection = client.db("TelegramGm").collection("chatInstances");

    // Extract the chatId from the query parameters
    const chatId = req.query.chatId;

    // Create a new document to add to the collection using the query parameters, excluding the chatId
    const newDocument = {
      ...req.query
    };
    delete newDocument.chatId;

    // Insert the new document into the collection
    const result = await collection.insertOne({ _id: chatId, ...newDocument });
    console.log(`New document added with ID: ${result.insertedId}`);

    res.status(200).json({ message: 'Request parameters saved to MongoDB' });
  } catch (err) {
    console.error('Error processing request:', err);
    res.status(500).json({ message: 'Error processing request' });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
