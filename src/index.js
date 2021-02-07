import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { setContext } from "apollo-link-context";

import { getMainDefinition } from "@apollo/client/utilities";
import { WebSocketLink } from "@apollo/client/link/ws";

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      //   switch (extensions.code) {
      //     case "data-exception":
      //     case "validation-failed":
      //       props.history.push("/something-went-wrong"); // redirect to something-went-wrong page
      //       break;
      //     default:
      //       // default case
      //       console.log(extensions.code);
      //   }
    });
  }

  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
    // props.history.push('/network-error') // redirect to network-error route
  }
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("graphql-library-app");
  return {
    headers: {
      ...headers,
      authorization: token ? `bearer ${token}` : null,
    },
  };
});

const httpLink = new HttpLink({
  uri: "http://localhost:4000",
});

//  subscriptions
const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/graphql`,
  options: {
    reconnect: true,
  },
});
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  // authLink.concat(httpLink),
  ApolloLink.from([errorLink, authLink, httpLink])
);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  // link: errorLink.concat(authLink.concat(httpLink))
  // link: ApolloLink.from([ errorLink, authLink, httpLink]),
  link: splitLink,
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);
