# Allied MCP Servers

These are internal tools that connect Claude Desktop to your business systems — letting Claude read and interact with ConnectWise Manage, ConnectWise Sell, and Hudu directly from conversation.

## What's in here

| Folder | What it connects to |
|--------|---------------------|
| `connectwise-manage/` | ConnectWise Manage (PSA) — tickets, companies, time entries, projects |
| `connectwise-sell/` | ConnectWise Sell (Quosal) — quotes, line items, customers |
| `hudu/` | Hudu Documentation — assets, articles, passwords, companies |

---

## Before You Start

You'll need two things installed on your machine:

### 1. Node.js
This is the runtime that the MCP servers use to execute. Download and install it from:
**https://nodejs.org** — grab the **LTS** version (the left button).

To verify it's installed, open a Command Prompt and run:
```
node --version
```
You should see something like `v20.11.0`. If you get an error, Node isn't installed yet.

### 2. Claude Desktop
Download from **https://claude.ai/download** and sign in with your account.

---

## Setup Instructions

### Step 1 — Download this repo

Click the green **Code** button at the top of this page → **Download ZIP**.

Extract the ZIP somewhere permanent — a good location is:
```
C:\Users\YourName\AppData\Local\Programs\AlliedMCP\
```

> **Tip:** You can get to AppData by typing `%appdata%` in File Explorer's address bar, then navigating up one folder to `AppData`, then into `Local\Programs`.
>
> ---
>
> ### Step 2 — Install dependencies for each server
>
> Each server folder needs its dependencies installed once. Open **Command Prompt** and run these one at a time:
>
> ```
> cd "C:\Users\YourName\AppData\Local\Programs\AlliedMCP\connectwise-manage"
> npm install
> ```
>
> ```
> cd "C:\Users\YourName\AppData\Local\Programs\AlliedMCP\connectwise-sell"
> npm install
> ```
>
> ```
> cd "C:\Users\YourName\AppData\Local\Programs\AlliedMCP\hudu"
> npm install
> ```
>
> > **What is npm install?** npm is the package manager that comes with Node.js. Running `npm install` downloads the small set of code libraries each server depends on. It only needs to be done once per machine (or after a fresh download).
> >
> > After running `npm install` in each folder, you should see a `node_modules` folder appear inside it. That's normal — it's the downloaded libraries.
> >
> > ---
> >
> > ### Step 3 — Configure Claude Desktop
> >
> > Claude Desktop needs to know where each server lives and what credentials to use. This is done through a config file.
> >
> > **Open the config file:**
> > 1. Press `Win + R`, type `%appdata%\Claude`, and hit Enter
> > 2. 2. Open `claude_desktop_config.json` in Notepad (or any text editor)
> >   
> >    3. **Replace the contents** with the block below, updating the file paths to match where you extracted the repo, and filling in the credentials:
> >   
> >    4. ```json
> >       {
> >         "mcpServers": {
> >           "connectwise": {
> >             "command": "C:\\Program Files\\nodejs\\node.exe",
> >             "args": [
> >               "C:\\Users\\YourName\\AppData\\Local\\Programs\\AlliedMCP\\connectwise-manage\\dist\\index.js"
> >             ],
> >             "env": {
> >               "CW_COMPANY_ID": "your_company_id",
> >               "CW_PUBLIC_KEY": "your_public_key",
> >               "CW_PRIVATE_KEY": "your_private_key",
> >               "CW_CLIENT_ID": "your_client_id",
> >               "CW_SITE_URL": "your.connectwise.site"
> >             }
> >           },
> >           "connectwise-sell": {
> >             "command": "C:\\Program Files\\nodejs\\node.exe",
> >             "args": [
> >               "C:\\Users\\YourName\\AppData\\Local\\Programs\\AlliedMCP\\connectwise-sell\\src\\index.js"
> >             ],
> >             "env": {
> >               "CW_SELL_ACCESS_KEY": "your_access_key",
> >               "CW_SELL_USERNAME": "your_username",
> >               "CW_SELL_PASSWORD": "your_password"
> >             }
> >           },
> >           "hudu": {
> >             "command": "C:\\Program Files\\nodejs\\node.exe",
> >             "args": [
> >               "C:\\Users\\YourName\\AppData\\Local\\Programs\\AlliedMCP\\hudu\\stdio.js"
> >             ],
> >             "env": {
> >               "HUDU_API_KEY": "your_api_key",
> >               "HUDU_BASE_URL": "https://your-instance.huducloud.com/api/v1"
> >             }
> >           }
> >         }
> >       }
> >       ```
> >
> > > **Note:** Windows file paths in this config file require double backslashes `\\`. Don't use single backslashes or forward slashes.
> > >
> > > **Save the file and restart Claude Desktop.**
> > >
> > > ---
> > >
> > > ### Step 4 — Verify it's working
> > >
> > > Open Claude Desktop and start a new conversation. Try asking:
> > >
> > > - *"List my open service tickets in ConnectWise"*
> > > - - *"Show me the most recent quotes in ConnectWise Sell"*
> > >   - - *"Look up the company Acme Corp in Hudu"*
> > >    
> > >     - If a server isn't connecting, Claude will usually tell you. See the Troubleshooting section below.
> > >    
> > >     - ---
> > >
> > > ## Getting API Credentials
> > >
> > > ### ConnectWise Manage
> > > 1. Log into ConnectWise Manage
> > > 2. 2. Go to **System → Members**, open your member record
> > >    3. 3. Click the **API Keys** tab → **New API Key**
> > >       4. 4. Copy the **Public Key** and **Private Key** — the private key is only shown once
> > >          5. 5. The Client ID is obtained from the [ConnectWise Developer Network](https://developer.connectwise.com)
> > >            
> > >             6. ### ConnectWise Sell
> > >             7. 1. Log into ConnectWise Sell
> > >                2. 2. Look at the URL — the access key is visible in the address bar
> > >                   3. 3. Your username and password are your normal Sell login credentials
> > >                     
> > >                      4. ### Hudu
> > >                      5. 1. Log into Hudu
> > >                         2. 2. Go to **Admin → API Keys**
> > >                            3. 3. Create a new key and copy it
> > >                              
> > >                               4. ---
> > >                              
> > >                               5. ## Troubleshooting
> > >                              
> > >                               6. **Claude says it can't find the server / tools aren't showing up**
> > > - Make sure you ran `npm install` in each server folder
> > > - - Double-check the file paths in the config — one wrong character breaks it
> > >   - - Restart Claude Desktop after any config changes
> > >    
> > >     - **"Cannot find module" error**
> > >     - - You likely need to run `npm install` in that server's folder
> > >      
> > >       - **Path issues on your machine**
> > >       - - Replace `YourName` in all paths with your actual Windows username
> > >         - - You can find your username by opening Command Prompt and running `whoami`
