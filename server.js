const express = require("express")
const path = require("path")
const PORT = process.env.PORT || 3001
const app = new express()
app.use(express.static(path.join(__dirname, "dist")))
app.get("*", (req, res) => res.sendFile(__dirname + "/dist/index.html"))
app.listen(PORT, function () {
  console.log("App listening on port " + PORT)
  console.log("...")
})
