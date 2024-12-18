const seekbar= document.getElementById("seekbar");
seekbar.addEventListener("click",(event)=>{
    let leftPercent = event.offsetX/event.target.getBoundingClientRect().width;

})