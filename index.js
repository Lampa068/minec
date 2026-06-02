const WebSocket = require('ws');
const mineflayer = require('mineflayer');

const wss = new WebSocket.Server({ port: process.env.PORT || 10000 });

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const msg = JSON.parse(data);
    if (msg.type === 'takeover') {
      console.log('📥 Отримав сесію від ПК. Запускаю бота...');
      
      const bot = mineflayer.createBot({
        host: 'mc.sakeva.fun',
        port: 25565,
        username: msg.username,
        version: '1.21.11'
      });
      
      bot.on('spawn', () => console.log('🤖 БОТ В ГРІ (після капчі)!'));
    }
  });
});