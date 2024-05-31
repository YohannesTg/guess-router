const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
    const existingChatInstancesDocument = await chatInstancesCollection.findOne({ _id: new ObjectId(chatId) });

    if (existingChatInstancesDocument) {
      // If both chatId and userId match, leave the document as it is
      console.log(`Document with _id ${chatId} and userId ${userId} already exists in the chatInstances collection.`);
      res.status(200).json({ message: 'Document already exists in the chatInstances collection' });
    } else {
      // Check if a document with the same chatId but different userId exists in the chatInstances collection
      const existingChatIdChatInstancesDocument = await chatInstancesCollection.findOne({ _id: new ObjectId(chatId) });
      if (existingChatIdChatInstancesDocument) {
        // If the chatId matches but the userId is different, insert the document with the new userId in the chatInstancesI collection
        const newDocument = {
          ...req.query
        };
        delete newDocument.chatId;
        const result = await chatInstancesICollection.insertOne({ _id: new ObjectId(chatId), userId, ...newDocument });
        console.log(`New document added to the chatInstancesI collection with ID: ${result.insertedId}`);
        res.status(200).json({ message: 'New document added to the chatInstancesI collection' });
      } else {
        // If both chatId and userId don't match, insert a new document in the chatInstances collection
        const newDocument = {
          ...req.query
        };
        delete newDocument.chatId;
        const result = await chatInstancesCollection.insertOne({ _id: new ObjectId(chatId), userId, ...newDocument });
        console.log(`New document added to the chatInstances collection with ID: ${result.insertedId}`);
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

app.delete('/', async (req, res) => {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Get a reference to the collections
    const chatInstancesCollection = client.db("TelegramGm").collection("chatInstances");
    const chatInstancesICollection = client.db("TelegramGm").collection("chatInstancesI");

    // Extract the chatId from the query parameters
    const chatId = req.query.chatId;

    // Delete the document with the specified chatId from the chatInstances collection
    const chatInstancesDeleteResult = await chatInstancesCollection.deleteOne({ _id: new ObjectId(chatId) });
    console.log(`Deleted ${chatInstancesDeleteResult.deletedCount} document(s) from the chatInstances collection.`);

    // Delete the document with the specified chatId from the chatInstancesI collection
    const chatInstancesIDeleteResult = await chatInstancesICollection.deleteOne({ _id: new ObjectId(chatId) });
    console.log(`Deleted ${chatInstancesIDeleteResult.deletedCount} document(s) from the chatInstancesI collection.`);

    res.status(200).json({ message: 'Document(s) deleted successfully' });
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
