const currentSong = new Audio();
let  folderArray=[], shuffle =false, musicArray=[], musicIndex ,songDetails = [], currFolder, currFolderIndex, footerVisible = false, leftHidden =false, rightHidden =false, lastUpadatedVolumeValue;
//lefthidden, righthidden is true only when set by JS and only one of them is hidden at a time
//element group
const mainElement = document.querySelector("main");
const footer = document.querySelector("footer");
const leftElement = document.querySelector(".left");
const rightElement = document.querySelector(".right");
const hamburger = document.querySelector(".righthead>:nth-child(1)");
const hamburgerCloser = document.querySelector(".lefthead>:nth-child(3)");
const homeButton = document.querySelector("header .home-circle");
//playing Song info group
const playingSongImg = document.querySelector("footer .playingSongInfo>:nth-child(1)"); 
const playingSongName = document.querySelector("footer .playingSongInfo>:nth-child(2)");
const playingSongAuthor = document.querySelector("footer .playingSongInfo>:nth-child(3)");
//playBar group
const currentTimer =document.querySelector("footer .playBar>:nth-child(1)");
const rangeBar = document.querySelector("footer .playBar>:nth-child(2)");
const durationTimer =document.querySelector("footer .playBar>:nth-child(3)");
//playbutton group
const shufflebutton = document.querySelector("footer .playGroup>:nth-child(1)");
const previousbutton = document.querySelector("footer .playGroup>:nth-child(2)");
const playbutton = document.querySelector("footer .playGroup>:nth-child(3)");
const nextbutton = document.querySelector("footer .playGroup>:nth-child(4)");
const loopbutton = document.querySelector("footer .playGroup>:nth-child(5)");
//volume group
const volumeImg = document.querySelector("footer .volume>:nth-child(1)");
const volumeBar = document.querySelector("footer .volume>:nth-child(2)");
main();

//event listners on audio element;
currentSong.addEventListener("timeupdate",()=>{
  let minutes = Math.trunc(currentSong.currentTime / 60);
  let seconds = Math.trunc(currentSong.currentTime % 60);
  currentTimer.innerHTML =`${minutes}:${seconds<10?"0"+seconds:seconds}`; 

  rangeBar.value=`${((currentSong.currentTime*1000)/currentSong.duration).toFixed(0)}`
  //1000 input integer steps of 1 for smoother transition 
})
currentSong.addEventListener("loadedmetadata",()=>{
  let minutes = Math.trunc(currentSong.duration / 60);
  let seconds = Math.trunc(currentSong.duration % 60);
  durationTimer.innerHTML =`${minutes}:${seconds<10?"0"+seconds:seconds}`; 
  rangeBar.value = 0;//reset to avoid that 50% filled look on chnaging track
  volumeBar.value =currentSong.volume;// setting volume on song change and initial
})
currentSong.addEventListener('ended',()=>{
 playMusic(musicIndex+1);
})

//Event listener on seek elements
rangeBar.addEventListener("input",(eve)=>{
  currentSong.currentTime = (eve.target.value/1000)*currentSong.duration;
})

//Event listners on play group
shufflebutton.addEventListener("click",async()=>{
  if(!shuffle){
    shuffle =true;
    shufflebutton.src ="/assets/svgFolder/shufflegreen.svg";
    await getMusicList(currFolder);
    playMusic(0)
  }
  else{
    shuffle =false;
    shufflebutton.src ="/assets/svgFolder/shufflewhite.svg";
    await getMusicList(currFolder);
    playMusic(0);
  }
})
playbutton.addEventListener("click", togglePlayPause);
previousbutton.addEventListener("click",()=>{
  playMusic(musicIndex-1) 
})
nextbutton.addEventListener("click",()=>{
  playMusic(musicIndex+1);
})
loopbutton.addEventListener("click",()=>{
  if(currentSong.loop){
    currentSong.loop =false;
    loopbutton.src ="/assets/svgFolder/loop.svg"; 
  }else{
    currentSong.loop =true;
    loopbutton.src ="/assets/svgFolder/loop1.svg"; 
  }
})

//Event listner on volume
volumeBar.addEventListener('input',()=>{
currentSong.volume = volumeBar.value;
})

currentSong.addEventListener("volumechange",()=>{
  //to update volume range value on mute click add this line
  volumeBar.value = currentSong.volume;
  if(currentSong.volume >0.7){
    volumeImg.src ="/assets/svgFolder/volumeHigh.svg"
  }else if(currentSong.volume>0.3){
    volumeImg.src ="/assets/svgFolder/volumeMed.svg"
  }else if(currentSong.volume>0){
    volumeImg.src ="/assets/svgFolder/volumeLow.svg"
  }else{
    volumeImg.src ="/assets/svgFolder/volumeOff.svg"
  }
})

volumeImg.addEventListener("click",()=>{
  if(currentSong.volume !=0){
    lastUpadatedVolumeValue =currentSong.volume;
    currentSong.volume =0;
  }else{
  currentSong.volume = lastUpadatedVolumeValue;
  }
})

//homebutton listner to revert to initial look
homeButton.addEventListener("click",()=>{
  currentSong.src="";
  mainElement.style.gridTemplateRows="10% calc(90% - 1vw)";
  footer.style.display="none";
})

hamburger.addEventListener("click",()=>{
    rightHidden = true;
    leftHidden = false;
    rightElement.style.display="none";
    leftElement.style.display="grid";  
  })
  
hamburgerCloser.addEventListener("click",()=>{
  rightHidden = false;
  leftHidden = true;
  rightElement.style.display="grid";
  leftElement.style.display="none";
})

async function getMusicList(folderName) {
  currFolder = folderName;
  const response = await fetch(`http://127.0.0.1:3000/assets/musicAlbums/${folderName}`);
  const textHTML = await response.text();
  const newEle = document.createElement("div");
  newEle.innerHTML = textHTML;
  

  const songSidebar = document.querySelector("section.left > .leftfoot ul");
  let sideBarString = "";
  musicArray=[];
  Array.from(newEle.getElementsByTagName("a")).forEach((element)=>{
      if (element.href.endsWith(".mp3")) {
         musicArray.push(element.href);
      }
    })

  if(shuffle){
    musicArray.sort(()=>0.5-Math.random());
  }

    musicArray.forEach((element,index)=>{
  
      let songName= element.slice(0, -4).split(`/${folderName}/`)[1];
      sideBarString += `<li onclick="playMusic(${index})">
              <img src='assets/musicAlbums/${currFolder}/cover.jpg' >
              <img src="/assets/svgFolder/playlisthover.svg">
              <span>${decodeURI(songName)}</span>
              <span>${songDetails[folderArray.indexOf(folderName)].title}</span>
            </li>`;
    })    
    
    songSidebar.innerHTML = sideBarString;
}

async function getFolderList() {
  const response = await fetch("http://127.0.0.1:3000/assets/musicAlbums");
  const textHTML = await response.text();
  const newEle = document.createElement("div");
  newEle.innerHTML = textHTML;

  const folderAnchors = Array.from(newEle.getElementsByTagName("a"));
  const songMainbar = document.querySelector("section.right > ul");
  let mainBarString = "";

  //index 0 is always back href so ignore
  for(let index =1; index<folderAnchors.length;index++){
    let folder = folderAnchors[index].href.split("/musicAlbums/")[1].slice(0,-1);
    folderArray.push(folder);
    const response = await fetch(`http://127.0.0.1:3000/assets/musicAlbums/${folder}/info.json`);
    const infoJson= await response.json(); 
    songDetails.push(infoJson);
    mainBarString += `<li data-folder=${folder}> 
    <img src='/assets/musicAlbums/${folder}/cover.jpg'>
        <img src="/assets/svgFolder/greenplay.svg">
        <span>${infoJson.title}</span>
        <span>${infoJson.description}</span>
      </li>`;
  }  
  songMainbar.innerHTML = mainBarString;

for( let element of songMainbar.querySelectorAll("li")){
  element.addEventListener("click",async()=>{
    await getMusicList(element.dataset.folder);
    playMusic(0);
  })
 }
}

// Create a MediaQueryList object
const mmObj = window.matchMedia("(max-width: 800px)")

// Create a match Function
function myFunction(x) {
  if (x.matches) {
    if(footerVisible){
      //bringing out the footer
      mainElement.style.gridTemplateRows="10% calc(60% - 1vw) calc(30% - 1vw)";
      footer.style.display="grid";
    }
    
    if( leftHidden || rightHidden){
      if(rightHidden){
        rightElement.style.display="none";
      }
      if(leftHidden){
        leftElement.style.display="none";
      }
    } else{
      //our original css
      rightElement.style.display="grid";
      leftElement.style.display="none";
    }
  } else {
    if(footerVisible){
      //bringing out the footer
      mainElement.style.gridTemplateRows="10% calc(75% - 1vw) calc(15% - 1vw)";
      footer.style.display="grid";
    }
      rightElement.style.display="grid";
      leftElement.style.display="grid";
    }
  }


// Add the match function as a listener for state changes
mmObj.addEventListener("change", function() {
    myFunction(mmObj);
});

async function main() {
  //fetching all albums 
  await getFolderList();
  //loading first album for first time i=1
  getMusicList(folderArray[0])   
  }
 
function playMusic(index) {
  footerVisible =true;
  myFunction(mmObj);

  if(index==musicArray.length){
    musicIndex = 0;
  }else if(index == -1){
    musicIndex= musicArray.length-1;
  }else{
    musicIndex = index;
  }
  //index 0 has no data, first song =1, last song = 15

  currentSong.src = musicArray[musicIndex];
  //setting song info on footer song info
  playingSongImg.src = `assets/musicAlbums/${currFolder}/cover.jpg`;
  playingSongName.innerHTML = decodeURI(musicArray[musicIndex].slice(0, -4).split(`/${currFolder}/`)[1]);
  playingSongAuthor.innerHTML = songDetails[folderArray.indexOf(currFolder)].title;
  togglePlayPause();                          
}

function togglePlayPause() {
  if (currentSong.paused) {
    currentSong.play();
    playbutton.src ="/assets/svgFolder/pause.svg"; 
  } else {
    currentSong.pause();
    playbutton.src ="/assets/svgFolder/play.svg";
  }
}

