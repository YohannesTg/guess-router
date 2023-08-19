const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = '6490722237:AAGJnP02P_WrJAHTPa_7ChO2dcB-NvrD4oo';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Matches "/echo [whatever]"

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome to my bot!');
});

bot.on('inline_query', (query) => {
  const queryId = query.id;
  const queryText = query.query;

  // Process the inline query and generate results

  // Create an array of InlineQueryResult objects
  const results = [
    {
      type: 'article',
      id: '1',
      title: 'Result 1',
      input_message_content: {
        message_text: queryText
      }
    },
    {
      type: 'article',
      id: '2',
      title: 'Result 2',
      input_message_content: {
        message_text: 'This is result 2'
      }
    }
  ];
  bot.answerInlineQuery(queryId, results);
});

 
   
