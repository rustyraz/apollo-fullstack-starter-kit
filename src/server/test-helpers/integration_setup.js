import chai from 'chai';
import chaiHttp from 'chai-http';
import WebSocket from 'ws';
import { createNetworkInterface, ApolloClient } from 'apollo-client';
import subscriptions from 'subscriptions-transport-ws';

import '../../../knexfile';
import knex from '../sql/connector';
import { app as settings } from '../../../package.json';
import { addApolloLogging } from '../../common/apollo_logger';

chai.use(chaiHttp);
chai.should();

var server;
var apollo;

before(async () => {
  await knex.migrate.latest();
  await knex.seed.run();

  server = require('../api_server').default;
  const wsClient = new subscriptions.SubscriptionClient(`ws://localhost:${process.env['PORT']}`, {}, WebSocket);

  const networkInterface = subscriptions.addGraphQLSubscriptions(
    createNetworkInterface({ uri: `http://localhost:${process.env['PORT']}/graphql` }),
    wsClient
  );

  apollo = new ApolloClient({
    networkInterface: settings.apolloLogging ? addApolloLogging(networkInterface) : networkInterface
  });
});

after(() => {
  if (server) {
    server.close();
  }
});

export const getServer = () => server;
export const getApollo = () => apollo;
