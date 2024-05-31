const { MongoClient } = require('mongodb')
let dbConnection
module.exports = {
  connectToDb: (cb)=> {
    MongoClient.connect('mongodb+srv://YohanzTg:Kidistmariam@cluster0.esrh3ji.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then((client)=>{
      dbConnection = client.db()
      return cb()
    })
    .catch(err => {
      console.log(err)
      return cb(err)
    })
  },
  getDb: ()=>Connection 
}
