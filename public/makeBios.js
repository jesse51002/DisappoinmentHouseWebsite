fetch("/bios")
    .then(res => {
        if (res.ok) {
            console.log("Got Bios Data");
        }
        else {
            console.log("Couldn't get Bios Data");
        }
        return res.json();
    })
    .then(data => {
        console.log("Bios data: \n" + data);
        for (var i = 0; i < data.length; i++) {
            const bio = data[i];
            const parent = document.getElementById("bios");

            const div = document.createElement("div");
            div.id = bio.Name;
            parent.appendChild(div);
            
            //Their background Images
            fetch("/FamilyImages/" + bio.Name+"Background")
                .then(gotData => {
                    if (!gotData.ok) {
                        console.log("Couldn't get " + bio.Name + "Background Image Data");
                    }
                    
                    return gotData.blob();
                }).then(blob => {
                    //div.style.backgroundImage = "url('" + URL.createObjectURL(blob)+ "')";
                }
            );
            
            const dataDiv = document.createElement("div");
            div.appendChild(dataDiv);

            //dataDiv.style.backgroundColor = bio.BackgroundColor + "c0";
            dataDiv.style.backgroundColor = "#b27068" + "c0";
            dataDiv.style.color = bio.BackgroundColor;
            
            
            
            const makeTxt = () =>{
                const txtDiv = document.createElement("div");
                dataDiv.appendChild(txtDiv);
                
                txtDiv.style.display = "flex";
                txtDiv.style.flexDirection = "column";

                const bName = document.createElement("b");
                //bName.style.textAlign = bio.ImagePos.toLowerCase();
                txtDiv.appendChild(bName);

                const bTxt = document.createTextNode(bio.Name);
                bName.appendChild(bTxt);

                const ita = document.createElement("i");
                //ita.style.textAlign = bio.ImagePos.toLowerCase();
                txtDiv.appendChild(ita);

                const iTxt = document.createTextNode("\"" + bio.BioText+"\"");
                ita.appendChild(iTxt);
            }

            if(bio.ImagePos.toLowerCase() === "right"){
                makeTxt();
            }

            const img = document.createElement("img");
            dataDiv.appendChild(img);

            //TheirImages
            fetch("/FamilyImages/" + bio.Name)
                .then(gotData => {
                    if (!gotData.ok) {
                        console.log("Couldn't get " + bio.Name + " Image Data");
                    }
                    
                    return gotData.blob();
                }).then(blob => {
                    img.src = URL.createObjectURL(blob);
                }
            );

            if(bio.ImagePos.toLowerCase() === "left"){
                makeTxt();
            }
        }

    }
);