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

app.get('/opponent', async (req, res) => {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const chatInstancesCollection = client.db("TelegramGm").collection("chatInstances");
    const chatInstancesICollection = client.db("TelegramGm").collection("chatInstancesI");
    const { chatId, userId } = req.query;
    const existingChatInstancesDocument = await chatInstancesCollection.findOne({ _id: chatId, userId: {$ne: userId } });
    if (existingChatInstancesDocument) {
      res.status(200).json({ userName: existingChatInstancesDocument.userName });
    } else {
      const existingChatInstancesIDocument = await chatInstancesICollection.findOne({ _id: chatId, userId:  {$ne: userId } });
      res.status(200).json({ userName: existingChatInstancesIDocument.userName });
    }
  } catch (err) {
    console.error('Error processing request:', err);
    res.status(500).json({ message: 'Error processing request' });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
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
    const { chatId, userId, userName, inputValue } = req.query;

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
      const existingChatInstancesIDocument = await chatInstancesICollection.findOne({ _id: chatId, userId: userId  });
      if (existingChatInstancesIDocument && existingChatInstancesIDocument.inputValue === '') {
        // Update the existing document in the chatInstancesI collection
        const updatedChatInstancesDocument = await chatInstancesICollection.findOneAndUpdate(
          { _id: chatId, userId: userId  },
          { $set: { 'inputValue': inputValue } },
          { returnDocument: 'after' }
        );
        res.status(200).json({ message: 'New document added to the chatInstancesI collection' });
      } else {
        // Insert a new document in the chatInstancesI collection
        const newDocument = {
          _id: chatId,
          userId,
          userName,
          Score: 0,
          Trial: 0,
          inputValue
        };
        const existingChatInstancesIDocumentChatID = await chatInstancesICollection.findOne({ _id: chatId });
        if(existingChatInstancesIDocumentChatID){
          const result = await chatInstancesCollection.insertOne(newDocument);
        }
        else {
        const result = await chatInstancesICollection.insertOne(newDocument);
        }
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
    const existingChatInstancesIDocument = await chatInstancesICollection.findOne({ _id: chatId, userId: { $ne: userId } });

    let inputValue;
    if (existingChatInstancesDocument) {
      // If the document exists in the chatInstances collection, get the inputValue
      inputValue = existingChatInstancesDocument.inputValue;
    } else {
      // Check if a document with the given chatId and userId exists in the chatInstancesI collection
      

      if (existingChatInstancesIDocument) {
        // If the document exists in the chatInstancesI collection, get the inputValue
        inputValue = existingChatInstancesIDocument.inputValue;
      } else {
        // If the document doesn't exist in either collection, return an error
        res.status(404).json({ message: 'Document not found' });
        return;
      }
    }

    let number = 0;
    let order = 0;
    for (let i = 0; i < inputValue.length; i++) {
      for (let j = 0; j < guess.length; j++) {
        if (i === j && guess[j] === inputValue[i]) {
          order++;
        }
        if (guess[j] === inputValue[i]) {
          number++;
        }
      }
    }
let trial;
let score;
const existingChatInstancesDocumentw = await chatInstancesCollection.findOne({ _id: chatId, userId: userId });
const existingChatInstancesIDocumentw = await chatInstancesICollection.findOne({ _id: chatId, userId: userId });

// Check if both order and number are 4
if (existingChatInstancesDocumentw) {
    trial = existingChatInstancesDocumentw.Trial + 1;
} else if (existingChatInstancesIDocumentw) {
    trial = existingChatInstancesIDocumentw.Trial + 1;
} 

if (order === 4 && number === 4) {
  // Delete the input value from both collections
  if (existingChatInstancesDocumentw) {
      score = existingChatInstancesDocumentw.Score + 1;
    await chatInstancesCollection.updateOne({ _id: chatId, userId: userId }, { $set: { Score: score} });
  } else if (existingChatInstancesIDocumentw) {
      score = existingChatInstancesIDocumentw.Score + 1;
    await chatInstancesICollection.updateOne({ _id: chatId, userId: userId}, { $set: { Score: score } });
  }

  await chatInstancesCollection.updateOne({ _id: chatId }, { $set: { Trial: 0 , inputValue: '' } });
  await chatInstancesICollection.updateOne({ _id: chatId }, { $set: { Trial: 0 , inputValue: '' } });
}

let score1 = existingChatInstancesDocumentw ? existingChatInstancesDocumentw.Score: 0;
let score2 = existingChatInstancesIDocumentw ? existingChatInstancesIDocumentw.Score: 0;
let trial2 = existingChatInstancesDocumentw?existingChatInstancesDocumentw.Trial: existingChatInstancesIDocumentw ? existingChatInstancesIDocumentw.Trial:0;
res.status(200).json({ number, order, trial2, score1, score2 });
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
