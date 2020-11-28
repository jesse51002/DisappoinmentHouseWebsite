const fs = require('fs');

const houseFolderURL = "C:/Users/jesse/Desktop/Stuff/CodeThings/DisapointmentHouse/Website/BioItems/HouseData";


//usage:

const getBioData = () => {
    var files = fs.readdirSync(houseFolderURL+'/');
    const dataArr = [];

    for(var i = 0; i < files.length; i++){
        const curPath = houseFolderURL+'/'+ files[i];

        //console.log(curPath);

        const unParsedData = fs.readFileSync(curPath, "utf8");
        dataArr[i] = JSON.parse(unParsedData);
    }

    return dataArr;
};

module.exports = {getBioData};