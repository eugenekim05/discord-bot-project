const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mysql = require('mysql2');
require("dotenv").config();

// Keys
const geminiKey = process.env.GEMINI_API_KEY;
const discordToken = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;

// Gemini API
const genAI = new GoogleGenerativeAI(geminiKey);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// MySQL Database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  //password: 'password', just in case I create an account
  database: 'jakebot'
});

db.connect(err => {
  if (err) {
    console.error('Failed to connect to the database:', err.message);
  } else {
    console.log('Connected to the MySQL database.');
  }
});

// Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Slash Commands
const commands = [
  {
    name: 'jake-bot',
    description: 'Activate Jake Bot',
  },
  {
    name: 'stop-jake-bot',
    description: 'Deactivate Jake Bot',
  },
  {
    name: 'history',
    description: 'Retrieve your last 10 conversations with Jake Bot',
  },
];

const rest = new REST({ version: '10' }).setToken(discordToken);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error reloading commands:', error.message);
  }
})();

// Tracking active users
let activeUsers = new Set(); 

client.once('ready', () => {
  console.log('Bot is ready!');
});

// Handling Slash Commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'jake-bot') {
    activeUsers.add(interaction.user.id);
    await interaction.reply('Jake Bot activated! Type your message to get a response.');
  } else if (commandName === 'stop-jake-bot') {
    activeUsers.delete(interaction.user.id);
    await interaction.reply('Jake Bot deactivated! You will no longer receive responses.');
  } else if (commandName === 'history') {
    console.log(`Fetching history for user: ${interaction.user.id}`);
    
    db.query(`SELECT * FROM conversations WHERE userId = ? ORDER BY timestamp DESC LIMIT 10`, [interaction.user.id], (err, rows) => {
      if (err) {
        console.error('Error retrieving history:', err.message);
        interaction.reply('There was an error retrieving your history. Please try again later.');
      } else if (rows.length === 0) {
        console.log('No history found.');
        interaction.reply('No history found.');
      } else {
        const history = rows.map(row => `${row.timestamp}: ${row.userMessage} -> ${row.botResponse}`).join('\n');
        console.log('History fetched successfully:', history);
        interaction.reply(history);
      }
    });
  }
});

// Handle Messages
client.on('messageCreate', async message => {
  if (message.author.bot) return; // Ignore bot messages

  let response;

  if (activeUsers.has(message.author.id)) {
    // Personalized message handling for bot identity
    if (/who are you/i.test(message.content)) {
      response = "I am Jake Bot!";
    } else if (/what is your name/i.test(message.content)) {
      response = "My name is Jake Bot.";
    } else if (/what is your function|what do you do/i.test(message.content)) {
      response = "I am your personal AI companion, and I try to answer questions to the best of my ability.";
    } else {
      // General questions
      try {
        response = (await model.generateContent(message.content))
          .response
          .text()
          .substring(0, 1999); // cutting the message after 2000 characters
      } catch (error) {
        console.error('Error generating response:', error.message);
        response = 'There was an error processing your request.';
      }
    }

    // Storing the convo to database
    db.query(`INSERT INTO conversations (userId, userMessage, botResponse) VALUES (?, ?, ?)`, 
      [message.author.id, message.content, response], 
      (err) => {
        if (err) {
          console.error('Error storing conversation:', err.message);
        } else {
          console.log('Conversation stored successfully.');
        }
    });

    await message.reply(response);
  }
});

// Ensuring the bot shuts down fully
process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  client.destroy().then(() => process.exit(0));
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  client.destroy().then(() => process.exit(0));
});

// Authenticating Discord
client.login(discordToken);
