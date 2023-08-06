# R-chan
Cool bots running on OpenAI

### Install
Firstly, install NPM and Node-16 LTS. Install Yarn using:
```bash
npm install -g yarn
```

Now install the dependencies:
```bash
yarn install
```

You also need a Mongo DB server: https://www.mongodb.com/

You also need to install `curl` if it is not in your `$PATH`. If you're on Linux, you most certantly have `curl`. If you're using Windows 10 1803 or later, you already have `curl`. The easiest way to install `curl` is through downloading Git for Windows: https://git-scm.com/

### Secrets
You need: 
  - your own Discord bot token, so make a test bot for your account: https://discord.com/developers/applications.
  - your own OpenAI API key which you can get from here: https://platform.openai.com/account/api-keys.
  - to add your Mongo DB connection string to the env file: https://www.mongodb.com/docs/manual/reference/connection-string/
  - a database name (rchan is good enough if you don't know what to name it)
  - Azure AI token. You can get it with this tutorial (check prerequisites): https://learn.microsoft.com/en-us/azure/ai-services/speech-service/get-started-text-to-speech

Create a .env file in the root dir of the project
Example .env file:
```
TOKEN=Discord bot token goes here
API_KEY=OpenAI api key goes here
DB_CONNECTION_STRING=MongoDB connection string here
DB_NAME=rchan
SPEECH_KEY=Azure resource token goes here
SPEECH_REGION=uksouth or other
```

### Running the bot
Run the bot:
```bash
yarn start
```

If you're using VSCode, I wrote a debug utility within the `.vscode` folder. You can run the debugger with `F5`. You can stop the debugger with `Shift+F5`. You can restart the debugger with `Ctrl+Shift+F5`. 
