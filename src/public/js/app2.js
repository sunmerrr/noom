const socket = io();
// io 함수는 자동으로 socket.io 서버를 연결함

const welcome = document.getElementById('welcome');
const form = document.querySelector('form');
const room = document.getElementById('room');

room.hidden = true;

let roomName = '';

function addMessage(message) {
  const ul = room.querySelector('ul');
  const li = document.createElement('li');
  li.innerText = message;
  ul.appendChild(li);
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector('h3');
  h3.innerText = `Room: ${roomName}`;
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

socket.on('welcome', mes => {
  console.log(mes);
  addMessage('Someone Joined');
});
