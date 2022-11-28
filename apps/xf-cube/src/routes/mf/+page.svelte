<script lang="ts">
  import { Canvas, InteractiveObject, OrbitControls, T } from '@threlte/core'
  import { spring } from 'svelte/motion'
  import { degToRad } from 'three/src/math/MathUtils'
  import { GLTF } from '@threlte/extras'

  const scale = spring(1)

</script>

<div id="threlte-root">
  <Canvas>
    <T.DirectionalLight position={[3, 10, 10]} />
    <T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
    <T.AmbientLight />

    <T.PerspectiveCamera makeDefault position={[0, 0, 75]} fov={50}>
      <OrbitControls />
    </T.PerspectiveCamera>

    <GLTF
      url="/assets/mf.glb"
    />


  </Canvas>
</div>

<style>
  #threlte-root {
    height: 100%;
    width: 100%;
  }
</style>
