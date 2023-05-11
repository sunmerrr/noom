const socket = io();

const myFace = document.getElementById("myFace");;
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras")

const call = document.getElementById("call")


call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

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
    console.log('error', e)
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


// join a room
const welcome = document.getElementById("welcome")
welcomeForm = welcome.querySelector('form')

async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input")
  await initCall()
  socket.emit("join_room", input.value, );
  roomName = input.value;
  input.value = ""
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit)

// socket code
socket.on("welcome", async () => {
  // create offer (create room side)
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer)
  console.log('sent the offer')
  socket.emit('offer', offer, roomName)
})

socket.on('offer', offer => {
  myPeerConnection.setRemoteDescription(offer)
})

// RTC code
function makeConnection() {
  myPeerConnection = new RTCPeerConnection();
  myStream
    .getTracks()
    .forEach(track => myPeerConnection.addTrack(track, myStream));
}