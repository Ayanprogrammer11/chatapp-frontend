"use strict";

let username = prompt("Enter your username: ");
if (username) {
  var socket = new WebSocket("wss://chatapp-backend-ayanliaqat.koyeb.app/");
  main();
}

const validateMessage = function(message) {
  if(message.trim().split(' ').length > 2000) return false;
  if(message.length > 5000) return false;
  return true;
}

function displayMessage(message, sender) {
  // TODO: Implement user-side message
  if(!validateMessage(message)) return;
  const messageContainer = document.querySelector(".chat-messages");
  const messageEl = document.createElement("div");
  const deleteButton = document.createElement("button");
  const user = username.toLowerCase();

  messageEl.innerHTML = `<p><span>${sender}:</span> ${message}</p>`;
  messageEl.classList.add("message");

  if (sender.toLowerCase() === user) {
    messageEl.classList.add("user-message");
  } else {
    messageEl.classList.add("other-message");
  }

  deleteButton.innerText = "Delete";
  deleteButton.classList.add("delete-button");
  deleteButton.onclick = () => {
    messageEl.remove();
  };

  // Remove placeholder
  if (document.querySelector(".no-message"))
    document.querySelector(".no-message").remove();

  messageEl.appendChild(deleteButton);
  messageContainer.appendChild(messageEl);
}

function sendMessage(e) {
  e.preventDefault();
  const chatInput = document.getElementById("message-input");
  const message = JSON.stringify({ text: chatInput.value });
  socket.send(message);
  chatInput.value = "";
}

document.getElementsByTagName("form")[0].addEventListener("submit", sendMessage);

function displayToast(data, event) {
  const toastContainer = document.querySelector(".toast-container");
  const toastMessage = document.createElement("p");
  toastMessage.innerText = `${data.username} ${
    event === "join-user" ? "joined" : "left"
  } the chat!`;
  toastMessage.classList.add("toast-message");
  toastContainer.appendChild(toastMessage);
  toastContainer.classList.add("active");
  setTimeout(() => {
    toastContainer.classList.remove("active");
    toastContainer.removeChild(toastMessage);
  }, 2000);
}

function main() {
  // Add placeholder
  // const messageContainer = document.getElementById("chat-messages");
  // const noMessage = document.createElement("p");
  // noMessage.classList.add("no-message");
  // noMessage.innerText = "Start Chatting";
  // if (!messageContainer.childNodes.length) messageContainer.append(noMessage);

  socket.onopen = () => {
    console.log("Connected to the server");
    socket.send(JSON.stringify({ type: "username", text: username }));
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "join-user") {
      displayToast(data, data.type);
    } else if (data.type === "left-user") {
      displayToast(data, data.type);
    } else if (data.type === "message") {
      displayMessage(data.text, data.username);
    } else if (data.type === "clientNum") {
      console.log(data);
      const clientNum = document.querySelector(".numClients");
      clientNum.innerText = `${data.text} user(s) online`;

      const clientsNames = document.querySelector(".clients-names");

      const usernamesInParentheses = `(${data.users
        .map((user) => user.username)
        .join(", ")})`;

      clientsNames.innerText = usernamesInParentheses;
    }
  };

  socket.onclose = () => {
    console.log("Connection to server disconnected");
  };

  // Ping the server for live clients every 5 seconds
  setInterval(() => {
    socket.send(JSON.stringify({ type: "clientNum" }));
  }, 5000);
}
