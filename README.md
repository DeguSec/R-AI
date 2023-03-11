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

### Secrets
You need your own Discord bot token, so make a test bot for your account: https://discord.com/developers/applications.

Create a .env file in the root dir of the project
Eaxmple .env file
```
TOKEN=Disocrd bot token goes here
API_KEY=OpenAI api key goes here
```

### Running the bot
Run the bot:
```bash
yarn start
```

If you're using VSCode, I wrote a debug utility within the `.vscode` folder. You can run the debugger with `F5`. You can stop the debugger with `Shift+F5`. You can restart the debugger with `Ctrl+Shift+F5`. 
