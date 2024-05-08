const welcome = (socket) => {
  socket.emit("welcome", `Welcome to the chat!\nPlease enter your email:`);
  socket.on("email", async (email) => {
    let user = null;
    try {
      user = await strapi
        .query("api::message.message")
        .findOne({ where: { email: email } });
      // checking to see if the user exists already based on email.
      socket.user = user;
    } catch (err) {
      console.log("EERR", err.message);
      //consoling the error but not emiting as the error is expected if some cases
      //   socket.emit("error", err.message);
    }
    if (user == null) {
      try {
        const res = await strapi.entityService.create("api::message.message", {
          data: {
            email: email,
            connection: socket.id,
            isActive: true,
            isArchieved: false,
          },
        });
        //creating a user as the user does not exist.
        socket.user = res;
      } catch (err) {
        console.log(err.message); //emiting the error as this is a non expected error
        socket.emit("error", err.message);
      }
    }
  });
};

const messages = (socket) => {
  socket.on("message", async (message) => {
    socket.emit("message", message); //emiting back the message
    try {
      const date = new Date();
      const user = await strapi
        .query("api::message.message")
        .findOne({ where: { id: socket.user.id } });

        let previousMessage = user.messages == null ? { messages: [] } : user;
      // checking for previous messages
      const res = await strapi.entityService.update(
        "api::message.message",
        socket?.user?.id,
        {
          data: {
            messages: [
              ...previousMessage.messages,
              { date: date.toString(), message: message },
            ],
          },
        }
      );
      console.log("messages:", { date: date.toString(), message: message });
      socket.id = res.id;
    } catch (err) {
      console.log(err.message);
      socket.emit("error", err.message);
    }
  });

  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  socket.on("destroy", async (io) => {
    try {
      socket.emit("destroy", "destroyed");
    //   emiting "destroy" so the FE can reload the page.
      console.log("connection has been disconnected:", socket.id);
      socket.disconnect();
    } catch (err) {
      console.log(err);
    }
  });
};

const main = async (socket) => {
  welcome(socket); //create or stores the user in socket
  messages(socket);
};

module.exports = { welcome, messages, main };
