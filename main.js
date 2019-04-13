const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require('fs');
let currentDir = ["/"];
let isRoot = true;
//TODO:
//https://stackoverflow.com/questions/32780726/how-to-access-dom-elements-in-electron
//Use the link above to try and send messages between script.js and main.js
//I.E. Requesting files in current directory
let started = false;


function createWindow () {
  // Create the browser window.
  let win = new BrowserWindow({ 
    width: 1280,
    height: 800, 
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
    currentDir.push(data);
    console.log("CurrentDir on Files: /" + currentDir.slice(1).join('/'));
    isRoot = false;
    fetchFilesAt('/' + currentDir.slice(1).join('/'), event);
  }

})
ipcMain.on('back', (event, data) => {
  // console.log("CurrentDir Back: /" + currentDir.slice(1).join('/'));
  if(!isRoot){
    currentDir.pop();
  }
  if(currentDir[currentDir.length - 1] === "/"){
    isRoot = true;
  }
  console.log("Current Dir: /" + currentDir.slice(1).join('/'));
  fetchFilesAt((isRoot ? '/' : ('/' + currentDir.slice(1).join('/'))), event);
})



function fetchFilesAt(directory, event){
  // console.log("FetchFilesAt:" + directory);
  fs.readdir(directory, (err, files) => {
    // app.emit('files');
    let data = {
      files: hideHiddenFiles(files, directory),
      isRoot: isRoot
    }
    event.sender.send('fileReply', data);
  })
}

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