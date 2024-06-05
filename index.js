const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = 3000;

const uri = "mongodb+srv://YohanzTg:Kidistmariam@cluster0.esrh3ji.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://g-game.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  next();
});

app.delete('/delete-input-value', async (req, res) => {
  try {
    await client.connect();
    const chatInstancesCollection = client.db("TelegramGm").collection("chatInstances");
    const chatInstancesICollection = client.db("TelegramGm").collection("chatInstancesI");

    const { chatId, userId, guess } = req.body;

    let Number = 0;
    let Order = 0;
    let inputValue;

    // Check if a document with the given chatId and userId exists in the chatInstances collection
    const existingChatInstancesDocument = await chatInstancesCollection.findOne({ _id: chatId, userId: { $ne: userId } });
    if (existingChatInstancesDocument) {
      inputValue = existingChatInstancesDocument.inputValue;
    } else {
      // Check if a document with the given chatId and userId exists in the chatInstancesI collection
      const existingChatInstancesIDocument = await chatInstancesICollection.findOne({ _id: chatId, userId: { $ne: userId } });
      if (existingChatInstancesIDocument) {
        inputValue = existingChatInstancesIDocument.inputValue;
      } else {
        res.status(404).json({ message: 'Document not found' });
        return;
      }
    }

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

    if (Number === 4 && Order === 4) {
      // Delete the input value from all collections with the given chatId
      await chatInstancesCollection.updateMany({ _id: chatId }, { $set: { inputValue: '' } });
      await chatInstancesICollection.updateMany({ _id: chatId }, { $set: { inputValue: '' } });
      res.status(200).json({ message: 'Input value deleted from all collections' });
    } else {
      res.status(400).json({ message: 'Number and Order are not 4' });
    }
  } catch (err) {
    console.error('Error processing request:', err);
    res.status(500).json({ message: 'Error processing request' });
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
