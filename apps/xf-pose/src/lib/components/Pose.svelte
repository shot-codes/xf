<script lang="ts">
  import { POSE_LANDMARKS, type Results } from "@mediapipe/pose";
  import { Pose, VERSION } from "@mediapipe/pose";
  import { onMount } from "svelte";

  import { useFrame } from "@threlte/core";
  import { GLTF } from "@threlte/extras";
  import { Scene, Vector3, type Object3D } from "three";
  import { Quaternion, Euler, AxesHelper } from "three";
  import { SphereGeometry } from "three";
  import { MeshBasicMaterial } from "three";
  import { Mesh } from "three";

  const options = {
    locateFile: (file: string) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${VERSION}/${file}`;
    },
  };

  let nodes: { [key: string]: Object3D };
  let leftarm: Object3D | undefined;
  let leftelbow: Object3D | undefined;
  let lefthand: Object3D | undefined;

  let rightarm: Object3D | undefined;
  let rightelbow: Object3D | undefined;
  let righthand: Object3D | undefined;
  let head: Object3D | undefined;

  let poseResults: Results;

  let hip: Vector3 | undefined;
  let u: Vector3 | undefined;
  let v: Vector3 | undefined;
  let w: Vector3 | undefined;
  let x: Vector3 | undefined;
  let y: Vector3 | undefined;
  let uu: Vector3 | undefined;
  let vv: Vector3 | undefined;
  let xx: Vector3 | undefined;
  let yy: Vector3 | undefined;

  const geometry = new SphereGeometry(0.5, 32, 16);
  const material = new MeshBasicMaterial({ color: 0xffff00 });

  let la;
  let mesh;

  $: {
    if (nodes) {
      mesh = new Mesh(geometry, material);
      nodes.Scene.add(mesh);
    }
  }

  $: {
    if (nodes) {
      nodes.Scene.traverse((obj) => {
        obj.frustumCulled = false;
      });

      leftarm = nodes.Scene.getObjectByName("mixamorigLeftArm");
      leftelbow = nodes.Scene.getObjectByName("mixamorigLeftForeArm");
      lefthand = nodes.Scene.getObjectByName("mixamorigLeftHand");

      rightarm = nodes.Scene.getObjectByName("mixamorigRightArm");
      rightelbow = nodes.Scene.getObjectByName("mixamorigRightForeArm");
      righthand = nodes.Scene.getObjectByName("mixamorigRightHand");

      hip = nodes.Scene.getObjectByName("mixamorigHips")?.position;
      head = nodes.Scene.getObjectByName("mixamorigHead");

      if (poseResults && hip) {
        if ("poseWorldLandmarks" in poseResults) {
          la = poseResults.poseWorldLandmarks[0];
          u = new Vector3(
            hip.x / 100 - la.x,
            hip.y / 100 - la.y,
            hip.z / 100 - la.z
          );

          la = poseResults.poseWorldLandmarks[3];
          v = new Vector3(
            hip.x / 100 - la.x,
            hip.y / 100 - la.y,
            hip.z / 100 - la.z
          );

          la = poseResults.poseWorldLandmarks[6];
          w = new Vector3(
            hip.x / 100 - la.x,
            hip.y / 100 - la.y,
            hip.z / 100 - la.z
          );

          la = poseResults.poseWorldLandmarks[4];
          x = new Vector3(
            hip.x / 100 - la.x,
            hip.y / 100 - la.y,
            hip.z / 100 - la.z
          );

          la = poseResults.poseWorldLandmarks[10];
          y = new Vector3(
            hip.x / 100 - la.x,
            hip.y / 100 - la.y,
            hip.z / 100 - la.z
          );

          const lr = v.sub(w).normalize();
          const tb = u.normalize();

          const cross = lr.cross(tb);
          const dot = cross.dot(new Vector3(0,0,1));
          const lengthA = v.sub(w).length();
          const lengthB = cross.length();

          // Now to find the angle
          const theta = Math.acos(dot / (lengthA * lengthB));

          head.rotation.y = theta
          
          la = poseResults.poseWorldLandmarks[13];
          uu = new Vector3(
            hip.x / 100 - la.x,
            hip.y / 100 - la.y,
            hip.z / 100 - la.z
          );
          if (la.visibility > 0.3) {
            rightarm?.lookAt(uu.x, uu.y, uu.z);
            rightarm?.rotateY(3.14 / 2);
          }

          la = poseResults.poseWorldLandmarks[14];
          vv = new Vector3(
            hip.x / 100 - la.x,
            hip.y / 100 - la.y,
            hip.z / 100 - la.z
          );
          if (la.visibility > 0.3) {
            leftarm?.lookAt(vv.x, vv.y, vv.z);
            leftarm?.rotateY(-3.14 / 2);
          }

          la = poseResults.poseWorldLandmarks[15];
          xx = new Vector3(
            hip.x / 100 - la.x,
            hip.y / 100 - la.y,
            hip.z / 100 - la.z
          );
          if (la.visibility > 0.3) {
            rightelbow?.lookAt(xx.x, xx.y, xx.z);
            rightelbow?.rotateY(3.14 / 2);
          }

          la = poseResults.poseWorldLandmarks[16];
          yy = new Vector3(
            hip.x / 100 - la.x,
            hip.y / 100 - la.y,
            hip.z / 100 - la.z
          );
          if (la.visibility > 0.3) {
            leftelbow?.lookAt(yy.x, yy.y, yy.z);
            leftelbow?.rotateY(-3.14 / 2);
          }

          mesh.position.x = yy.x;
          mesh.position.y = yy.y;
          mesh.position.z = yy.z;
          console.log(hip, y, mesh)
        }
      }
    } else {
      console.log("mo change");
    }
  }

  onMount(async () => {
    const pose = new Pose(options);

    pose.setOptions({
      modelComplexity: 2,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    console.log(pose);
    console.log(VERSION);

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((mediaStream) => {
        const video = document.querySelector("video");
        if (video) {
          video.srcObject = mediaStream;
          video.onloadedmetadata = () => {
            video.play();
          };
          console.log("loaded");
        } else {
          console.log("notloaded");
        }

        function sendData() {
          if (video) {
            pose.send({ image: video });
          }
        }

        async function onResults(results: Results) {
          await new Promise((r) => setTimeout(r, 100));
          sendData();
          poseResults = results;
          //console.log(results);
        }

        pose.onResults(onResults);
        sendData();
      })
      .catch((err) => {
        // always check for errors at the end.
        console.error(`${err.name}: ${err.message}`);
      });
  });
</script>

<GLTF castShadow bind:nodes url="assets/brute.glb" />
