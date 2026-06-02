const WebSocket = require('ws');
const mc = require('minecraft-protocol');
const mineflayer = require('mineflayer');

console.clear();
console.log('=== СТАРТ ХМАРНОГО PROXY НА RENDER ===');

const TARGET_HOST = 'mc.sakeva.fun';
const TARGET_PORT = 25565;
const PORT = process.env.PORT || 10000;

// Створюємо веб-сокет сервер, який Render безкоштовно пропустить назовні
const wss = new WebSocket.Server({ port: PORT });
console.log(`Хмарний сервер чекає на з'єднання через порт ${PORT}...`);

wss.on('connection', (ws) => {
  console.log('[Хмара] ПК успішно підключився до хмаринки!');

  // Створюємо віртуальний клієнт до Minecraft сервера
  const targetClient = mc.createClient({
    host: TARGET_HOST,
    port: TARGET_PORT,
    username: 'Lampa752',
    auth: 'offline',
    version: '1.21.11'
  });

  // Перенаправлення пакетів хмара -> сервер і назад
  ws.on('message', (message) => {
    const { name, data } = JSON.parse(message);
    if (targetClient.state) targetClient.write(name, data);
  });

  targetClient.on('packet', (data, meta) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ name: meta.name, data }));
    }
  });

  ws.on('close', () => {
    console.log('\n[УСПІХ] Ти вимкнув ПК! Передаю сесію боту Mineflayer в хмарі...');

    const bot = mineflayer.createBot({
      client: targetClient,
      username: 'Lampa752'
    });

    bot.on('spawn', () => {
      console.log('🤖 БОТ УСПІШНО ЗАФІКСОВАНИЙ НА СЕРВЕРІ! Комп’ютер можна вимикати.');
    });

    bot.on('message', (message) => console.log(`[Чат]: ${message.toAnsi()}`));
    bot.on('error', (err) => console.log('❌ Помилка:', err.message));
    bot.on('kicked', (reason) => console.log('❌ Кік:', reason));
  });
});