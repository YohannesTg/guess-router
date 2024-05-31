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

    // Get a reference to the collections
    const chatInstancesCollection = client.db("TelegramGm").collection("chatInstances");
    const chatInstancesICollection = client.db("TelegramGm").collection("chatInstancesI");

    // Extract the chatId and userId from the query parameters
    const chatId = req.query.chatId;
    const userId = req.query.userId;

    // Check if a document with the same chatId and userId already exists in the chatInstances collection
    const existingChatInstancesDocument = await chatInstancesCollection.findOne({ _id: chatId, userId: userId });

    if (existingChatInstancesDocument) {
      // If both chatId and userId match, leave the document as it is
      console.log(`Document with chatId ${chatId} and userId ${userId} already exists in the chatInstances collection.`);
      res.status(200).json({ message: 'Document already exists in the chatInstances collection' });
    } else {
      // Check if a document with the same chatId but different userId exists in the chatInstances collection
      const existingChatIdChatInstancesDocument = await chatInstancesCollection.findOne({ _id: chatId });
      if (existingChatIdChatInstancesDocument) {
        const newDocument = {
        _id: chatId,
        ...req.query
        };
        delete newDocument.chatId;
        // If the chatId matches but the userId is different, insert the document with the new userId in the chatInstancesI collection
        const result = await chatInstancesICollection.insertOne(newDocument);
        res.status(200).json({ message: 'New document added to the chatInstancesI collection' });
      } else {
        // If both chatId and userId don't match, insert a new document in the chatInstances collection
        const result = await chatInstancesCollection.insertOne(newDocument);
        res.status(200).json({ message: 'New document added to the chatInstances collection' });
      }
    }
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
