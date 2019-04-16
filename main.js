const { app, BrowserWindow, ipcMain, Menu, MenuItem, webContents} = require('electron')
const fs = require('fs');
const rimraf = require('rimraf');
let currentDir = ["/"];
let isRoot = true;
let pages = [];
let renderer;
const ePrompt = require('electron-prompt');
let started = false;
let win; 

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ 
    width: 1280,
    height: 800, 
    nodeIntegration: true,
  })
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

//User wants to make a new file
ipcMain.on('fileMake', () => {
  ePrompt({
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
      let filePath = (this.isRoot ? '/' + r : '/' + currentDir.slice(1).join('/') + '/' + r);
      console.log(filePath);
      fs.open(filePath, 'w', (err, file) =>{
        win.webContents.send('fileCRUD');
      })
    }
})
.catch(console.error);
})

//User wants to delete a file
ipcMain.on('fileDelete', () => {
  ePrompt({
    title: 'Delete A File',
    label: 'Delete A File from this Directory',
    value: '',
    inputAttrs: {
        type: 'text'
    }
  })
  .then((r) => {
      if(r === null) {
          console.log('user cancelled');
      } else {
        let filePath = (this.isRoot ? '/' + r : '/' + currentDir.slice(1).join('/') + '/' + r);
        console.log(filePath);
        fs.unlink(filePath, (err, file) => {
          win.webContents.send('fileCRUD');
        })
      }
  })
  .catch(console.error);
})

//User wants to copy a file
ipcMain.on('fileCopy', () => {
  ePrompt({
    title: 'Copy A File',
    label: 'Copy A File from this Directory to Another',
    value: '',
    inputAttrs: {
        type: 'text'
    }
  })
  .then((r) => {
      if(r === null) {
        return;
      } else {
        let filePath = (this.isRoot ? '/' + r : '/' + currentDir.slice(1).join('/') + '/' + r);
        ePrompt({
          title: 'Enter Directory',
          label: 'Enter a Directory to copy ' + r + ' to',
          value: '',
          inputAttrs: {
            type: 'text'
          }
        })
        .then((response) => {
          console.log(response);
          if(fs.existsSync(filePath)){
            console.log("Copying " + filePath + " to " + response)
            fs.copyFile(filePath, response, (err) => {
              if(err){
                console.log(err);
              } else {
                win.webContents.send('fileCRUD');
              }
            })
          } else {
            console.log("Does not exist");
          }
        })
      }
  })
  .catch(console.error);
})

//User wants to move a file
ipcMain.on('fileMove', () => {
  ePrompt({
    title: 'Move A File',
    label: 'Move A File from this Directory to Another',
    value: '',
    inputAttrs: {
        type: 'text'
    }
  })
  .then((r) => {
      if(r === null) {
        return;
      } else {
        let filePath = (this.isRoot ? '/' + r : '/' + currentDir.slice(1).join('/') + '/' + r);
        ePrompt({
          title: 'Enter Directory',
          label: 'Enter a Directory to move ' + r + ' to',
          value: '',
          inputAttrs: {
            type: 'text'
          }
        })
        .then((response) => {
          if(fs.existsSync(filePath)){
            fs.rename(filePath, response, (err) => {
              if(err){
                console.log(err);
              } else {
                win.webContents.send('fileCRUD');
              }
            })
          } else {
            console.log("Does not exist");
          }
        })
      }
  })
  .catch(console.error);
})

//User wants to make a new directory
ipcMain.on('directoryMake', () => {
  ePrompt({
    title: 'Create a Directory',
    label: 'Create a Directory in this Directory',
    value: '',
    inputAttrs: {
        type: 'text'
    }
  })
  .then((r) => {
      if(r === null) {
          console.log('user cancelled');
      } else {
        let filePath = (this.isRoot ? '/' + r : '/' + currentDir.slice(1).join('/') + '/' + r);
        if(!fs.existsSync(filePath)){
          console.log(filePath);
          fs.mkdir(filePath, {recursive: false, mode: 0644}, (err, file) => {
            console.log("Made: " + filePath);
            win.webContents.send('fileCRUD');
          })
        }
      }
  })
  .catch(console.error);
})

//User wants to delete a directory
ipcMain.on('directoryDelete', () => {
  ePrompt({
    title: 'Delete a Directory',
    label: 'Delete a Directory in this Directory',
    value: '',
    inputAttrs: {
        type: 'text'
    }
  })
  .then((r) => {
      if(r === null) {
          console.log('user cancelled');
      } else {
        let filePath = (this.isRoot ? '/' + r : '/' + currentDir.slice(1).join('/') + '/' + r);
        //Deletes directory regardless of whether or not it is empty
        rimraf(filePath, () => {
          win.webContents.send('fileCRUD');
        })
      }
  })
  .catch(console.error);
})

//Additional Feature, allows user to change the background photo of their
//File system, must be within current directory
ipcMain.on('backgroundChange', () => {
  ePrompt({
    title: 'Change Background Image',
    label: 'Change the Background Image',
    value: '',
    inputAttrs: {
        type: 'text'
    }
  })
  .then((r) => {
      if(r === null) {
          console.log('user cancelled');
      } else {
        let filePath = (this.isRoot ? '/' + r : '/' + currentDir.slice(1).join('/') + '/' + r);
        if(fs.exists){
          if(r.slice(r.length - 4) === '.jpg' || r.slice(r.length - 4) === '.png'){
            win.webContents.send('backgroundChange', filePath);
          }
        } else {

        }
        
      }
  })
  .catch(console.error);
})

//User has requested information for a file or directory
ipcMain.on('fileInfo', (event, data) => {
  let info = new BrowserWindow({ 
    width: 400,
    height: 400, 
    nodeIntegration: true,
  })
  // win.setMenu(null);
})

//Fetches the files at a given directory
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
