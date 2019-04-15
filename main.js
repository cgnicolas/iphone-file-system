const { app, BrowserWindow, ipcMain, Menu, MenuItem, webContents} = require('electron')
const fs = require('fs');
let currentDir = ["/"];
let isRoot = true;
let pages = [];
let renderer;
const ePropmt = require('electron-prompt');
//TODO:
//https://stackoverflow.com/questions/32780726/how-to-access-dom-elements-in-electron
//Use the link above to try and send messages between script.js and main.js
//I.E. Requesting files in current directory
let started = false;
let win; 
//TODO: Create Update and Destroy
function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ 
    width: 1280,
    height: 800, 
    nodeIntegration: true,
  })
  // win.setMenu(null);
  win.loadFile('index.html')
  require('./MainMenu.js')
}
app.on('ready', createWindow)

ipcMain.on('files', (event, data) => {
  if(started == false){
    fetchFilesAt("/", event);
    started = true;
  } else if (data === 'currentDir'){
    fetchFilesAt('/' + currentDir.slice(1).join('/'), event);
  }
  else {
    currentDir.push(data);
    console.log("CurrentDir on Files: /" + currentDir.slice(1).join('/'));
    isRoot = false;
    fetchFilesAt('/' + currentDir.slice(1).join('/'), event);
  }

})

//Back Button was pressed
ipcMain.on('back', (event, data) => {
  if(!isRoot){
    currentDir.pop();
  }
  if(currentDir[currentDir.length - 1] === "/"){
    isRoot = true;
  }
  console.log("Current Dir: /" + currentDir.slice(1).join('/'));
  //Fetch files at the previous directory
  fetchFilesAt((isRoot ? '/' : ('/' + currentDir.slice(1).join('/'))), event);
})

ipcMain.on('fileMake', () => {
  // win.webContents.send('fileMake')
  ePropmt({
    title: 'Create New File',
    label: 'Make A New File in this Directory',
    value: '',
    inputAttrs: {
        type: 'text'
    }
})
.then((r) => {
    if(r === null) {
        console.log('user cancelled');
    } else {
      let filePath = (isRoot ? '/' + r : '/' + currentDir.slice(1).join('/') + '/' + r);
      console.log(filePath);
      fs.open(filePath, 'w', (err, file) =>{
        win.webContents.send('fileMake');
      })
    }
})
.catch(console.error);
})


function fetchFilesAt(directory, event){
  fs.readdir(directory, (err, files) => {
    let data = {
      files: hideHiddenFiles(files, directory),
      isRoot: isRoot
    }
    event.sender.send('fileReply', data);
  })
}
//Hides all hidden Files
function hideHiddenFiles(files, directory){
  let filesToShow = [];
  for (const i in files) {

    if(files[i].charAt(0) === '.'){
      continue;
    } else {
      if(files[i] === "System Volume Information"){
        continue;
      }
      filesToShow.push(files[i]);
    }
    // filesToShow.push(files[i]);
  }

  let filesToSend = [];

  for (const file in filesToShow) {
    let filePath = (isRoot ? '/' : '/' + currentDir.slice(1).join('/') + '/' + filesToShow[file]);
    let stat = fs.lstatSync(filePath);
    let info = {
      path: filePath,
      stat: stat,
      isDirectory: stat.isDirectory(),
      name: filesToShow[file]
    }
    filesToSend.push(info);
  }

  return filesToSend;
}
