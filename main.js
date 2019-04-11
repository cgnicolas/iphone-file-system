const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require('fs');
let currentDir = [];
//TODO:
//https://stackoverflow.com/questions/32780726/how-to-access-dom-elements-in-electron
//Use the link above to try and send messages between script.js and main.js
//I.E. Requesting files in current directory
let started = false;


function createWindow () {
  // Create the browser window.
  let win = new BrowserWindow({ 
    width: 414,
    height: 736, 
    // maxHeight: 700, 
    // maxWidth: 400, 
    // minHeight:700, 
    // minWidth: 400
    nodeIntegration: true
  })
  // and load the index.html of the app.
  // win.setMenu(null);
  win.loadFile('index.html')
}
app.on('ready', createWindow)

ipcMain.on('files', (event, data) => {
  if(started == false){
    fetchFilesAt("/", event);
    started = true;
  } else {

  }

})

function fetchFilesAt(directory, event){
  fs.readdir(directory, (err, files) => {
    currentDir = files;
    app.emit('files');
    event.sender.send('fileReply', hideHiddenFiles(files));
  })
}

function hideHiddenFiles(files){
  let filesToShow = [];
  for (const i in files) {

    if(files[i].charAt(0) === '.'){
      continue;
    } else {
      filesToShow.push(files[i]);
    }
  }
  return filesToShow;
}