/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';

export function resolveHtmlPath(htmlFileName: string) {
  // If the application is running in development mode...
  if (process.env.NODE_ENV === 'development') {
    // ...get the port number from the environment variables, or use 1212 as a default
    const port = process.env.PORT || 1212;

    // Create a new URL pointing to the local development server
    const url = new URL(`http://localhost:${port}`);

    // Set the pathname of the URL to the provided HTML file name
    url.pathname = htmlFileName;

    // Return the full URL as a string
    return url.href;
  }

  // If the application is not running in development mode...
  // ...resolve the path to the HTML file in the 'renderer' directory
  // and return it as a file:// URL
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}
