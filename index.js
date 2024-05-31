const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://YohanzTg:Kidistmariam@cluster0.esrh3ji.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'MongoDB connection successful' }),
    };
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error connecting to MongoDB' }),
    };
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

exports.handler = async (event, context) => {
  return await run();
};
