# Jake Bot - Personal Discord Chatbot Assistant

Jake Bot is an AI-driven Discord bot that interacts with users to provide intelligent conversation and store conversation history. It integrates with Google Gemini AI to generate responses to user messages and MySQL to track conversations. Users can summon or deactivate Jake Bot through slash commands, and retrieve conversation history at any time.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Commands](#commands)
- [Database](#database)
- [APIs Used](#apis-used)
- [Contributing](#contributing)
- [License](#license)

## Features
- Integrates Google Gemini AI for smart conversations.
- MySQL-based conversation tracking and retrieval.
- Slash commands for activating and deactivating the bot.
- Retrieves past user conversations.
  
## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/eugenekim05/discord-bot-project.git
    ```
2. Navigate to the project directory:
    ```bash
    cd jake-bot
    ```
3. Install dependencies:
    ```bash
    npm install
    ```
4. Set up the `.env` file with your API keys and database details:
    ```env
    GEMINI_API_KEY=your-gemini-api-key
    DISCORD_TOKEN=your-discord-bot-token
    CLIENT_ID=your-discord-client-id
    ```
5. Set up MySQL:
   - Create a database named `jakebot` and a table called `conversations`:
    ```sql
    CREATE DATABASE jakebot;
    USE jakebot;
    
    CREATE TABLE conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(255) NOT NULL,
        userMessage TEXT NOT NULL,
        botResponse TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```

## Usage

1. Run the bot:
    ```bash
    node discordbotmain.js
    ```
2. Interact with Jake Bot using slash commands or by sending messages.

## Commands

- `/jake-bot`: Activates Jake Bot. You can start interacting by typing your questions.
- `/stop-jake-bot`: Deactivates Jake Bot, preventing further responses.
- `/history`: Retrieves your last 10 conversations with Jake Bot.

## Database

- Jake Bot uses MySQL to store and retrieve conversation history. The conversations are stored in a table with the structure:
    - `userId`: The Discord user ID.
    - `userMessage`: The message sent by the user.
    - `botResponse`: The bot’s generated response.
    - `timestamp`: The time when the conversation took place.

## APIs Used

- [Google Gemini AI](https://developers.google.com/gemini) - For generating responses based on user messages.

## Contributing

Pull requests are welcome. For major changes, please open an issue to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
