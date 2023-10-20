# SimpliMed

## Project Description

**SimpliMed** is a Chrome browser extension powered by the GPT-4 model. It's designed to streamline the reading of academic articles on the PubMed domain. The extension is a popup window and doesnt change the DOM elements of the page. SimpliMed simplifies article abstracts into two distinct versions: elementary and advanced. The elementary version provides a simplified summary of the content, while the advanced version offers a more detailed overview. When you open the extension for the first time, you need to login with a username (any username will work). you'll find a "Get Abstract" button in the header, that allows you to send the current page's data to the server for processing. This step might take a while to retreive the results from the gpt-model and show to you.

## Installation Guide

To use SimpliMed, follow these installation steps:

1. **Download the Project:**

   - Download the entire project and unzip it.

2. **Server-Side Setup:**

   - Navigate to the server-side folder and install the required dependencies using npm:
     ```
     npm install
     ```

3. **Create a .env File:**

   - In the Server-Side folder, create a `.env` file.
   - Add your OpenAI API token to this file as follows:
     ```
     OPENAI_TOKEN = 'YOUR_API_TOKEN'
     ```

4. **Client-Side Configuration:**

   - In the Client-Side folder, open the "back.js" file.
   - If you're running the project locally, change the server address (from 86.50.229.149:8080) to localhost (localhost:8080) throughout the file.
   - If you're running the project on another server, adjust the server address accordingly.

5. **Set Up MongoDB:**

   - You'll need a MongoDB database to store data.
   - Create a database named "abstracts" with 4 collections for "abstracts," "users," "interactions," and "feedbacks."

6. **Start the Server:**
   - To run the server, use the following command in the Server-Side folder:
     ```
     npm run start
     ```
7. **instal the plugin extension on chrome:**

   - Go to chrome
   - Open the setting
   - from left menu open extensions
   - enable developers mode (top right)
   - click on "load unpacked"
   - find the folder that contains the extension files (Client-Side) and click open
   - The extension should have been added to your chrome.

8. **Important Note:**
   - If the plugin isn't working correctly, access the "studyStatus.json" file.
   - Update the dates to reflect the current date and the following days for each phrase.

That's it! The SimpliMed extension should now be up and running.

##Some Technical Features

1. The front end is vanila javacsript and the backend is express.js/node.js. MongoDB is used for the database.
2. You can login with any username, it will be saved in the db. no signing in is required.
3. Each time a user login a token will be created and saved in the chrome local storage. This user token will be saved in the browser for 10days(?). It is required for using the API's. if the plugin doesnt work, logout and login again.
4. Make sure to always keep the "studyStatus.json" file up to date
5. The "back.js" file will run in the background, even if the popup window is closed. (It stores a state object, important for the user study)
6. The "front.js" file is responsible for everything that happens on the popup window.

7. Back and Front javascript files communicated with each other through a port and they send messages and objects to each other when some events happen.

8. Prompts can be found in "abstract.controller.js" file. When the "Get Abstract" button is clicked, the page title and abstract will be sent to the gpt-model with these prompts. 3 different prompts are used here.
