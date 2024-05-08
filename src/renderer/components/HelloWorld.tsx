// Import React and necessary hooks from 'react'
import React, { useState, useEffect } from 'react';
// Import axios for making HTTP requests
import axios from 'axios';
// Import saveAs from 'file-saver' for triggering downloads from the browser
import { saveAs } from 'file-saver';

// Define a named function component 'HelloWorld'
function HelloWorld() {
  // useState to manage 'data' state, initially set to null
  const [data, setData] = useState(null);
  // useState to manage 'error' state, initially set to an empty string
  const [error, setError] = useState('');

  // useState to manage 'loading' state, initially set to false
  const [loading, setLoading] = useState(false);

  // useEffect hook to handle side-effects, configured to run only once on component mount
  useEffect(() => {
    // API URL from which to fetch data
    const apiUrl = 'https://jsonplaceholder.typicode.com/todos/1';

    // Make GET request to apiUrl using axios
    axios.get(apiUrl)
      .then(response => {
        // On successful fetch, update 'data' state with the fetched data
        setData(response.data);
      })
      .catch(err => {
        // On error, update 'error' state with the error message
        setError('Error fetching data: ' + err.message);
      });
  }, []); // Dependency array is empty, so this effect runs only once

  // Function to handle downloading the current state data as a JSON file
  const handleDownload = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, 'data.json');
  };

  // Function to handle downloading a text file
  const handleDownloadText = () => {
    var blob = new Blob(["Hello, Faction Four Smart Squad - this file was created."], {
      type: "text/plain;charset=utf-8"
    });
    saveAs(blob, "Hello-FF.txt");
  };

  // Function to test CORS issues with an external API
  const testingCORS = () => {
    fetch('https://via.placeholder.com/150', {
      method: 'GET',
      mode: 'cors',
    })
    .then(response => {
      if (response.ok) {
        return response.text();
      } else {
        throw new Error('Network response was not ok.');
      }
    })
    .then(data => console.log(data))
    .catch(error => console.log('Looks like there was a problem: \n', error));
  };

  // Async function to handle downloading an image file, indicating loading state
  const handleDownloadImage = async () => {
    setLoading(true);
    try {
      const url = 'https://corsproxy.io/?' + encodeURIComponent('https://via.placeholder.com/150');
      const response = await axios.get(url, { responseType: 'blob' });
      saveAs(response.data, 'placeholder.png');
    } catch (err) {
      setError('Error downloading file');
    } finally {
      setLoading(false);
    }
  };


  const handleDownloadTextFile = () => {
    const fileName = 'C:\\Development\\copy-of-electron-react-capacitor\\electron-react-boilerplate\\dummy\\file.txt';

    window.electron.saveFile(fileName, { filters: [{ name: 'Text Files', extensions: ['txt'] }] })
      .then((filePath: any) => {
        if (filePath) {
          window.electron.writeFile(filePath, 'Hello World');
        } else {
          console.log('File save was canceled by the user.');
        }
      })
      .catch((error: any) => {
        console.error('Failed to save file:', error);
      });
  };

  // Return JSX to render the component
  return (
    <div>
      <p>Basic React component!</p>
      <p>Axios .GET</p>
      {data ? <pre>Data: {JSON.stringify(data, null, 2)}</pre> : <p>No data fetched - Sorry Updated</p>}
      {error && <p>{error}</p>}
      {data && <button onClick={handleDownload}>Download JSON File created now- Sorry Updated</button>}<br/>
      {data && <button onClick={handleDownloadText}>Download Text File created now- Sorry Updated</button>}
      <button onClick={handleDownloadImage} disabled={loading}>
        {loading ? 'Downloading...' : 'Download Image'}
      </button>
      {data && <button onClick={testingCORS}>Test CORS</button>}<br/>
      {data && <button onClick={handleDownloadTextFile}>Download Text File to Local</button>}<br/>


    </div>
  );
}

// Export the HelloWorld component as the default export
export default HelloWorld;
