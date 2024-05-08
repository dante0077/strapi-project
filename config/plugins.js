module.exports = ({ env }) => ({
  io: {
    enabled: true,
    config: {
      contentTypes: [],
      events: [
        {
          name: "connection",
          handler({ strapi }, socket) {
            // will log whenever a socket connects
            strapi.log.info(`[io] new connection with id ${socket.id}`);
          },
        },
        {
          name: "disconnect",
          handler({ strapi }, socket) {
            strapi.log.info(`[io] socket disconnected: ${socket.id}`);
          },
        },
      ],
    },
  },
});
