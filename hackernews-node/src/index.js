const { ApolloServer, PubSub } = require("apollo-server");
const fs = require("fs");
const path = require("path");

// PubSub
const pubsub = new PubSub();

// Prisma
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient({ errorFormat: "minimal" });

// Utils
const Query = require("./resolvers/Query");
const Mutation = require("./resolvers/Mutation");
const Subscription = require("./resolvers/Subscription");
const User = require("./resolvers/User");
const Link = require("./resolvers/Link");
const Vote = require("./resolvers/Vote");

const { getUserId } = require("./utils");

const resolvers = {
  Query,
  Mutation,
  Subscription,
  User,
  Link,
  Vote,
};

const server = new ApolloServer({
  typeDefs: fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf8"),
  resolvers,
  context: ({ req }) => {
    return {
      ...req,
      pubsub,
      prisma,
      userId: req?.headers.authorization ? getUserId(req) : null,
    };
  },
  subscriptions: {
    onConnect: (connectionParams) => {
      if (connectionParams.authToken) {
        return {
          prisma,
          userId: getUserId(null, connectionParams.authToken),
        };
      } else {
        return {
          prisma,
        };
      }
    },
  },
});

server.listen().then(({ url }) => console.log(`Server is running on ${url}`));
