// Import the createRoot function from the 'react-dom/client' package, which is used for rendering React applications.
import { createRoot } from 'react-dom/client';

// Import the App component from the local 'App' module, which is the root component of your React application.
import App from './App';

// Retrieve the 'root' DOM element from the document where the React app will be mounted.
const container = document.getElementById('root') as HTMLElement;

// Initialize the root of your React application using the container retrieved above.
const root = createRoot(container);

// Render the App component inside the root container of your React application.
root.render(<App />);

// Add an event listener that executes when the DOM content is fully loaded.
document.addEventListener('DOMContentLoaded', () => {
  // Set up a one-time IPC listener for 'ipc-example' channel to receive messages from the Electron main process.
  window.electron.ipcRenderer.once('ipc-example', (arg: string | number) => {
    // Log the argument received from the IPC message to the console.
    // eslint-disable-next-line no-console
    console.log(arg);
  });

  // Send an IPC message on the 'ipc-example' channel to the Electron main process with 'ping' as the argument.
  window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
});
