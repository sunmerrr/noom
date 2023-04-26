const socket = io();
// io 함수는 자동으로 socket.io 서버를 연결함

const welcome = document.getElementById('welcome');
const form = document.querySelector('form');

function backendDone() {
  console.log('backend done');
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector('input');
  socket.emit('enterRoom', { payload: input.value }, backendDone);
  // 1. 특정한 evnet를 emit해 줄 수 있음(이름 상관 없음)
  // 2. object를 전달해 줄 수 있음
  input.value = '';
}

form.addEventListener('submit', handleRoomSubmit);
