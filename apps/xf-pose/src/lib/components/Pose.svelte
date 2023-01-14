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

  const geometry = new SphereGeometry(0.05, 32, 16);
  const material = new MeshBasicMaterial({ color: 0xffff00 });

  let node_pos;
  let child_pos;
  let mesh;

  let target = new Vector3();
  let visibility;

  let skeleton: {
    node_ids: number[];
    child_ids: number[];
    bone: Object3D<Event> | undefined;
    excludeXrotation: boolean;
  }[];

  $: {
    if (nodes) {
      skeleton = [
        {
          node_ids: [11],
          child_ids: [13],
          bone: nodes.Scene.getObjectByName("mixamorigRightArm"),
          excludeXrotation: false,
        },
        {
          node_ids: [13],
          child_ids: [15],
          bone: nodes.Scene.getObjectByName("mixamorigRightForeArm"),
          excludeXrotation: true,
        },
        {
          node_ids: [12],
          child_ids: [14],
          bone: nodes.Scene.getObjectByName("mixamorigLeftArm"),
          excludeXrotation: false,
        },
        {
          node_ids: [14],
          child_ids: [16],
          bone: nodes.Scene.getObjectByName("mixamorigLeftForeArm"),
          excludeXrotation: true,
        },
        {
          node_ids: [23, 24],
          child_ids: [11, 12],
          bone: nodes.Scene.getObjectByName("mixamorigSpine"),
          excludeXrotation: true,
        },
      ];
    }
  }

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

      head = nodes.Scene.getObjectByName("mixamorigHead");

      if (poseResults && "poseWorldLandmarks" in poseResults) {
        for (const sk of skeleton) {
          node_pos = new Vector3(0, 0, 0);
          visibility = 0;
          for (const node_id of sk.node_ids) {
            node_pos.x =
              node_pos.x +
              poseResults.poseWorldLandmarks[node_id].x / sk.node_ids.length;
            node_pos.y =
              node_pos.y +
              poseResults.poseWorldLandmarks[node_id].y / sk.node_ids.length;
            node_pos.z =
              node_pos.z +
              poseResults.poseWorldLandmarks[node_id].z / sk.node_ids.length;
            visibility =
              visibility +
              poseResults.poseWorldLandmarks[node_id].visibility /
                sk.node_ids.length;
          }

          child_pos = new Vector3(0, 0, 0);
          for (const child_id of sk.child_ids) {
            child_pos.x =
              child_pos.x +
              poseResults.poseWorldLandmarks[child_id].x / sk.child_ids.length;
            child_pos.y =
              child_pos.y +
              poseResults.poseWorldLandmarks[child_id].y / sk.child_ids.length;
            child_pos.z =
              child_pos.z +
              poseResults.poseWorldLandmarks[child_id].z / sk.child_ids.length;
          }

          sk.bone?.getWorldPosition(target);
          lookat_pos = new Vector3(
            target.x - (child_pos.x - node_pos.x),
            target.y - (child_pos.y - node_pos.y),
            target.z - (child_pos.z - node_pos.z)
          );
          console.log(lookat_pos, visibility, sk.bone);
          if (visibility > 0.3) {
            const old_rot = sk.bone?.rotation.y;
            sk.bone?.lookAt(lookat_pos.x, lookat_pos.y, lookat_pos.z);
            if (old_rot && sk.bone && sk.excludeXrotation) {
              sk.bone.rotation.z = old_rot;
            }
            sk.bone?.rotateX(3.14 / 2);
          }
        }

        const left = poseResults.poseWorldLandmarks[7];
        const right = poseResults.poseWorldLandmarks[8];

        const leftRight = new Vector3(
          left.x - right.x,
          left.y - right.y,
          left.z - right.z
        ).normalize();
        const topDown = new Vector3(0, 1, 0);

        const look = new Vector3(
          leftRight.y * topDown.z - leftRight.z * topDown.y,
          -leftRight.x * topDown.z - leftRight.z * topDown.x,
          leftRight.x * topDown.y - leftRight.y * topDown.x
        );

        head?.getWorldPosition(target);

        if (false) {
          mesh.position.x = target.x + look.x;
          mesh.position.y = target.y + look.y;
          mesh.position.z = target.z + look.z;
        }

        head?.lookAt(target.x + look.x, target.y + look.y, target.z + look.z);
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

<GLTF castShadow bind:nodes url="assets/diablo.glb" />
