// send.js
const amqp = require('amqplib');

async function sendMsg() {
  const queue = 'hello';

  const conn = await amqp.connect('amqp://localhost');
  const channel = await conn.createChannel();

  await channel.assertQueue(queue, { durable: false });
  
  for (let i = 1; i <= 10; i++) {
    const msg = `Message #${i}`;
    channel.sendToQueue(queue, Buffer.from(msg));
    console.log(`[x] Sent: ${msg}`);
  }

  setTimeout(() => {
    conn.close();
    process.exit(0);
  }, 500);
}

sendMsg();
