<script lang="ts">
  import io from "socket.io-client";
  import { spring } from "svelte/motion";
  import { Quaternion } from "three";
  import { Canvas, OrbitControls, T } from "@threlte/core";
  import Cube from "$lib/components/Cube.svelte";
  import Skybox from "$lib/components/Skybox.svelte";
  import type { PerspectiveCamera } from "three";

  const quaternion = new Quaternion(0.0, 0.0, 0.0, 0.0);
  let acc_avg = 0;
  let acc_avg_mw = new Array(20);
  acc_avg_mw.fill(0);
  const motionThreshold = 0.5;

  let camera: PerspectiveCamera | undefined = undefined;
  let zoom = spring(1.5);

  $: {
    if (camera) camera.zoom = $zoom;
  }

  const socket = io(import.meta.env.VITE_WEBSOCKET_HOST);
  socket.on("connect", () => {
    console.log("Websocket connected!");
  });

  socket.on("data", (data) => {
    // update current quaternion with socket data
    const q = JSON.parse(data);
    const nextQuaternion = new Quaternion(
      parseFloat(q.quaternion_x),
      parseFloat(q.quaternion_y),
      parseFloat(q.quaternion_z),
      parseFloat(q.quaternion_w)
    );
    const qu = new Quaternion();
    quaternion.copy(
      qu.fromArray([nextQuaternion.x, nextQuaternion.z, -nextQuaternion.y, nextQuaternion.w])
    );

    // Calculate and insert device acceleration into moving window
    acc_avg_mw.shift();
    acc_avg_mw.push(
      Math.abs(
        parseFloat(q.acceleration_x) + parseFloat(q.acceleration_y) + parseFloat(q.acceleration_z)
      )
    );

    // Calculate and update current average device acceleration
    acc_avg = acc_avg_mw.reduce((a, b) => a + b, 0);
  });
</script>

<div id="threlte-root">
  <Canvas>
    <T.DirectionalLight position={[3, 10, 10]} />
    <T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
    <T.AmbientLight />

    <T.PerspectiveCamera bind:ref={camera} makeDefault position={[0, 0, 75]} fov={50} far={10000}>
      <OrbitControls />
    </T.PerspectiveCamera>

    <Skybox />
    <Cube bind:zoom {quaternion} {acc_avg} {motionThreshold} />
  </Canvas>
</div>

<style>
  #threlte-root {
    height: 100%;
    width: 100%;
  }
</style>
