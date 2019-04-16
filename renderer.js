var ipc = require('electron').ipcRenderer;
const fs = require('fs');
const PIXI = require('pixi.js');
const ePropmt = require('electron-prompt');
let canvas = document.getElementById('myCanvas');
let currentFiles = [];
let pages = [];
let wWidth = window.innerWidth;
let currentPage = 0;


/* -------------- Initialization ------------------- */
const app = new PIXI.Application({
    view: canvas,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: 0x061639
});

app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);


//Background
let bImg = new PIXI.Sprite.fromImage('images/wallpaper.png');
bImg.width = window.innerWidth;
bImg.height = window.innerHeight;
bImg.x = 0;
bImg.y = 0;
app.stage.addChild(bImg);

//File Container
let fileContainer = new PIXI.Container();
fileContainer.x = 0;
fileContainer.y = 0;
fileContainer.height = window.innerHeight;
fileContainer.width = window.innerWidth;
app.stage.addChild(fileContainer);


//Create NavBar
let navBarContainer = new PIXI.Container();
navBarContainer.x = 0;
navBarContainer.y = 0;
navBarContainer.width = window.innerWidth;
navBarContainer.height = 40;
console.log("Here");

//White Background for Nav Bar
let cBackground = new PIXI.Sprite.fromImage('images/cBackground.svg');
cBackground.width = wWidth
cBackground.height = 40;
console.log(navBarContainer, cBackground);

//Back Button
let cBack = new PIXI.Text('../', {fontFamily : 'Helvetica Neue', fill : 0x000000, fontSize:12, align : 'center'})
cBack.anchor.set(-1, -1);
cBack.interactive = true;
cBack.on('click', () => {
    ipc.send('back');
})
//Next Page Button
let cNext = new PIXI.Text('Next', {fontFamily : 'Helvetica Neue', fill : 0x000000, fontSize:12, align : 'center'})
cNext.anchor.set(-1, -1);
cNext.x = wWidth - (cNext.width * 3);
cNext.interactive = true;
cNext.on('click', () => {
    currentPage++;
    checkPage();
    displayPage(currentPage);
    console.log("Go Next");
})
//Previous Page Button
let cPrev = new PIXI.Text('Prev', {fontFamily : 'Helvetica Neue', fill : 0x000000, fontSize:12, align : 'center'})
cPrev.anchor.set(-1, -1);
cPrev.x = (wWidth / 2) - (cNext.width * 3);
cPrev.interactive = true;
cPrev.on('click', () => {
    currentPage--;
    checkPage();
    displayPage(currentPage)
    console.log("Go Prev");
})

//Adding children to their respective container
navBarContainer.addChild(cBackground);
navBarContainer.addChild(cBack);
navBarContainer.addChild(cPrev);
app.stage.addChild(navBarContainer);

ipc.send('files', 'send files plz');

//Holds the information and methods for Files
class File {
    constructor(sprite, filename, stat, path, isDirectory){
        this.filename = filename;
        this.filepath = path;
        this.sprite = sprite;
        this.stat = stat;
        this.isDirectory = isDirectory;
        this.sprite.interactive = true;
        this.clicked = this.clicked.bind(this);
        this.sprite.on('click', (e) => {
            if(this.isDirectory){
                this.clicked();
            }
        })
        this.sprite.on('rightclick', (e) => {
            let dataToSend = {
                path: this.filepath,
                stat: this.stat
            }
            ipc.send('fileInfo', dataToSend);
        })
        this.sprite.on('touchstart', this.onButtonDown);
        this.sprite.on('touchend', this.onButtonUp);
    }

    clicked(){
        currentPage = 0;
        ipc.send('files', this.filename)
    }
}



/*-------------------- IPC Event Handlers ------------------ */
//main has loaded new files
ipc.on('fileReply', (event ,data) => {
    clearFiles();
    handleFileReply(data);
})
//Refresh page
ipc.on('fileCRUD', (event, data) => {
    currentPage = 0;
    ipc.send('files', 'currentDir');
})
//Changing background
ipc.on('backgroundChange', (event, data) => {
    app.stage.removeChild(bImg);

    bImg = new PIXI.Sprite.fromImage(data);
    bImg.width = window.innerWidth;
    bImg.height = window.innerHeight;
    bImg.x = 0;
    bImg.y = 0;
    app.stage.addChild(bImg);
    app.stage.swapChildren(fileContainer, bImg);
})

/*------------------------- Helper Functions ------------------*/
//Clearing the page
function clearFiles(){
    while(fileContainer.children[0]){
        fileContainer.removeChild(fileContainer.children[0]);
    }
    currentFiles = [];
}
//Display a given page on pressing 'Next' or 'Prev'
function displayPage(page){
    clearFiles();
    //TODO: X's and Y's need to fixed when displaying the page, possible fix in handleFileReply
    for (const item in pages[page]) {
        fileContainer.addChild(pages[page][item]);
    }
}

//Handles the new files and creates respsective sprites
function handleFileReply(data){
    pages = []
    console.log(data);
    if(!data.isRoot){
        //TODO: Render back button
        navBarContainer.addChild(cBack);
    } else {
        navBarContainer.removeChild(cBack);
    }

    let x = 26.5;
    let y = 60;
    let page = [];
    for (const file in data.files) {
        let size = 65;
        //Making rows
        if((parseInt(file) != 0) && (parseInt(file) % 7 === 0)){
            console.log("It equals zero");
            x = 26.5;
            y += 110;
        }
        //Resetting pages
        if((parseInt(file) !== 0) && (parseInt(file) % 35 === 0)){
            console.log("Page change");
            x = 26.5;
            y = 60;
        }
        let container = new PIXI.Container();
        container.x = x;
        container.y = y;

        let text = new PIXI.Text(data.files[file].name, {fontFamily : 'Helvetica Neue', fill : 0xffffff, fontSize:12, align : 'center', wordWrap:true})
        text.resolution =5;
        text.scale.set(1);
        text.y = size;

        let sprite = new PIXI.Sprite.fromImage('images/fileSprite.svg');
        sprite.width = size;
        sprite.height = size;

        let temp = new File(sprite, data.files[file].name, data.files[file].stat, data.files[file].path, data.files[file].isDirectory);
        currentFiles.push(temp);
        container.addChild(sprite);
        container.addChild(text)
        //Filling pages
        if((parseInt(file) !== 0) && (parseInt(file) % 35 === 0)){
            pages.push(page);
            page = [];
        }
        page.push(container);
        x = x + 170;
    }
    pages.push(page);
    checkPage();
    //TODO: Add Pagination
    displayPage(0);
}

//Check if page is within page bounds
function checkPage(){
    if(pages.length > 1 && currentPage != pages.length - 1){
        console.log(navBarContainer.width, cNext.x);
        navBarContainer.addChild(cNext);
    } else {
        navBarContainer.removeChild(cNext);
    }
    if(currentPage >= 1){
        navBarContainer.addChild(cPrev);
    }
    else{
        navBarContainer.removeChild(cPrev);
    }
}