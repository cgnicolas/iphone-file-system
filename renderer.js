var {remote} = require('electron').remote;
var ipc = require('electron').ipcRenderer;
const fs = require('fs');
const PIXI = require('pixi.js');
let canvas = document.getElementById('myCanvas');
let currentDir = ""
let currentFiles = [];
let directory = false;
let isRoot = true;
let parent = "";
let pages = [];
let wWidth = window.innerWidth;


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
const img = new PIXI.Sprite.fromImage('images/wallpaper.png');
img.width = window.innerWidth;
img.height = window.innerHeight;
img.x = 0;
img.y = 0;
// app.stage.addChild(img);

//File Container
let fileContainer = new PIXI.Container();
fileContainer.x = 0;
fileContainer.y = 0;
fileContainer.height = window.innerHeight;
fileContainer.width = window.innerWidth;
app.stage.addChild(fileContainer);

ipc.send('files', 'send files plz');

//Holds the information and methods for Files
class File {
    constructor(sprite, filename, stat, path){
        this.filename = filename;
        this.filepath = path;
        this.sprite = sprite;
        this.stat = stat;
        this.sprite.interactive = true;
        this.clicked = this.clicked.bind(this);
        this.sprite.on('click', (e) => {
            if(stat.mode == 16822){
                this.clicked();
                parent = this.filepath;
                console.log(parent);
            }
        })
    }

    clicked(){
        ipc.send('files', this.filename)
        isRoot = false;
    }
}



/*-------------------- IPC Event Handlers ------------------ */
ipc.on('fileReply', (event ,data) => {
    clearFiles();
    handleFileReply(data);
})

function clearFiles(){
    while(fileContainer.children[0]){
        fileContainer.removeChild(fileContainer.children[0]);
    }
    currentFiles = [];
}

function displayPage(page){
    clearFiles();
    for (const item in pages[page]) {
        fileContainer.addChild(pages[page][item]);
    }
}

function handleFileReply(data){
    pages = []
    if(!isRoot){
        //TODO: Render back button
        let container = new PIXI.Container();
        container.x = 0;
        container.y = 0;
        container.width =wWidth;
        container.height = 40;
        console.log("Here");
    
       let cBackground = new PIXI.Sprite.fromImage('imgaes/fileSprite.svg');
       cBackground.width = wWidth
       cBackground.height = 40;
        console.log("here 2");
    
        container.addChild(cBackground);
    
        fileContainer.addChild(container);
    }

    let x = 26.5;
    let y = 60;
    let page = [];
    for (const file in data.files) {
        let size = 65;
        if((file != 0) && (file % 7 === 0)){
            console.log("It equals zero");
            x = 26.5;
            y += 110;
        }
        let container = new PIXI.Container();
        container.x = x;
        container.y = y;
        container.width = size;
        container.height = size + 5;

        let text = new PIXI.Text(data.files[file].name, {fontFamily : 'Helvetica Neue', fill : 0xffffff, fontSize:12, align : 'center'})
        text.anchor.set(.1, -4.5);
        text.resolution =5;
        text.scale.set(1);

        let sprite = new PIXI.Sprite.fromImage('images/fileSprite.svg');
        sprite.width = size;
        sprite.height = size;

        let temp = new File(sprite, data.files[file].name, data.files[file].stat, data.files[file].path);
        currentFiles.push(temp);
        container.addChild(sprite);
        container.addChild(text)
        //Filling pages
        if((parseInt(file) + 1) % 24 == 0){
            console.log("Page change");
            pages.push(page);
            page = [];
        }
        page.push(container);
        x = x + 170;
    }
    pages.push(page);
    displayPage(0);
}

function displayBackButton(){
    console.log("Back Button being displayed");
    
}