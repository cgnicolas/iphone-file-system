const { app, BrowserWindow } = require('electron')

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
  win.setMenu(null);
  win.loadFile('index.html')
}

app.on('ready', createWindow)
