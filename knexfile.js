export default {
    development: {
        client: "sqlite3",
        connection: {
            filename: "./mydb.sqlite",
        },
        useNullAsDefault: true,
    },
    test: {
      client: "sqlite3",
      connection: {
          filename: ":memory:",
      },
      useNullAsDefault: true,
      debug: true,
  },
};
