<script lang="ts">
  import type { Quaternion } from "three";
  import { spring } from "svelte/motion";
  import { T, useFrame } from "@threlte/core";
  import { HTML } from "@threlte/extras";
  import type { Spring } from "svelte/motion";
  import type { Group } from "three";

  export let quaternion: Quaternion;
  export let acc_avg: number;
  export let motionThreshold: number;
  export let zoom: Spring<number>;

  let deviceAtRest = true;
  let expansion = spring(21);
  let group: Group | undefined = undefined;
  let front: Group | undefined = undefined;
  let back: Group | undefined = undefined;
  let right: Group | undefined = undefined;
  let left: Group | undefined = undefined;

  useFrame(() => {
    if (group) group.quaternion.copy(quaternion);
    if (front) front.position.z = $expansion;
    if (back) back.position.z = -$expansion;
    if (right) right.position.x = $expansion;
    if (left) left.position.x = -$expansion;

    if (deviceAtRest && acc_avg > motionThreshold) {
      deviceAtRest = false;
      zoom.set(0.6);
      expansion.set(35);
    } else if (!deviceAtRest && acc_avg <= motionThreshold) {
      deviceAtRest = true;
      zoom.set(1.5);
      expansion.set(21);
    }
  });
</script>

<T.Group bind:ref={group}>
  <!-- Centre Sphere -->
  <!-- Removed because rendering became to expensive -->
  <!-- <SphereSprite /> -->

  <!-- Front -->
  <T.Group bind:ref={front} position={[0, 0, 21]}>
    <T.Mesh>
      <HTML transform>
        <div>
          <p style="color: black; font-size: 200px; background-color: yellow; padding: 40px;">
            xf-cube
          </p>
        </div>
      </HTML>
    </T.Mesh>
  </T.Group>

  <!-- Front -->
  <T.Group bind:ref={back} position={[0, 0, -21]}>
    <T.Mesh rotation.y={Math.PI}>
      <HTML transform>
        <iframe
          title=""
          src="https://mf-dashboard-sooty.vercel.app"
          width="1680px"
          height="1240px"
          frameborder="0"
        />
      </HTML>
    </T.Mesh>
  </T.Group>

  <!-- Right -->
  <T.Group bind:ref={right} position={[-21, 0, 0]} rotation.y={(90 * Math.PI) / 180}>
    <T.Mesh>
      <HTML transform>
        <iframe
          title=""
          src="https://www.mindfuture.com/"
          width="1680px"
          height="1240px"
          frameborder="0"
        />
      </HTML>
    </T.Mesh>
  </T.Group>

  <!-- Left -->
  <T.Group bind:ref={left} position={[21, 0, 0]} rotation.y={(90 * Math.PI) / 180}>
    <T.Mesh rotation.y={Math.PI}>
      <HTML transform>
        <iframe
          title=""
          src="https://lifewithartificials.com/"
          width="1680px"
          height="1240px"
          frameborder="0"
        />
      </HTML>
    </T.Mesh>
  </T.Group>
</T.Group>
