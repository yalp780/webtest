// Import the routing components from react-router-dom to handle in-app routing.
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';

// Import axios for making HTTP requests, isCancel to check if an HTTP request was cancelled,
// and AxiosError to handle specific errors thrown by axios.
import axios, {isCancel, AxiosError} from 'axios';

// Import the HelloWorld component from the relative path where it is defined.
import HelloWorld from './components/HelloWorld';

// Import an icon image from a relative path to be used in the UI.
import icon from '../../assets/icon.svg';

// Import CSS styles specific to this App component from a relative path.
import './App.css';

// Define a functional component named Hello that renders a specific part of the UI.
function Hello() {
  return (
    // Return a JSX element consisting of a div that wraps other elements.
    <div>
      <div className="Hello">
        <img width="200" alt="icon" src={icon} />
      </div>
      <HelloWorld />
    </div>
  );
}

// Export a default function component named App.
export default function App() {
  return (
    // Use Router to handle the routing within the application using a memory-based router.
    // Route definition for the root path "/" to render the Hello component when visited.
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
