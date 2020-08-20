module.exports = async function (context, req) {
  context.log("JavaScript HTTP trigger function processed a request.")
  const MongoClient = require("mongodb").MongoClient
  const assert = require("assert")
  const dbName = "ReactCourse"
  var myArray = new Array()

  var url = process.env.CONNECTIONSTRING //"mongodb+srv://mainUser:Mongo@2020@cluster0-z1att.mongodb.net/ReactCourse?retryWrites=true&w=majority"
  MongoClient.connect(url, function (err, client) {
    assert.equal(null, err)
    const db = client.db(dbName)
    console.log("Connected successfully to server")
    const collection = db.collection("users")
    collection.find({}).toArray(function (err, docs) {
      assert.equal(err, null)
      console.log("Found the following records")
      console.log(docs)
      myArray = docs
      context.res = {
        // status: 200, /* Defaults to 200 */
        body: myArray,
      }

      //  callback(docs)
    })
    client.close()
  })

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: "blah",
  }
  console.log("Body set")
}
