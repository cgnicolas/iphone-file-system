var {remote} = require('electron').remote;
var ipc = require('electron').ipcRenderer;
const fs = require('fs');
const PIXI = require('pixi.js');
let canvas = document.getElementById('myCanvas');
let currentDir = ""
let currentFiles = [];
let directory = false;
let isRoot = true;
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

// const img = new PIXI.Sprite.fromImage('images/wallpaper.png');
// img.width = window.innerWidth;
// img.height = window.innerHeight;
// img.x = 0;
// img.y = 0;
// app.stage.addChild(img);

ipc.send('files', 'send files plz');

//Holds the information and methods for Files
class File {

    
    constructor(sprite, filename){
        this.filename = filename;
        this.filepath = null;
        this.sprite = sprite;

        this.sprite.interactive = true;
        this.clicked = this.clicked.bind(this);
        this.sprite.on('click', (e) => {
            this.clicked();
        })
    }

    clicked(){
        ipc.send('files', this.filepath);
        this.isRoot = false;
    }


    generateSprite(app){
        let img = new PIXI.Sprite.fromImage('images/fileSprite.svg');
        img.width = this.size;
        img.height = this.size;
        img.x = this.x;
        img.y = this.y;
        app.stage.addChild(img);
    }
}

/*-------------------- IPC Event Handlers ------------------ */
ipc.on('fileReply', (event ,data) => {
    //console.log(data);
    //TODO: Make file sprites appear
    clearFiles(app.stage);
    let x = 26.5;
    let y = 60;
    for (const file in data) {
        let size = 65;
        if((file != 0) && (file % 6 === 0)){
            console.log("It equals zero");
            x = 26.5;
            y += 110;
        }

        let container = new PIXI.Container();
        container.x = x;
        container.y = y;
        container.width = size;
        container.height = size + 5;

        let text = new PIXI.Text(data[file], {fontFamily : 'Helvetica Neue', fill : 0xffffff, fontSize:12, align : 'center'})
        text.anchor.set(.1, -4.5);
        text.resolution =5;
        text.scale.set(1);

        let sprite = new PIXI.Sprite.fromImage('images/fileSprite.svg');
        sprite.width = size;
        sprite.height = size;

        let temp = new File(sprite, data[file]);
        currentFiles.push(temp);
        container.addChild(sprite);
        container.addChild(text)
        app.stage.addChild(container);
        x = x + 170;
    }


})

function clearFiles(){
    while(app.stage.children[0]){
        app.stage.removeChild(app.stage.children[0]);
    }
    currentFiles = [];
}