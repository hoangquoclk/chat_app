const socket = io();

const $messages = document.getElementById("messages");

// Templates
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById(
  "location-message-template"
).innerHTML;

const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  // new message Element
  const $newMessage = $messages.lastElementChild;

  // Height of the last message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  console.log(newMessageMargin);
  //visibleHeight
  const visibleHeight = $messages.offsetHeight;

  // height of messages container
  const containerHeight = $messages.scrollHeight;

  //How far have i scroll?
  const scrollOfSet = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOfSet) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm:ss a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("sendLocation", (url) => {
  const html = Mustache.render(locationTemplate, {
    username: url.username,
    url: url.url,
    createdAt: moment(url.createdAt).format("h:mm:ss a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });

  document.getElementById("sidebar").innerHTML = html;
});

document.getElementById("send").addEventListener("click", () => {
  socket.emit("chat", document.getElementById("chat").value, (error) => {
    if (error) {
      return console.log(error);
    }
    document.getElementById("chat").value = "";
    document.getElementById("chat").focus();
    // console.log("The message was delivery!");
  });
});

document.getElementById("chat").addEventListener("keyup", (event) => {
  if (event.keyCode === 13) {
    socket.emit("chat", document.getElementById("chat").value, (error) => {
      if (error) {
        return console.log(error);
      }
      document.getElementById("chat").value = "";
      document.getElementById("chat").focus();
    });
  }
});

document.getElementById("location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "send location",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        room,
      },
      () => {
        console.log("Location shared");
        document.getElementById("location").setAttribute("disabled", true);
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
