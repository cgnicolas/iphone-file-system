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

fs.readdir('/', (files)=>{
    for (const file in files) {
        console.log(file);
    }
})
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

ipc.on('fileReply', (event ,data) => {
    //console.log(data);
    //TODO: Make file sprites appear
    for (const file in data) {
        let temp = new File(data[file]);
        console.log(temp.filename);
    }


})

const img = new PIXI.Sprite.fromImage('images/wallpaper.png');
img.width = window.innerWidth;
img.height = window.innerHeight;
img.x = 0;
img.y = 0;
app.stage.addChild(img);

ipc.send('files', 'send files plz');

//Holds the information and methods for Files
class File {
    
    constructor(filename){
        this.filename = filename;
    }
}