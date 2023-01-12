<script lang="ts">
  import { POSE_LANDMARKS, type Results } from "@mediapipe/pose";
  import { Pose, VERSION } from "@mediapipe/pose";
  import { onMount } from "svelte";

  import { useFrame } from "@threlte/core";
  import { GLTF } from "@threlte/extras";
  import { Vector3, type Object3D } from "three";
  import { Quaternion, Euler } from "three";

  const options = {
    locateFile: (file: string) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${VERSION}/${file}`;
    },
  };

  let nodes: { [key: string]: Object3D };
  let leftarm: Object3D | undefined;
  let poseResults: Results;

  let u: Vector3;
  let hip: Vector3 | undefined;

  $: {
    if (nodes) {
      nodes.Scene.traverse((obj) => {
        obj.frustumCulled = false;
      });

      leftarm = nodes.Scene.getObjectByName("mixamorigLeftArm");
      hip = nodes.Scene.getObjectByName("mixamorigHips")?.position;


      if (poseResults) {
        if ("poseWorldLandmarks" in poseResults) {

          const la = poseResults.poseWorldLandmarks[14];
          u = new Vector3(la.z,la.x,la.z).multiplyScalar(100);


          console.log(u, hip, leftarm?.position)
          leftarm.lookAt(u.add(hip));
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
          await new Promise((r) => setTimeout(r, 200));
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

<GLTF castShadow bind:nodes url="assets/Xbot.glb" />
