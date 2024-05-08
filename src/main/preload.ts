// Import necessary modules from the 'electron' package for IPC communication.
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// Define a TypeScript interface for save dialog options with filter configurations.
interface SaveDialogOptions {
  filters: { name: string; extensions: string[] }[];
}

// Create a type alias for channel names to ensure type safety with IPC communications.
type Channels = 'save-dialog' | 'write-file';

// Define a TypeScript interface for the exposed API, ensuring type safety across IPC calls.
interface ElectronAPI {
  sendMessage: (channel: Channels, ...args: unknown[]) => void;
  on: (channel: Channels, func: (...args: unknown[]) => void) => () => void;
  once: (channel: Channels, func: (...args: unknown[]) => void) => void;
  saveFile: (defaultPath: string, options: SaveDialogOptions) => Promise<string | undefined>;
  writeFile: (filePath: string, content: Buffer | string) => Promise<void>;
}

// Define the API object implementing the interfaces for IPC methods.
const api: ElectronAPI = {
  sendMessage: (channel, ...args) => {
    ipcRenderer.send(channel, ...args); // Sends asynchronous messages via IPC to the main process.
  },
  on: (channel, func) => {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => func(...args);
    ipcRenderer.on(channel, subscription); // Adds a listener for an IPC event from the main process.
    return () => ipcRenderer.removeListener(channel, subscription); // Returns a function to remove the listener.
  },
  once: (channel, func) => {
    ipcRenderer.once(channel, (_event, ...args) => func(...args)); // Adds a one-time listener for an IPC event.
  },
  saveFile: async (defaultPath, options) => {
    const result = await ipcRenderer.invoke('save-dialog', { defaultPath, options }); // Invoke a method in the main process and waits for the result.
    return result.filePath; // Returns the path of the saved file.
  },
  writeFile: async (filePath, content) => {
    await ipcRenderer.invoke('write-file', { filePath, content }); // Invoke a method in the main process to write data to a file.
  },
};

// Use contextBridge to expose the defined API to the renderer process securely.
//contextBridge.exposeInMainWorld('electron', api);
contextBridge.exposeInMainWorld('electron', {
  saveFile: async (defaultPath: string, options: Electron.SaveDialogSyncOptions) => {
    const result = await ipcRenderer.invoke('save-dialog', { defaultPath, options });
    return result.filePath;
  },
  writeFile: async (filePath: string, content: string) => {
    await ipcRenderer.invoke('write-file', { filePath, content });
  },
  ipcRenderer: {
    once: ipcRenderer.once.bind(ipcRenderer),
    sendMessage: ipcRenderer.send.bind(ipcRenderer),
    // Add any other ipcRenderer methods you need to use
  },
});
