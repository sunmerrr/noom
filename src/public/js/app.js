const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message")
const nickForm = document.querySelector("#nickname")

const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
  const msg = {type, payload}
  return JSON.stringify(msg)
}

socket.addEventListener("open", () => {
  console.log("Connected to Server");
});

socket.addEventListener("message", (message) => {
  const li = document.createElement("li");
  
  // 메세지의 데이터가 blob 형식일 경우
  if (message.data instanceof Blob) {
    reader = new FileReader();
    
    reader.onload = () => {
      console.log("Result: " + reader.result);
      li.innerText = reader.result
    };
    reader.readAsText(message.data);
  } else {
    console.log("Else Result: " + message.data);
    li.innerText = message.data
  }
  messageList.append(li)
});

socket.addEventListener("close", () => {
  console.log("Disconnected from Server");
});

function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input"); // input 가져오기
  socket.send(makeMessage("new_message", input.value)) // socket을 통해서 backend로 input값을 보냄 
  input.value = ""
};


function hanldeNickSubmit(event) {
  event.preventDefault();
  const input = nickForm.querySelector("input")
  socket.send(makeMessage("nickname", input.value));
}


messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", hanldeNickSubmit);