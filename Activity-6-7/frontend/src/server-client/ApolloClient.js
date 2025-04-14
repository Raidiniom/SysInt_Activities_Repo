import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

const wsUrl = "ws://localhost:4002/graphql"
const wsLink = new GraphQLWsLink (
    createClient({
        url: wsUrl,
        onNonLazyError: (err) => console.error("WebSocket Error:", err),
        on: {
            opened: () => console.log("WebSocket connected! ✅"),
            closed: () => console.log("WebSocket disconnected! ❌"),
            message: (msg) => console.log("Message received:", msg),
        },
    }),
);  

const httpLink = new HttpLink({
    uri: 'http://localhost:4002/graphql' 
});

const splitLink = split(
    ({query}) => {
        const def = getMainDefinition(query);
        return (
            def.kind === 'OperationDefinition' &&
            def.operation === 'subscription'
        );
    },
    wsLink,
    httpLink
);
const client = new ApolloClient({
    link: splitLink,
    cache : new InMemoryCache(),
});

export default client;
