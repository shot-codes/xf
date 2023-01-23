<script lang="ts">
  import { Holistic, VERSION, type Results } from "@mediapipe/holistic";
  import { onMount } from "svelte";

  import { GLTF } from "@threlte/extras";
  import { AxesHelper, Group, SkinnedMesh, Vector3, type Event, type Object3D } from "three";
  import { SphereGeometry } from "three";
  import { MeshBasicMaterial, CylinderGeometry } from "three";
  import { Mesh } from "three";

  const options = {
    locateFile: (file: string) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@${VERSION}/${file}`;
    },
  };

  let nodes: { [key: string]: Object3D };
  let head: Object3D | undefined;
  let poseResults: Results;
  let lookat_pos: Vector3 | undefined;

  const geometry = new SphereGeometry(0.012, 32, 16);
  const cylinderGeometry = new CylinderGeometry(0.03, 0.03, 1, 16);
  const material = new MeshBasicMaterial({ color: 0xffff00 });
  const cylinderMaterial = new MeshBasicMaterial({ color: "#bc4737" });

  let node_pos;
  let child_pos;

  let target = new Vector3();
  let visibility;
  let left;
  let right;
  let topDown = new Vector3(0, 1, 0);
  let leftRight;
  let look;
  let skeleton: {
    node_ids: number[];
    child_ids: number[];
    bone: Object3D<Event> | undefined;
  }[];
  let handSkeleton: { node_id: number; child_id: number; mesh: Group; }[] = [];
  let debugSkeleton: Mesh<SphereGeometry, MeshBasicMaterial>[] = [];
  let debugSkeletonHands: Mesh<SphereGeometry, MeshBasicMaterial>[] = [];
  let debug = true;

  $: {
    if (nodes) {
      skeleton = [
        {
          node_ids: [11],
          child_ids: [13],
          bone: nodes.Scene.getObjectByName("mixamorigLeftArm"),
        },
        {
          node_ids: [13],
          child_ids: [15],
          bone: nodes.Scene.getObjectByName("mixamorigLeftForeArm"),
        },
        {
          node_ids: [12],
          child_ids: [14],
          bone: nodes.Scene.getObjectByName("mixamorigRightArm"),
        },
        {
          node_ids: [14],
          child_ids: [16],
          bone: nodes.Scene.getObjectByName("mixamorigRightForeArm"),
        },
        {
          node_ids: [23, 24],
          child_ids: [11, 12],
          bone: nodes.Scene.getObjectByName("mixamorigSpine"),
        },
      ];
      nodes.Scene.getObjectByName("mixamorigRightHand")?.scale.set(0, 0, 0);
      nodes.Scene.getObjectByName("mixamorigLeftHand")?.scale.set(0, 0, 0);

      handSkeleton = [
        {
          node_id: 0,
          child_id: 8,
          mesh: new Group(),
        },
        {
          node_id: 0,
          child_id: 12,
          mesh: new Group(),
        },
        {
          node_id: 0,
          child_id: 16,
          mesh: new Group(),
        },
        {
          node_id: 0,
          child_id: 20,
          mesh: new Group(),
        },
        {
          node_id: 0,
          child_id: 4,
          mesh: new Group(),
        },
        
      ];
      for (const sk of handSkeleton) {
        const mesh = new Mesh(cylinderGeometry, cylinderMaterial);
        sk.mesh.add(mesh);
        mesh.translateY(0.5);
        
        nodes.Scene.add(sk.mesh);
      }
    }
  }

  $: {
    if (nodes) {
      for (let i = 0; i <= 32; i++) {
        const mesh = new Mesh(geometry, material);
        nodes.Scene.add(mesh);
        debugSkeleton.push(mesh);
      }

      for (let i = 0; i <= 20; i++) {
        const mesh = new Mesh(geometry, material);
        nodes.Scene.add(mesh);
        debugSkeletonHands.push(mesh);
      }
    }
  }

  $: {
    if (nodes) {
      nodes.Scene.traverse((obj) => {
        obj.frustumCulled = false;
      });

      head = nodes.Scene.getObjectByName("mixamorigHead");

      if (poseResults && "ea" in poseResults) {
        for (const sk of skeleton) {
          node_pos = new Vector3(0, 0, 0);
          visibility = 0;
          for (const node_id of sk.node_ids) {
            node_pos.x =
              node_pos.x + poseResults.ea[node_id].x / sk.node_ids.length;
            node_pos.y =
              node_pos.y + poseResults.ea[node_id].y / sk.node_ids.length;
            node_pos.z =
              node_pos.z + poseResults.ea[node_id].z / sk.node_ids.length;
            visibility =
              visibility +
              poseResults.ea[node_id].visibility / sk.node_ids.length;
          }

          child_pos = new Vector3(0, 0, 0);
          for (const child_id of sk.child_ids) {
            child_pos.x =
              child_pos.x + poseResults.ea[child_id].x / sk.child_ids.length;
            child_pos.y =
              child_pos.y + poseResults.ea[child_id].y / sk.child_ids.length;
            child_pos.z =
              child_pos.z + poseResults.ea[child_id].z / sk.child_ids.length;
          }

          sk.bone?.getWorldPosition(target);
          lookat_pos = new Vector3(
            target.x + (child_pos.x - node_pos.x),
            target.y - (child_pos.y - node_pos.y),
            target.z - (child_pos.z - node_pos.z)
          );
          if (visibility > 0.3) {
            const old_rot = sk.bone?.rotation.y;
            sk.bone?.lookAt(lookat_pos.x, lookat_pos.y, lookat_pos.z);
            if (old_rot && sk.bone) {
              sk.bone.rotation.z = old_rot;
            }
            sk.bone?.rotateX(3.14 / 2);
          }
        }

        // head roatation
        left = poseResults.ea[7];
        right = poseResults.ea[8];

        leftRight = new Vector3(
          left.x - right.x,
          left.y - right.y,
          left.z - right.z
        ).normalize();

        look = new Vector3(
          leftRight.y * topDown.z - leftRight.z * topDown.y,
          -leftRight.x * topDown.z - leftRight.z * topDown.x,
          leftRight.x * topDown.y - leftRight.y * topDown.x
        );

        head?.getWorldPosition(target);
        head?.lookAt(target.x - look.x, target.y + look.y, target.z + look.z);

        // torso roatation
        left = poseResults.ea[11];
        right = poseResults.ea[12];

        leftRight = new Vector3(
          left.x - right.x,
          left.y - right.y,
          left.z - right.z
        ).normalize();

        look = new Vector3(
          leftRight.y * topDown.z - leftRight.z * topDown.y,
          -leftRight.x * topDown.z - leftRight.z * topDown.x,
          leftRight.x * topDown.y - leftRight.y * topDown.x
        );
        const root = nodes.Scene.getObjectByName("Armature");
        //root.up = new Vector3(0,0,1);
        root.rotation.z = Math.atan2(look.x, look.z);

        if ("rightHandLandmarks" in poseResults) {
          for (const sk of handSkeleton) {
            const wrist = poseResults.rightHandLandmarks[0];
            const node = poseResults.rightHandLandmarks[sk.node_id];
            const child = poseResults.rightHandLandmarks[sk.child_id];
            const mesh = sk.mesh;

            const hand = nodes.Scene.getObjectByName("mixamorigRightHand");
            hand?.getWorldPosition(target);

            const scale = (new Vector3(node.x, node.y, node.z)).distanceTo(new Vector3(child.x, child.y, child.z));
            mesh.scale.set(scale,scale,scale);
            console.log(scale)
            mesh.position.x = target.x + (node.x-wrist.x);
            mesh.position.y = target.y - (node.y-wrist.y);
            mesh.position.z = target.z - (node.z-wrist.z);

            look = new Vector3(
              target.x + (child.x - node.x),
              target.y - (child.y - node.y),
              target.z - (child.z - node.z)
            );

            mesh.lookAt(look);
            mesh.rotateX(3.14 / 2);

            console.log(mesh);
          }
        }

        if (debug) {
          for (const node_id in debugSkeleton) {
            const mesh = debugSkeleton[node_id];
            const node = poseResults.ea[node_id];
            const hips = nodes.Scene.getObjectByName("mixamorigHips");
            hips?.getWorldPosition(target);
            mesh.position.x = 1 + target.x + node.x;
            mesh.position.y = target.y - node.y;
            mesh.position.z = target.z - node.z;
          }
        }

        if (debug && "rightHandLandmarks" in poseResults) {
          const node = poseResults.rightHandLandmarks[9];
          const wrist = poseResults.rightHandLandmarks[0];
          const lk = poseResults.rightHandLandmarks[5];
          const rk = poseResults.rightHandLandmarks[17];
          const hand = nodes.Scene.getObjectByName("mixamorigRightHand");

          hand?.getWorldPosition(target);

          hand?.add(new AxesHelper(50));

          look = new Vector3(
            target.x + (node.x - wrist.x),
            target.y - (node.y - wrist.y),
            target.z - (node.z - wrist.z)
          );
          const up = new Vector3(
            target.x + (lk.x - rk.x),
            target.y - (lk.y - rk.y),
            target.z - (lk.z - rk.z)
          );

          for (const node_id in debugSkeletonHands) {
            const mesh = debugSkeletonHands[node_id];
            const node = poseResults.rightHandLandmarks[node_id];
            const wrist = poseResults.rightHandLandmarks[0];
            const hand = nodes.Scene.getObjectByName("mixamorigRightHand");
            hand?.getWorldPosition(target);
            mesh.position.x = target.x + (node.x - wrist.x);
            mesh.position.y = target.y - (node.y - wrist.y);
            mesh.position.z = target.z - (node.z - wrist.z);
          }
        }
      }
    } else {
      console.log("mo change");
    }
  }

  onMount(async () => {
    const pose = new Holistic(options);

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
