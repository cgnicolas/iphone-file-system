const { app, BrowserWindow } = require('electron')
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
  })
  // and load the index.html of the app.
  // win.setMenu(null);
  win.loadFile('index.html')
}
app.on('ready', createWindow)
