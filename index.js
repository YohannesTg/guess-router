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

    // Get a reference to the collection you want to use
    const collection = client.db("TelegramGm").collection("chatInstances");

    // Create a new document to add to the collection
    const newDocument = {
      name: "John Doe",
      age: 35,
      email: "john.doe@example.com"
    };

    // Insert the new document into the collection
    const result = await collection.insertOne(newDocument);
    console.log(`New document added with ID: ${result.insertedId}`);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(console.dir);
