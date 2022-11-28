import { Quaternion } from "quaternion";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_WEBSOCKET_HOST);

socket.on("connect", () => {
  console.log("connected!");
});

const onOrientationChange = (event) => {
  const q = Quaternion.fromEuler(
    (event.alpha * Math.PI) / 180,
    (event.beta * Math.PI) / 180,
    (event.gamma * Math.PI) / 180,
    "ZXY"
  );

  document.querySelector(
    "#quaternion"
  ).textContent = `quaternion (w, x, y, z) = ${q.toVector()}`;
};

const onMotionChange = (event) => {
  const a = [event.acceleration.x, event.acceleration.y, event.acceleration.z];
  document.querySelector("#acc").textContent = `acc x, y, z) = ${a}`;
};

const button = document.getElementById("button");
button.onclick = function () {
  // feature detect
  if (typeof DeviceOrientationEvent.requestPermission === "function") {
    DeviceOrientationEvent.requestPermission()
      .then((permissionState) => {
        if (permissionState === "granted") {
          window.addEventListener(
            "deviceorientation",
            onOrientationChange,
            true
          );
        }
      })
      .catch(console.error);
  } else {
    // handle regular non iOS 13+ devices
  }
};

onOrientationChange({ alpha: 0, beta: 0, gamma: 0 });
// window.addEventListener("deviceorientation", onOrientationChange, true);
