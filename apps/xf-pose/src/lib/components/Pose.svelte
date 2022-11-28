<script lang="ts">
  import type { Results } from "@mediapipe/pose"
  import { Pose, VERSION } from "@mediapipe/pose"
  import { onMount } from 'svelte';

  const options = {
    locateFile: (file: string) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@${VERSION}/${file}`;
  }};

  onMount(() => {
    const pose = new Pose(options);
    console.log(pose);
    pose.onResults(onResults);
  })

  function onResults (results: Results) {
    console.log(results);
  }
</script>

<video class="input_video5"></video>
<canvas class="output5" width="300px" height="150px"></canvas>