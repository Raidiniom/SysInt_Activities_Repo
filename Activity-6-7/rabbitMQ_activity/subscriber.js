// receive.js
const amqp = require('amqplib');

async function receiveMsg() {
  const queue = 'hello';

  const conn = await amqp.connect('amqp://localhost');
  const channel = await conn.createChannel();

  await channel.assertQueue(queue, { durable: false });
  console.log(`[x] Waiting for messages in "${queue}". Press CTRL+C to exit.`);

  channel.consume(queue, (msg) => {
    try {
      const receive_post = JSON.parse(msg.content.toString());

      console.log(`${receive_post.id}\n${receive_post.title}\n${receive_post.content}`);
    } catch (error) {
      console.log(`[x] Message Failed: ${msg.content.toString()}`);
    }
  }, { noAck: true });
}

receiveMsg();
