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
    
    const chatInstancesCollection = client.db("TelegramGm").collection("chatInstances");
    const chatInstancesICollection = client.db("TelegramGm").collection("chatInstancesI");
    const { chatId, userId } = req.query;

    // Get current user's data (score1 and trial1)
    const currentUserData = await chatInstancesCollection.findOne({ 
      _id: chatId, 
      userId: userId 
    }) || await chatInstancesICollection.findOne({ 
      _id: chatId, 
      userId: userId 
    });

    // Get opponent's data (score2 and trial2)
    const opponentData = await chatInstancesCollection.findOne({ 
      _id: chatId, 
      userId: { $ne: userId } 
    }) || await chatInstancesICollection.findOne({ 
      _id: chatId, 
      userId: { $ne: userId } 
    });

    if (!opponentData) {
      return res.status(404).json({ message: 'Game data not found' });
    }

    res.status(200).json({
      userName: opponentData.userName,
      score1: currentUserData?.Score || 0,
      score2: opponentData.Score,
      trial1: currentUserData?.Trial || 0,
      trial2: opponentData.Trial
    });

  } catch (err) {
    console.error('Error processing request:', err);
    res.status(500).json({ message: 'Error processing request' });
  } finally {
    await client.close();
  }
});

// Route to handle data submission
app.get('/submit-data', async (req, res) => {
  try {
    const { chatId, userId, userName, inputValue } = req.query;
    await client.connect();
    const chatInstances = client.db("TelegramGm").collection("chatInstances");
    const chatInstancesI = client.db("TelegramGm").collection("chatInstancesI");

    // Check if the document exists in either of the collections
    let existingDoc = await chatInstances.findOne({ _id: chatId, userId });
    if (!existingDoc) {
      existingDoc = await chatInstancesI.findOne({ _id: chatId, userId });
    }

    if (existingDoc) {
      if (existingDoc.inputValue !== '') {
        // Case 1: Found document with non-empty input value
        res.status(200).json({ message: 'Game starter with previous input value', inputValue: existingDoc.inputValue });
      } else {
        // Case 2: Found document with empty input value, update it using findOneAndUpdate
        if (existingDoc._id === chatId && existingDoc.userId === userId) {
          // Update the correct collection based on where the document was found
          if (existingDoc.inputValue === '') {
              const collectionToUpdate = await chatInstances.findOne({ _id: chatId, userId }) ? chatInstances : chatInstancesI;
              const updatedDoc = await collectionToUpdate.findOneAndUpdate(
                  { _id: chatId, userId },
                  { $set: { 'inputValue': inputValue } },
                  { returnDocument: 'after' }
              );

            res.status(200).json({ message: 'Input value set', inputValue: updatedDoc.value.inputValue });
          }
        }
      }
    } else {
      // Case 3: Document not found, create new one in the correct collection
      const newDocument = { _id: chatId, userId, userName, Score: 0, Trial: 1, inputValue };
      
      // Check if document exists in chatInstances
      const existingInChatInstances = await chatInstances.findOne({ _id: chatId });
      if (existingInChatInstances) {
        // If the document already exists in chatInstances, insert into chatInstancesI
        await chatInstancesI.insertOne(newDocument);
        res.status(200).json({ message: 'New document created in chatInstancesI' });
      } else {
        // If the document does not exist in chatInstances, insert into chatInstances
        await chatInstances.insertOne(newDocument);
        res.status(200).json({ message: 'New document created in chatInstances' });
      }
    }
  } catch (err) {
    console.error('Error processing request:', err);
    res.status(500).json({ message: 'Error processing request' });
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
    await chatInstancesCollection.updateOne({ _id: chatId, userId: userId }, { $set: { Trial: trial} });
} else if (existingChatInstancesIDocumentw) {
    trial = existingChatInstancesIDocumentw.Trial + 1;
  await chatInstancesICollection.updateOne({ _id: chatId, userId: userId}, { $set: { Trial: trial } });
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

let score1 = existingChatInstancesDocumentw ? existingChatInstancesDocumentw.Score: existingChatInstancesIDocumentw.Score;

    const existingChatInstancesDocumentwOpp = await chatInstancesCollection.findOne({ 
  _id: chatId, 
  userId: { $ne: userId } 
});

const existingChatInstancesIDocumentwOpp = await chatInstancesICollection.findOne({ 
  _id: chatId, 
  userId: { $ne: userId } 
});
let score2 = existingChatInstancesDocumentwOpp ? existingChatInstancesDocumentwOpp.Score: existingChatInstancesIDocumentwOpp.Score;
let trial2 = existingChatInstancesDocument ?existingChatInstancesDocument.Trial: existingChatInstancesIDocument ? existingChatInstancesIDocument.Trial:0;
res.status(200).json({ number, order, trial2, score1, score2 });
  } catch (err) {
    console.error('Error processing request:', err);
    res.status(500).json({ message: 'Error processing request' });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});

app.get('/exist', async (req, res) => {
  try {
    await client.connect();
    const { chatId, userId } = req.query;
    const chatInstancesCollection = client.db("TelegramGm").collection("chatInstances");
    const chatInstancesICollection = client.db("TelegramGm").collection("chatInstancesI");

    // Check both collections for non-empty input value
    const query = { 
      _id: chatId, 
      userId: userId,
      inputValue: { $exists: true, $ne: "" }
    };

    const existingDoc = await chatInstancesCollection.findOne(query) ||
                       await chatInstancesICollection.findOne(query);

    if (existingDoc && existingDoc.inputValue) {
      // Return the input value directly if found
      res.status(200).json({ inputValue: existingDoc.inputValue });
    } else {
      // Return empty response if not found
      res.status(200).json({ exists: false });
    }
  } catch (err) {
    console.error('Error checking input value:', err);
    res.status(500).json({ message: 'Error checking input value' });
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
