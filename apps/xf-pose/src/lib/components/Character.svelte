<script lang="ts">
  import { useFrame } from "@threlte/core";
  import { GLTF } from '@threlte/extras';
  import type { Object3D } from 'three'

  let nodes: { [key: string]: Object3D };
  let rightarm: Object3D | undefined;

  $: {
    if (nodes) {
      rightarm = nodes.Scene.getObjectByName( 'mixamorigRightArm' );
      console.log(nodes)
      nodes.Scene.traverse((obj) => {obj.frustumCulled = false})
      rightarm.position.z = -40;
    }
  }

  let rotation = 0
  useFrame(() => {
    rotation += 0.01
  })

</script>

<GLTF castShadow bind:nodes url="assets/Xbot.glb" />
