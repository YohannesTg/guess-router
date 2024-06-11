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

// Add middleware to parse the request body
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://g-game.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  next();
});

app.get('/submit-data', async (req, res) => {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Get a reference to the collections
    const chatInstancesCollection = client.db("TelegramGm").collection("chatInstances");
    const chatInstancesICollection = client.db("TelegramGm").collection("chatInstancesI");

    // Extract the chatId, userId, and inputValue from the request query parameters
    const { chatId, userId, inputValue } = req.query;

    // Check if a document with the same chatId and userId already exists in the chatInstances collection
    const existingChatInstancesDocument = await chatInstancesCollection.findOne({ _id: chatId, userId: userId });
    if (existingChatInstancesDocument && existingChatInstancesDocument.inputValue === '') {
      // If the document exists, update the existing document
      const updatedChatInstancesDocument = await chatInstancesCollection.findOneAndUpdate(
        { _id: chatId, userId: userId },
        { $set: { 'inputValue': inputValue } },
        { returnDocument: 'after' }
      );
      console.log(`Document with chatId ${chatId} and userId ${userId} already exists in the chatInstances collection.`);
      res.status(200).json({ message: 'Document updated in the chatInstances collection' });
    } else {
      // Check if a document with the same chatId but different userId exists in the chatInstancesI collection
      const existingChatInstancesIDocument = await chatInstancesICollection.findOne({ _id: chatId, userId: { $ne: userId } });
      if (existingChatInstancesIDocument && existingChatInstancesIDocument.inputValue === '') {
        // Update the existing document in the chatInstancesI collection
        const updatedChatInstancesDocument = await chatInstancesICollection.findOneAndUpdate(
          { _id: chatId, userId: { $ne: userId } },
          { $set: { 'inputValue': inputValue } },
          { returnDocument: 'after' }
        );
        res.status(200).json({ message: 'New document added to the chatInstancesI collection' });
      } else {
        // Insert a new document in the chatInstancesI collection
        const newDocument = {
          _id: chatId,
          userId,
          inputValue
        };
        const result = await chatInstancesICollection.insertOne(newDocument);
        res.status(200).json({ message: 'New document added to the chatInstancesI collection' });
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

app.get('/check', async (req, res) => {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    // Get a reference to the collections
    const chatInstancesCollection = client.db("TelegramGm").collection("chatInstances");
    const chatInstancesICollection = client.db("TelegramGm").collection("chatInstancesI");

    // Extract the chatId, userId, and guess from the request query parameters
    const { chatId, userId, guess } = req.query;

    // Check if a document with the given chatId and userId exists in the chatInstances collection
    const existingChatInstancesDocument = await chatInstancesCollection.findOne({ _id: chatId, userId: { $ne: userId } });

    let inputValue;
    if (existingChatInstancesDocument) {
      // If the document exists in the chatInstances collection, get the inputValue
      inputValue = existingChatInstancesDocument.inputValue;
    } else {
      // Check if a document with the given chatId and userId exists in the chatInstancesI collection
      const existingChatInstancesIDocument = await chatInstancesICollection.findOne({ _id: chatId, userId: { $ne: userId } });

      if (existingChatInstancesIDocument) {
        // If the document exists in the chatInstancesI collection, get the inputValue
        inputValue = existingChatInstancesIDocument.inputValue;
      } else {
        // If the document doesn't exist in either collection, return an error
        res.status(404).json({ message: 'Document not found' });
        return;
      }
    }

    let Number = 0;
    let Order = 0;
    for (let i = 0; i < inputValue.length; i++) {
      for (let j = 0; j < guess.length; j++) {
        if (i === j && guess[j] === inputValue[i]) {
          Order++;
        }
        if (guess[j] === inputValue[i]) {
          Number++;
        }
      }
    }

    // Check if both order and number are 4
    if (Order === 4 && Number === 4) {
      // Delete the input value from both collections
      await chatInstancesCollection.updateOne({ _id: chatId }, { $set: { inputValue: '' } });
      await chatInstancesICollection.updateOne({ _id: chatId }, { $set: { inputValue: '' } });
    }

    res.status(200).json({ Number, Order });
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
