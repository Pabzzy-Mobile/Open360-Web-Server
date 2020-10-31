let sendMessage = function () {
    let message = document.querySelector(".message-box input").value;
    if (message === "") return;
    message = message.trim();
    socket.emit("chat-message", { message: message });
    document.querySelector(".message-box input").value = "";
};

let createLogElement = function (text) {
    let messageDiv = document.createElement("div");
    messageDiv.classList.add("log-message");
    let message = document.createElement("p");
    message.innerText = text;
    messageDiv.append(message);
    document.querySelector(".chat .messages").append(messageDiv);
}

let createMessageElement = function (text, user) {
    let messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-message");
    let from = document.createElement("h3");
    from.innerText = user;
    from.classList.add("chat-message-user");
    messageDiv.append(from);
    let message = document.createElement("p");
    message.innerText = text;
    message.classList.add("chat-message-text");
    messageDiv.append(message);
    document.querySelector(".chat .messages").append(messageDiv);
}