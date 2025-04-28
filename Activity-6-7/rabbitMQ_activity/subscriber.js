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

      console.log(`===============\nPost ID: ${receive_post.id}\nPost Title: ${receive_post.title}\nPost Content: ${receive_post.content}`);
    } catch (error) {
      console.log(`[x] Message Failed: ${msg.content.toString()}`);
    }
  }, { noAck: true });
}

receiveMsg();
