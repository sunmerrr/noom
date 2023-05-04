const socket = io();
// io 함수는 자동으로 socket.io 서버를 연결함

const welcome = document.getElementById('welcome');
const form = document.querySelector('form');
const room = document.getElementById('room');

room.hidden = true;

let roomName = '';

function addMessage(message) {
  console.log('message', message)
  const ul = room.querySelector('ul');
  const li = document.createElement('li');
  li.innerText = message;
  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector('#msg input');
  socket.emit('new_message', input.value, roomName, () => {
    addMessage(`You: ${input.value}`)
    input.value = '';
  });
}

function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = room.querySelector('#name input');
  socket.emit('nickname', input.value)
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector('h3');
  h3.innerText = `Room: ${roomName}`;
  const msgForm = room.querySelector('#msg');
  const nameForm = room.querySelector('#name');
  msgForm.addEventListener('submit', handleMessageSubmit)
  nameForm.addEventListener('submit', handleNicknameSubmit)
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector('input');
  socket.emit('enter_room', input.value, showRoom);
  // 1. 특정한 evnet를 emit해 줄 수 있음(이름 상관 없음)
  // 2. object를 전달해 줄 수 있음
  roomName = input.value;
  input.value = '';
}

form.addEventListener('submit', handleRoomSubmit);

socket.on('welcome', (nickname, newCount) => {
  const h3 = room.querySelector('h3');
  h3.innerText = `Room: ${roomName} (${newCount})`;
  addMessage(`${nickname} Joined`);
});

socket.on("bye", (nickname, newCount) => {
  const h3 = room.querySelector('h3');
  h3.innerText = `Room: ${roomName} (${newCount})`;
  addMessage(`${nickname} Left`)
})

socket.on("new_message", addMessage)

socket.on("room_change", rooms => {
  const roomList = document.querySelector("ul")
  
  roomList.innerHTML = "";
  if(rooms.length === 0) return

  rooms.forEach(room => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li)
  })
})