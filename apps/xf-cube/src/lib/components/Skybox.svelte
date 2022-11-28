<script lang="ts">
  import type { Material } from "three";
  import { T, useTexture, useFrame } from "@threlte/core";
  import { MeshBasicMaterial } from "three";
  import { BackSide } from "three";
  import { GLTF } from '@threlte/extras';
    import Cube from "./Cube.svelte";

  const textures = useTexture([
    "textures/corona_ft.png",
    "textures/corona_bk.png",
    "textures/corona_up.png",
    "textures/corona_dn.png",
    "textures/corona_rt.png",
    "textures/corona_lf.png",
  ]);
  let materials: Material[] = [];

  for (const texture of textures) {
    materials.push(new MeshBasicMaterial({ map: texture, side: BackSide }));
  }

  let rotation = 0;
  useFrame(() => {
    rotation += 0.0003;
  });
</script>

<T.Group rotation.y={rotation}>
  <T.Mesh material={materials}>
    <T.BoxGeometry args={[2000, 2000, 2000]} />
  </T.Mesh>
</T.Group>

<T.Group rotation.y={0}>
  <GLTF
      scale={50}
      position={{y: -80, z:-330, x:100}}
      url="/assets/mf.glb"
    />
</T.Group>
