var {remote} = require('electron').remote;
var ipc = require('electron').ipcRenderer;
const fs = require('fs');
const PIXI = require('pixi.js');
let canvas = document.getElementById('myCanvas');
let currentDir = ""
let currentFiles = [];
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

const img = new PIXI.Sprite.fromImage('images/wallpaper.png');
img.width = window.innerWidth;
img.height = window.innerHeight;
img.x = 0;
img.y = 0;
app.stage.addChild(img);

ipc.send('files', 'send files plz');

//Holds the information and methods for Files
class File {
    
    constructor(sprite, filename){
        this.filename = filename;
        this.filepath = null;
        this.sprite = sprite;

        this.sprite.interactive = true;
        this.sprite.on('click', (e) => {
            console.log("Clicked: " + filename);
        })
    }

    clicked(){
        if(directory){
            ipc.send('files', this.filepath);
        }
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
    let x = 26.5;
    let y = 50;
    for (const file in data) {
        let size = 65;
        if((file != 0) && (file % 4 === 0)){
            console.log("It equals zero");
            x = 26.5;
            y += 100;
        }

        let img = new PIXI.Sprite.fromImage('images/fileSprite.svg');
        img.width = size;
        img.height = size;
        img.x = x;
        img.y = y;

        let temp = new File(img, data[file]);
        console.log(img);
        currentFiles.push(temp);
        

        // let temp = new File(data[file], size, x, y);
        // // console.log(temp.generateSprite());
        app.stage.addChild(img);
        // temp.generateSprite(this.app);
        x = x + 95;


    }


})