const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require('fs');
let currentDir = [];
//TODO:
//https://stackoverflow.com/questions/32780726/how-to-access-dom-elements-in-electron
//Use the link above to try and send messages between script.js and main.js
//I.E. Requesting files in current directory


function createWindow () {
  // Create the browser window.
  let win = new BrowserWindow({ 
    width: 400,
    height: 700, 
    // maxHeight: 700, 
    // maxWidth: 400, 
    // minHeight:700, 
    // minWidth: 400
    nodeIntegration: true
  })
  // and load the index.html of the app.
  // win.setMenu(null);
  win.loadFile('index.html')
  fs.readdir('.', (err, files) => {
    currentDir = files;
    app.emit('files');
    console.log(hideHiddenFiles(files));
  })
}
app.on('ready', createWindow)

ipcMain.on('files', (event, data) => {
  event.sender.send('fileReply', currentDir);
})

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