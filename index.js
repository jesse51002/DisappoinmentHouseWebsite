const express = require('express');
const app = express();

app.listen(4000, () => console.log("Listening at 4000"));
app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));


const fs = require('fs');
