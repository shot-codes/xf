<script lang="ts">
  import { Pose, VERSION, type Results } from "@mediapipe/pose";
  import { onMount } from "svelte";

  import { GLTF } from "@threlte/extras";
  import { Vector3, type Event, type Object3D } from "three";
  import { SphereGeometry } from "three";
  import { MeshBasicMaterial } from "three";
  import { Mesh } from "three";

  const options = {
    locateFile: (file: string) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${VERSION}/${file}`;
    },
  };

  let nodes: { [key: string]: Object3D };
  let head: Object3D | undefined;
  let poseResults: Results;
  let lookat_pos: Vector3 | undefined;

  const geometry = new SphereGeometry(0.1, 32, 16);
  const material = new MeshBasicMaterial({ color: 0xffff00 });

  let node_pos;
  let child_pos;
  let mesh;
  let mesh2;
  let target = new Vector3();

  let skeleton: {
    node_id: number;
    child_id: number;
    bone: Object3D<Event> | undefined;
  }[];

  $: {
    if (nodes) {
      skeleton = [
        {
          node_id: 11,
          child_id: 13,
          bone: nodes.Scene.getObjectByName("mixamorigRightArm"),
        },
        {
          node_id: 13,
          child_id: 15,
          bone: nodes.Scene.getObjectByName("mixamorigRightForeArm"),
        },
        {
          node_id: 12,
          child_id: 14,
          bone: nodes.Scene.getObjectByName("mixamorigLeftArm"),
        },
        {
          node_id: 14,
          child_id: 16,
          bone: nodes.Scene.getObjectByName("mixamorigLeftForeArm"),
        },
      ];
    }
  }

  $: {
    if (nodes) {
      mesh = new Mesh(geometry, material);
      nodes.Scene.add(mesh);

      mesh2 = new Mesh(geometry, material);
      nodes.Scene.add(mesh2);
    }
  }

  $: {
    if (nodes) {
      nodes.Scene.traverse((obj) => {
        obj.frustumCulled = false;
      });

      head = nodes.Scene.getObjectByName("mixamorigHead");

      if (poseResults && "poseWorldLandmarks" in poseResults) {
        for (const sk of skeleton) {
          node_pos = poseResults.poseWorldLandmarks[sk.node_id];
          child_pos = poseResults.poseWorldLandmarks[sk.child_id];
          sk.bone?.getWorldPosition(target);
          lookat_pos = new Vector3(
            target.x - (child_pos.x - node_pos.x),
            target.y - (child_pos.y - node_pos.y),
            target.z - (child_pos.z - node_pos.z)
          );
          if (node_pos.visibility > 0.3) {
            sk.bone?.lookAt(lookat_pos.x, lookat_pos.y, lookat_pos.z);
            sk.bone?.rotateX(3.14 / 2);
          }
        }

        if (false) {
          //head?.lookAt(new Vector3(0.5,2,0.5))
          mesh.position.x = 0.5;
          mesh.position.y = 2;
          mesh.position.z = 0.5;

          const ley = poseResults.poseWorldLandmarks[6];
          const rey = poseResults.poseWorldLandmarks[3];
          const lmo = poseResults.poseWorldLandmarks[10];
          const rmo = poseResults.poseWorldLandmarks[9];

          const diag1 = new Vector3(
            ley.x - rey.x,
            ley.y - rey.y,
            ley.z - rey.z
          );
          const diag2 = new Vector3(
            rey.x + ley.x - rmo.x - lmo.x,
            rey.y + ley.y - rmo.y - lmo.y,
            rey.z + ley.z - rmo.z - lmo.z
          );

          const look = new Vector3(
            diag1.y * diag2.z - diag1.z * diag2.y,
            -diag1.x * diag2.z - diag1.z * diag2.x,
            diag1.x * diag2.y - diag1.y * diag2.x
          );
          console.log("llll", diag2, diag1);
          head?.lookAt(new Vector3(-100 * look.x, -100 * look.y, 100 * look.z));

          head?.getWorldPosition(target);
          head?.rotateX(-3.14 / 2);

          mesh2.position.x = target.x - 100 * look.x; // left
          mesh2.position.y = target.y - 100 * look.y; // up
          mesh2.position.z = target.z + 100 * look.z;

          console.log(mesh2);
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
          await new Promise((r) => setTimeout(r, 50));
          sendData();
          poseResults = results;
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
