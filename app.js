const express = require("express"); 
const app = express(); 
const path = require("path"); 
const fetch = require("node-fetch"); 
require("dotenv").config(); 

const PORT = process.env.PORT || 8080; 

app.use(express.static("dist")); 

app.get("/", (request, res) => {
  res.sendFile(path.join(__dirname, "./dist/index.html"));
});


app.get("/syllables/:searchWord", (req, res) => {
  fetch(`https://wordsapiv1.p.rapidapi.com/words/${req.params.searchWord}/syllables`, {
    method: 'GET',
    headers: { 
      "x-rapidapi-key": process.env.WORDS_API_KEY,
      "x-rapidapi-host": "wordsapiv1.p.rapidapi.com",
      "useQueryString": true
     }
  }).then(data => data.json())
    .then(formattedData => res.send(formattedData))
}); 



app.listen(PORT, () => {
  console.log(__dirname);
  console.log(`listening on ${PORT}`);
}); 