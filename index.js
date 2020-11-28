const bios = require("./bios.js");



const express = require('express');
const app = express();

app.listen(3000, () => console.log("Listening at 3000"));
app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));


const fs = require('fs');
const houseImagesURL = "C:/Users/jesse/Desktop/Stuff/CodeThings/DisapointmentHouse/Website/BioItems/HouseImages";

app.get("/bios", (request, response) => {
    //console.log("GOT THE JSON");
    response.json(bios.getBioData());
});

var files = fs.readdirSync(houseImagesURL+'/');

for(var i = 0; i < files.length; i++){
    const fileLocation = houseImagesURL+'/'+ files[i];
    app.get("/FamilyImages/" + files[i].split(".")[0], (request, response) => {
        response.sendFile(fileLocation);
    });
}