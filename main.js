const { app, BrowserWindow } = require('electron')

function createWindow () {
  // Create the browser window.
  let win = new BrowserWindow({ width: 400, height: 700, maxWidth: 400, maxHeight: 700 })

  // and load the index.html of the app.
  win.loadFile('index.html')
}

app.on('ready', createWindow)
