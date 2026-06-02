const WebSocket = require('ws');
const mc = require('minecraft-protocol');
const mineflayer = require('mineflayer');

console.clear();
console.log('=== СТАРТ ХМАРНОГО PROXY НА RENDER ===');

const TARGET_HOST = 'mc.sakeva.fun';
const TARGET_PORT = 25565;
const PORT = process.env.PORT || 10000;

const wss = new WebSocket.Server({ port: PORT });
console.log(`Хмарний server чекає на з'єднання через порт ${PORT}...`);

wss.on('connection', (ws) => {
  console.log('[Хмара] ПК підключився до хмаринки!');

  const targetClient = mc.createClient({
    host: TARGET_HOST,
    port: TARGET_PORT,
    username: 'Lampa752',
    auth: 'offline',
    version: '1.21.11'
  });

  // Приймаємо бінарні пакети від ПК і шлемо на Сакеву
  ws.on('message', (msg) => {
    if (targetClient.state) {
      targetClient.writeRaw(msg);
    }
  });

  // Перехоплюємо сирі пакети від Сакеви і шлемо на ПК
  targetClient.on('raw', (buffer) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(buffer);
    }
  });

  ws.on('close', () => {
    console.log('\n[УСПІХ] Ти вийшов з гри на ПК. Передаю керування боту Mineflayer...');

    const bot = mineflayer.createBot({
      client: targetClient,
      username: 'Lampa752'
    });

    bot.on('spawn', () => {
      console.log('🤖 БОТ УСПІШНО ЗАФІКСОВАНИЙ НА СЕРВЕРІ СУПЕР-ХМАРОЮ!');
    });

    bot.on('message', (message) => console.log(`[Чат бота]: ${message.toAnsi()}`));
    bot.on('error', (err) => console.log('❌ Помилка бота:', err.message));
    bot.on('kicked', (reason) => console.log('❌ Бота кікнуло:', reason));
  });
});