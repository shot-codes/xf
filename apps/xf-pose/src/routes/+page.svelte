<script>
	import { Canvas, InteractiveObject, OrbitControls, T } from '@threlte/core';
	import { spring } from 'svelte/motion';
	import { degToRad } from 'three/src/math/MathUtils';
  import { GLTF } from '@threlte/extras';
  import Character from '$lib/components/Character.svelte';

	const scale = spring(1);
</script>

<div>
	<Canvas>
		<T.PerspectiveCamera makeDefault position={[4, 3, 4]} fov={50}>
			<OrbitControls maxPolarAngle={degToRad(90)} target={{ y: 1.5 }} enableDamping/>
		</T.PerspectiveCamera>

    <T.AxesHelper position={[-1,0,-1]}/>

		<T.DirectionalLight castShadow position={[3, 10, 10]} />
		<T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
		<T.AmbientLight intensity={0.2} />

    <Character />

    <GLTF
      receiveShadow
      position={{y: -0.2, z: -5, x: 1}}
      url="/assets/mf.glb"
    />
    
	</Canvas>
</div>

<style>
	div {
		height: 100%;
		width: 100%;
	}
</style>
