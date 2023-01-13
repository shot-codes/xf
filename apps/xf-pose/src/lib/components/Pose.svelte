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

  const geometry = new SphereGeometry(0.1, 32, 16);
  const material = new MeshBasicMaterial({ color: 0xffff00 });

  let la;
  let base;
  let mesh;
  let mesh2;
  let target = new Vector3();

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

      leftarm = nodes.Scene.getObjectByName("mixamorigLeftArm");
      leftelbow = nodes.Scene.getObjectByName("mixamorigLeftForeArm");
      lefthand = nodes.Scene.getObjectByName("mixamorigLeftHand");
      rightarm = nodes.Scene.getObjectByName("mixamorigRightArm");
      rightelbow = nodes.Scene.getObjectByName("mixamorigRightForeArm");
      righthand = nodes.Scene.getObjectByName("mixamorigRightHand");
      hip = nodes.Scene.getObjectByName("mixamorigHips")?.position;
      head = nodes.Scene.getObjectByName("mixamorigHead");

      if (false) {
        leftarm?.add(new AxesHelper(100));
        leftelbow?.add(new AxesHelper(100));
        lefthand?.add(new AxesHelper(100));
        rightarm?.add(new AxesHelper(100));
        rightelbow?.add(new AxesHelper(100));
        righthand?.add(new AxesHelper(100));
        head?.add(new AxesHelper(100));
      }

      if (poseResults && hip) {
        if ("poseWorldLandmarks" in poseResults) {
          base = poseResults.poseWorldLandmarks[11];
          la = poseResults.poseWorldLandmarks[13];
          rightarm?.getWorldPosition(target);
          uu = new Vector3(
            target.x - (la.x - base.x),
            target.y - (la.y - base.y),
            target.z - (la.z - base.z)
          );
          if (la.visibility > 0.3) {
            rightarm?.lookAt(uu.x, uu.y, uu.z);
            rightarm?.rotateX(3.14 / 2);
          }

          base = poseResults.poseWorldLandmarks[13];
          la = poseResults.poseWorldLandmarks[15];
          rightelbow?.getWorldPosition(target);
          vv = new Vector3(
            target.x - (la.x - base.x),
            target.y - (la.y - base.y),
            target.z - (la.z - base.z)
          );
          if (la.visibility > 0.3) {
            rightelbow?.lookAt(vv.x, vv.y, vv.z);
            rightelbow?.rotateX(3.14 / 2);
          }

          base = poseResults.poseWorldLandmarks[12];
          la = poseResults.poseWorldLandmarks[14];
          leftarm?.getWorldPosition(target);
          xx = new Vector3(
            target.x - (la.x - base.x),
            target.y - (la.y - base.y),
            target.z - (la.z - base.z)
          );
          if (la.visibility > 0.3) {
            leftarm?.lookAt(xx.x, xx.y, xx.z);
            leftarm?.rotateX(3.14 / 2);
          }

          base = poseResults.poseWorldLandmarks[14];
          la = poseResults.poseWorldLandmarks[16];
          leftelbow?.getWorldPosition(target);
          yy = new Vector3(
            target.x - (la.x - base.x),
            target.y - (la.y - base.y),
            target.z - (la.z - base.z)
          );
          if (la.visibility > 0.3) {
            leftelbow?.lookAt(yy.x, yy.y, yy.z);
            leftelbow?.rotateX(3.14 / 2);
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
            head?.lookAt(
              new Vector3(-100 * look.x, -100 * look.y, 100 * look.z)
            );

            head?.getWorldPosition(target);
            head?.rotateX(-3.14 / 2);

            mesh2.position.x = target.x - 100 * look.x; // left
            mesh2.position.y = target.y - 100 * look.y; // up
            mesh2.position.z = target.z + 100 * look.z;

            console.log(mesh2);
          }
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
          await new Promise((r) => setTimeout(r, 50));
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
