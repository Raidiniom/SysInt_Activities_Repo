import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { PubSub } from 'graphql-subscriptions';
import cors from 'cors';
import bodyParser from 'body-parser';
import amqp from 'amqplib';

const prisma = new PrismaClient();
const pubsub = new PubSub();

const queue = 'hello';
let channel;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


const typeDefs = `#graphql
  type Post {
    id: ID!
    title: String!
    content: String!
  }

  type Query {
    posts: [Post!]!
    post(id: ID!): Post
  }

  type Mutation {
    createPost(title: String!, content: String!): Post!
    updatePost(id: ID!, title: String!, content: String!): Post!
    deletePost(id: ID!): Post!
  }

  type Subscription {
    postCreated: Post!
    postUpdated: Post!
  }
`;

const resolvers = {
  Query: {
    posts: async () => await prisma.post.findMany(),
    post: async (_, { id }) => await prisma.post.findUnique({ where: { id: Number(id) } }),
  },

  Mutation: {
    createPost: async (_, { title, content }) => {
      const post = await prisma.post.create({ data: { title, content } });

      pubsub.publish('POST_CREATED', { postCreated: post });

      if (channel) {
        const msg = JSON.stringify(post);
        channel.sendToQueue(queue, Buffer.from(msg));

        console.log('Message has been publish');
      } else {
        console.warn('Channel not available')
      }

      return post;
    },
    
    updatePost:async(_, {id, title, content}) => {
      const post = await prisma.post.update({where: {id:Number(id)}, data: {title, content}})
      
      pubsub.publish('POST_UPDATED', { postUpdated: post });
      return post
    },
    deletePost:(_, {id}) => {
      const post = prisma.post.delete({where: {id:Number(id)}})
      return post
    },
  },

  Subscription: {
    postCreated: {
      subscribe: () => pubsub.asyncIterableIterator(['POST_CREATED'])
    },
    postUpdated: {
      subscribe: () => pubsub.asyncIterableIterator(['POST_UPDATED'])
    }
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(bodyParser.json());

const httpServer = createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql'  
});

const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
  schema,
  plugins: [
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

await server.start();

app.use('/graphql', expressMiddleware(server));

httpServer.listen(4002, () => {
  console.log(`🚀 Server ready at http://localhost:4002/graphql`);
  console.log(`🚀 Subscriptions running at ws://localhost:4002/graphql`);
});

async function rabbitMQSetup() {
  const conn = await amqp.connect('amqp://localhost');
  channel = await conn.createChannel();

  await channel.assertQueue(queue, { durable: false});

  console.log('[x] Channel is ready to publish!')

  autoCreatePosts();
}

rabbitMQSetup();

async function autoCreatePosts() {
  let counter = 1;
  while (true) {
    const title = `Auto Post #${counter}`;
    const content = `This is auto-generated post #${counter}`;

    const post = await prisma.post.create({ data: { title, content } });

    pubsub.publish('POST_CREATED', { postCreated: post });

    if (channel) {
      const msg = JSON.stringify(post);
      channel.sendToQueue(queue, Buffer.from(msg));
      console.log(`[Auto] Sent to queue: ${msg}`);
    }

    counter++;
    await delay(1000); // ⏱ 1 second delay between posts
  }
}
