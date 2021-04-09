var w = 0//1600/2;
var h = 0//900/2;

const FOG = true;
const OUTLINE = true;
const SCALE = true;

var imgArr = [];
var outlineArr = [];

const maxRevSpeed = 0.35;
const minRevSpeed = 5;
const maxLineSize = 0.2;
const minLineSize = 0.15;
const maxOutlineSize = 0.05;
const minOutlineSize = 0.02;
const maxFogSpeed = 0.5;
const minFogSpeed = 0.1;

const outLineAmount = 2;

var revolutionSpeed = 1.5;
var lineSize = 0.3;
var curPos = 0;
var fogPos = 0;
var fogSpeed = 0;

var lastTime = 0;

var song;
var art;
var fogImg;

const trasnVal = 0.7;

const maxYScale = 0.5;
const minYScale = 0.4; 

var backgroundColor;
var outlineColor;

var fft;
var soundPower;

function preload(){
  song = loadSound("NaomiBeatSell.mp3");
  art=  loadImage("MellowCover.png");
}

function setup() {
    w = displayWidth;
    h= displayHeight

  song.setVolume(1);
  
  setImageArr();
  getOutlinePixels();
  createCanvas(w, h);
  
  fft = new p5.FFT(0.75, 512);
  frameRate(60);

  backgroundColor = color(41, 0, 51);
  outlineColor = color(58,139,182);

  getFog();
  //displayImgArr();
}

function keyPressed(){
    if(keyCode === ' '.charCodeAt(0)){
        if(song.isPlaying()){
            song.pause();
        }
        else{
            song.play();
        }
    }
}

function draw() {
  translate(w/2,h/2);
  //return displayImgArr();
  //return drawSoundPower();
  getSoundPower();
  
  
  var timeChange=  millis() - lastTime;
  lastTime = millis();
  var percRev = (timeChange/1000)/revolutionSpeed;
  curPos = (curPos + percRev) %1;

  if(FOG){
    fogSpeed = minFogSpeed + (maxFogSpeed - minFogSpeed) * soundPower;
    fogPos += w * (timeChange/1000) * fogSpeed;
  }
  background(backgroundColor);

  let curScale = 0.5 * (maxYScale - minYScale) + minYScale;
  if(SCALE){
    curScale = soundPower * (maxYScale - minYScale) + minYScale;
  }
  const scaleChange  = (curScale * h) /art.height;

  const imgSizeX = art.width * scaleChange;
  const imgSizeY = art.height * scaleChange;
  

  image(art,-imgSizeX/2 ,-imgSizeY/2,
        imgSizeX,
        imgSizeY);

  if(OUTLINE){
    revolutionSpeed = Math.pow(1 - soundPower,2) * (minRevSpeed - maxRevSpeed)+ maxRevSpeed;
    lineSize = soundPower * (maxLineSize - minLineSize)+ minLineSize;
    
    fill(outlineColor);
    stroke(0,0,0,0);

    const xPixelSize=  imgSizeX / art.width;
    const yPixelSize=  imgSizeY / art.height;

    const curDiameter = (minOutlineSize + (maxOutlineSize - minOutlineSize)* Math.pow(soundPower,3)) * h; 
    for(var o = 0; o < outLineAmount; o++){
      const startPerc = (curPos + (1/outLineAmount * o)) % 1;
      const startPos = Math.floor(outlineArr.length * startPerc);
      const size = Math.floor(outlineArr.length* lineSize);

      for(var i = startPos; i > startPos - size; i-=10){
        var perc = 1 - Math.pow(((startPos - i))/ size, 2);
        var index = i;
        while(index < 0){
          index = index + outlineArr.length;
        }

        var xVal = outlineArr[index].x;
        var yVal = outlineArr[index].y;
        circle(xVal * xPixelSize - imgSizeX/2,
              yVal * yPixelSize - imgSizeY/2,
              curDiameter* perc 
              );
        
      }
    }
  }

  if(FOG){
    for(var i = 0; i < 2; i++){
      image(fogImg, (fogPos)%w - w/2 - w*i, -h/2
        ,w,h);
    }
  }
}

function drawSoundPower(){
  var soundSpec = fft.analyze();
  
  let soundImg = createImage(soundSpec.length, 100);
  soundImg.loadPixels();
  
  for(var i = 0 ; i < soundSpec.length; i++){
    for(var j = 100 ; j > 100 - soundSpec[i] / (256/100); j--){
      let index = (i + j * soundSpec.length) * 4;
      soundImg.pixels[index] = 255;
      soundImg.pixels[index + 1] = 255;
      soundImg.pixels[index + 2] = 255;
      soundImg.pixels[index + 3] = 255;
      }
  }

  background(0);
  soundImg.updatePixels();
  //image(soundImg,0,0,w,h);
  
  const ranges = [[0,75]];
  
  let soundImg2 = createImage(ranges.length, 100);
  soundImg2.loadPixels();
  
  for(var i = 0 ; i < ranges.length; i++){
    for(var j = 100 ; j > 100 - fft.getEnergy(ranges[i][0], ranges[i][1]) / (256/100); j--){
      let index = (i + j * ranges.length) * 4;
      soundImg2.pixels[index] = 255;
      soundImg2.pixels[index + 1] = 255;
      soundImg2.pixels[index + 2] = 255;
      soundImg2.pixels[index + 3] = 255;
      }
  }
  soundImg2.updatePixels();
  image(soundImg2,-w/2,-h/2,w,h);
}

function getSoundPower(){
  var soundSpec = fft.analyze();
  
  const ranges = [[0,75]];
  
  var bassPower = Math.pow(fft.getEnergy(1,50)/256, 6);
  
  var totalWeighted = 0;
  
  for(var i = 0 ; i < soundSpec.length;i++){
    const curWeight =Math.pow((soundSpec.length- i) /soundSpec.length,1/2 );
    
    totalWeighted += soundSpec[i]/ 256 * curWeight;
    
  }
  
  totalWeighted /= soundSpec.length/3;
  totalWeighted  =Math.min(1,totalWeighted);
  soundPower = totalWeighted*0.25 + bassPower*0.75;
}

function displayImgArr(){
  let blackWhiteImg = createImage(art.width, art.height);
  blackWhiteImg.loadPixels();
  for(var y = 0 ; y < imgArr.length; y++){
    for(var x = 0 ; x < imgArr[y].length; x++){
      let index = (x + y * blackWhiteImg.width) * 4;
      blackWhiteImg.pixels[index] = 255;
      blackWhiteImg.pixels[index + 1] = 255;
      blackWhiteImg.pixels[index + 2] = 255;
      blackWhiteImg.pixels[index + 3] = imgArr[y][x]*255;
      }
  }

  background(0);
  blackWhiteImg.updatePixels();
  image(blackWhiteImg,0,0,w,h);
}


function setImageArr(){
  art.loadPixels();
  for(var i =0 ; i <  art.height; i++){
    imgArr[i] = [];
    for(var j =0 ; j <  art.width; j++){
      let index = (j+ i* art.width) * 4;
      imgArr[i][j] = art.pixels[index + 3]/ 255;
    }
  }
}

function getOutlinePixels(){
  var currentPosx = Math.floor(imgArr[0].length/2);
  var currentPosy = 0;
  
  for(var i = 0; i< imgArr.length; i++){
    if(imgArr[i][currentPosx] >= trasnVal){
      currentPosy = i - 1;
      break;
    }
  }
  outlineArr = [new Vector(currentPosx,currentPosy)];
  
  var nextPos = getNextPos(outlineArr[outlineArr.length -1]);
  while(nextPos != null && !(nextPos.x == outlineArr[0].x && 
         nextPos.y == outlineArr[0].y)){
    
    outlineArr[outlineArr.length] = nextPos;
    nextPos = getNextPos(outlineArr[outlineArr.length -1]);
  }
  
}

function getNextPos(curPos){
  var dirs = [
    // new Vector(curPos.x+1,curPos.y),
    // new Vector(curPos.x-1,curPos.y),
    // new Vector(curPos.x,curPos.y+1),
    // new Vector(curPos.x,curPos.y-1),
    // new Vector(curPos.x+1,curPos.y-1),
    // new Vector(curPos.x-1,curPos.y-1),
    // new Vector(curPos.x+1,curPos.y+1),
    // new Vector(curPos.x-1,curPos.y+1)
  ];

  for(var i =1 ;i <= 6;i++){
    dirs[dirs.length] = new Vector(curPos.x+i,curPos.y);
    dirs[dirs.length] = new Vector(curPos.x-i,curPos.y);
    dirs[dirs.length] = new Vector(curPos.x,curPos.y+i);
    dirs[dirs.length] = new Vector(curPos.x,curPos.y-i);
    dirs[dirs.length] = new Vector(curPos.x+i,curPos.y-i);
    dirs[dirs.length] = new Vector(curPos.x-i,curPos.y-i);
    dirs[dirs.length] = new Vector(curPos.x+i,curPos.y+i);
    dirs[dirs.length] = new Vector(curPos.x-i,curPos.y+i);
  }
  
  
  for(var i = 0 ; i < dirs.length; i++){
    var contained = false;
    for(var j = 1; j <= outlineArr.length; j++){
      if(outlineArr.length - j < 0){
        break;
      } 
      if(dirs[i].x == outlineArr[outlineArr.length - j].x &&
        dirs[i].y == outlineArr[outlineArr.length - j].y){
        contained = true;
      }
    }
    
    if(contained){
      continue;
    }
    
    if(dirs[i].x >= imgArr[0].length || dirs[i].x < 0 || 
      dirs[i].y >= imgArr.length || dirs[i].y < 0){
      continue;
    }
    if(imgArr[dirs[i].y][dirs[i].x] >=trasnVal){
      continue;
    }
    
    var connectChecks = [
      new Vector(dirs[i].x+1,dirs[i].y),
      new Vector(dirs[i].x-1,dirs[i].y),
      new Vector(dirs[i].x,dirs[i].y+1),
      new Vector(dirs[i].x,dirs[i].y-1),
      new Vector(dirs[i].x+1,dirs[i].y-1),
      new Vector(dirs[i].x-1,dirs[i].y-1),
      new Vector(dirs[i].x+1,dirs[i].y+1),
      new Vector(dirs[i].x-1,dirs[i].y+1)
    ]
    
    for(var j = 0 ; j < connectChecks.length; j++){
      if(connectChecks[j].x >= imgArr[0].length || 
         connectChecks[j].x < 0 || 
        connectChecks[j].y >= imgArr.length || 
         connectChecks[j].y < 0){
        continue;
      }
      
      if(imgArr[connectChecks[j].y][connectChecks[j].x] >= trasnVal){
        return dirs[i];
      }
    }
    
  }
  print(null);
  return null;
}

function getFog(){
  const fogScale = 0.001;
  
  fogImg = createImage(w, h);
  fogImg.loadPixels();
  for(var y = 0 ; y < fogImg.height; y++){
    for(var x = 0 ; x < fogImg.width; x++){
      let index = (x + y * fogImg.width) * 4;
      fogImg.pixels[index] = 255;
      fogImg.pixels[index + 1] = 255;
      fogImg.pixels[index + 2] = 255;

      const trasVal = noise(Math.abs(x- fogImg.width/2) *fogScale,y*fogScale);
      fogImg.pixels[index + 3] = trasVal*255 *0.5;
    }
  }

  fogImg.updatePixels();
}

class Vector{
  constructor(x,y){
    this.x = x;
    this.y = y;
  }
}

