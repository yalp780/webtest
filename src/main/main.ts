/* eslint global-require: off, no-console: off, promise/always-return: off */
// Disables specific ESLint rules globally for this file.

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
// Block comment explaining the purpose of this module and its build process.

// Import the 'path' module from Node.js for handling file and directory paths.
import path from 'path';

// Import specific classes and functions from the 'electron' module needed to manage the app lifecycle and windows.
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';

// Import the 'autoUpdater' class from 'electron-updater' for handling automatic software updates.
import { autoUpdater } from 'electron-updater';

// Import the 'log' function from 'electron-log' for logging purposes.
import log from 'electron-log';

// Import the 'MenuBuilder' class from the local 'menu' module, which helps in creating the application menu.
import MenuBuilder from './menu';

// Import the 'resolveHtmlPath' function from a local utility module, which resolves HTML file paths for loading into Electron windows.
import { resolveHtmlPath } from './util';

// Define a class 'AppUpdater' to encapsulate logic related to application updates.
class AppUpdater {
  constructor() {
    // Set the log level to 'info' for the file transport, affecting what logs are written to files.
    log.transports.file.level = 'info';

    // Assign the electron updater's logger to use our 'log' instance for unified logging.
    autoUpdater.logger = log;

    // Trigger an automatic check for updates and notify the user if updates are available.
    autoUpdater.checkForUpdatesAndNotify();
  }
}

// Declare a variable 'mainWindow' to hold the reference to the main application window.
let mainWindow: BrowserWindow | null = null;

// Set up an IPC event listener for 'ipc-example' channel to handle messages from renderer processes.
ipcMain.on('ipc-example', async (event, arg) => {
  // Function to format a message string for IPC responses.
  const msgTemplate = (pingPong: string) => `IPC testing : ${pingPong}`;

  // Log a formatted message using the argument received from the renderer.
  console.log(msgTemplate(arg));

  // Respond to the renderer by sending a 'pong' message back using the same channel.
  event.reply('ipc-example', msgTemplate('pong'));
});

// Check if the application is running in production mode.
if (process.env.NODE_ENV === 'production') {
  // If in production, enable source map support for better error debugging.
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

// Check if the application is in development or explicitly set to debug mode.
const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

// If the app is in debug mode, enable additional debugging features.
if (isDebug) {
  // Require and execute the electron-debug module, which adds useful debugging features like hotkeys for reloading.
  require('electron-debug')();
}

// Define an asynchronous function to install development tools like React Developer Tools.
const installExtensions = async () => {
  // Require the 'electron-devtools-installer' module to install extensions.
  const installer = require('electron-devtools-installer');

  // Determine if extension updates are forced via environment variables.
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;

  // List of extensions to install, currently hardcoded to install React Developer Tools.
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  // Use the installer to install the specified extensions and log any errors that occur.
  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

// Define an asynchronous function to create and set up the main application window.
const createWindow = async () => {
  // If in debug mode, install developer extensions for debugging and development.
  if (isDebug) {
    await installExtensions();
  }

  // Define the base path for resources depending on whether the app is packaged.
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  // Helper function to get the full path to a specific asset.
  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  // Initialize the main window with specified options.
  mainWindow = new BrowserWindow({
    show: false, // Initially hide the window to prevent flickering until it's ready.
    width: 800, // Set the window's width.
    height: 600, // Set the window's height.
    icon: getAssetPath('icon.png'), // Set the window's icon.
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js') // Use the packaged path for the preload script.
        : path.join(__dirname, '../../.erb/dll/preload.js'), // Use the development path for the preload script.
    },
  });

  // Load the main HTML file into the window from the resolved path.
  mainWindow.loadURL(resolveHtmlPath('index.html'));

  // Set up an event to show the window only when Electron has finished loading all resources, for a smooth user experience.
  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize(); // Start the app minimized if specified by the environment.
    } else {
      mainWindow.show(); // Otherwise, show the window.
    }
  });

  // Handle the window close event by cleaning up references to the window.
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create a new menu for the application using the MenuBuilder class.
  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Prevent new windows from being opened and open external links in the default browser.
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  ipcMain.handle('save-dialog', async (event, { defaultPath, options }) => {
    const window = BrowserWindow.getFocusedWindow();
    if (!window) return;

    const result = await dialog.showSaveDialog(window, { defaultPath, ...options });
    return result;
  });

  // Initialize the app updater to handle automatic updates.
  new AppUpdater();
};

// Handle the Electron 'window-all-closed' event by quitting the application unless it's running on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// When the application is ready, set up the main window and any additional windows if the app is reactivated.
app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
