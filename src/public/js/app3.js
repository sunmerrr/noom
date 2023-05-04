const socket = io();

const myFace = document.getElementById("myFace");;
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras")

const welcome = document.getElementById("welcome")
const call = document.getElementById("call")

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const cameras = devices.filter(device => device.kind === "videoinput")
    const currentCamera = (myStream.getVideoTracks()[0])
    cameras.map((camera)=> {
      const option = document.createElement("option")
      option.value = camera.deviceId
      option.innerText = camera.label
      if(currentCamera.label === option.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option)
    })
  } catch(e) {
    console.log(e)
  }
}

async function getMedia(deviceId) {
  console.log('deviceId', deviceId)
  const initialConstrains = {
    audio: true,
    video: { facingMode: 'user' }
  }

  const cameraConstraints = {
    audio: true,
    video: { diviceId: deviceId }
  }

  try {
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstraints : initialConstrains
    )
    myFace.srcObject = myStream;
    console.log('myStream', myStream)
    if (!deviceId) {
      await getCameras()
    }
  } catch (e) {
    console.log(e)
  }
}

function handleMuteClick() {
  myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled)
  if(!muted) {
    muteBtn.innerText = "Unmute"
    muted = true;
  } else {
    muteBtn.innerText = "Mute"
    muted = false;
  }
}

function handleCameraClick() {
  myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled)
  if(cameraOff){
    cameraBtn.innerText = "Turn Camera Off"
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On"
    cameraOff = true;
  }
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value)
}

muteBtn.addEventListener("click", handleMuteClick)
cameraBtn.addEventListener("click", handleCameraClick)
camerasSelect.addEventListener("input", handleCameraChange)

welcomeForm = welcome.querySelector('form')

function startMedia() {
  welcome.hidden = true;
  call.hidden = false;
  getMedia();
}

function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input")
  socket.emit("join_room", input.value);
  input.value = ""
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit)