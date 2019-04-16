const {Menu, ipcMain} = require('electron')
const electron = require('electron')
const app = electron.app

const template = [
  {
    label: 'Edit',
    submenu: [
        {
          label:'Create New File',
          click(item, focusedWindow){
                ipcMain.emit('fileMake');
            }
        },
        {
          label: 'Delete',
          click(item, focusedWindow){
                ipcMain.emit('fileDelete');
            }
        },
        {
          label: 'Make Directory',
          click(item, focusedWindow){
            ipcMain.emit('directoryMake');
          }
        },
        {
          label: 'Delete Directory',
          click(item, focusedWindow){
            ipcMain.emit('directoryDelete');
          }
        },
        {
          label: 'Copy File',
          click(item, focusedWindow){
            ipcMain.emit('fileCopy');
          }
        },
        {
          label: 'Move File',
          click(item, focusedWindow){
            ipcMain.emit('fileMove');
          }
        }


    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload()
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools()
        }
      },
      {
        label: 'Change Background Image',
        click(item, focusedWindow){
          ipcMain.emit('backgroundChange');
        }
      }
    ]
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { require('electron').shell.openExternal('http://electron.atom.io') }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  const name = app.getName()
  template.unshift({
    label: name,
    submenu: [
      {
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
    ]
  })
  // Edit menu.
  template[1].submenu.push(
    {
      type: 'separator'
    },
    {
      label: 'Speech',
      submenu: [
        {
          role: 'startspeaking'
        },
        {
          role: 'stopspeaking'
        }
      ]
    }
  )
  // Window menu.
  template[3].submenu = [
    {
      label: 'Close',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    },
    {
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    },
    {
      label: 'Zoom',
      role: 'zoom'
    },
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  ]
}

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)