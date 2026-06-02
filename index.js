const mc = require('minecraft-protocol');
const mineflayer = require('mineflayer');

console.clear();
console.log('=== СТАРТ МЕГА-PROX`Y НА ХМАРІ ===');

const TARGET_HOST = 'mc.sakeva.fun';
const TARGET_PORT = 25565;
// Хмаринка Render дає свій порт у змінній process.env.PORT, або використовуємо 10000 за замовчуванням
const PROXY_PORT = process.env.PORT || 10000; 
const NICKNAME = 'Lampa752';

const localServer = mc.createServer({
  'online-mode': false, 
  port: PROXY_PORT,
  keepAlive: false
});

console.log(`Проксі запущено в хмарі на порту ${PROXY_PORT}! Очікування підключення з ніком ${NICKNAME}...`);

localServer.on('login', (client) => {
  console.log(`[Хмара] Отримано підключення від клієнта: ${client.username}`);
  console.log(`[Хмара] Версія протоколу гравця: ${client.version}`);
  
  const targetClient = mc.createClient({
    host: TARGET_HOST,
    port: TARGET_PORT,
    username: client.username,
    auth: 'offline',
    version: client.version
  });

  client.on('packet', (data, meta) => {
    if (targetClient.state === meta.state) {
      targetClient.write(meta.name, data);
    }
  });

  targetClient.on('packet', (data, meta) => {
    if (client.state === meta.state) {
      client.write(meta.name, data);
    }
  });

  client.on('end', () => {
    console.log('\n[УСПІХ] Ти вийшов з гри на ПК. Передаю керування боту Mineflayer в хмарі...');

    const bot = mineflayer.createBot({
      client: targetClient, 
      username: client.username
    });

    bot.on('spawn', () => {
      console.log('🤖 БОТ УСПІШНО ЗАФІКСОВАНИЙ НА СЕРВЕРІ СУПЕР-ХМАРОЮ!');
    });

    bot.on('message', (message) => {
      console.log(`[Чат бота]: ${message.toAnsi()}`);
    });

    bot.on('error', (err) => console.log('❌ Помилка бота:', err.message));
    bot.on('kicked', (reason) => console.log('❌ Бота кікнуло:', reason));
  });
});