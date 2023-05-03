## Installation

1. Clone the repository or download the zip file.
2. Run `npm install` to install dependencies.

## Usage

1. Create a `config.js` file in the root directory of the extension.
2. Add your API token to the `config.js` file. This file is not included in the GitHub repository to keep the token private.
3. In the `config.js` include the following with your API Token:

 ``export const OPENAI_TOKEN = "your_API_token"``

## Load the extension in Google Chrome by following these steps:

    1. Open the Google Chrome browser.
    2. Click the three dots in the top-right corner of the browser window.
    3. Select "More Tools" > "Extensions".
    4. Enable "Developer Mode" in the top-right corner of the window.
    5. Click "Load unpacked" and select the folder that contains your extension
