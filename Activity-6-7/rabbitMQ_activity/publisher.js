const amqp = require('amqplib');

// Helper function for delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendMsg() {
  const queue = 'hello';

  const conn = await amqp.connect('amqp://localhost');
  const channel = await conn.createChannel();

  await channel.assertQueue(queue, { durable: false });

  for (let i = 1; i <= 100; i++) {
    const msg = `Message #${i}`;
    channel.sendToQueue(queue, Buffer.from(msg));
    console.log(`[x] Sent: ${msg}`);
    await delay(100); // delay of 100ms between each message
  }

  setTimeout(() => {
    conn.close();
    process.exit(0);
  }, 500);
}

sendMsg();
