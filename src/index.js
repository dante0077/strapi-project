"use strict";

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    let { Server } = require("socket.io");
    let { main} = require("./messages/main");

    let io = new Server(strapi.server.httpServer, {
      path: "/message",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["Accept", "Content-Type", "Authorization"],
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log("New connection", socket.id);
      main(socket);
    });

    io.on("disconnect", (socket) => {
      console.log("connection has been disconnected");
      socket.disconnect();
    });
    strapi.io = io;
  },
};
