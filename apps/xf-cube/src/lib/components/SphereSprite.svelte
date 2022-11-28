<script lang="ts">
  import { T } from "@threlte/core";
  import { HTML } from "@threlte/extras";

  const rotationAngles = [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180];
</script>

<!-- 
The idea with this component is to mock some 3d object with a sprite.
This is required because we currently don't use the occlude property of 
the HTML elements provided by the extras.default
-->

<T.Group>
  {#each rotationAngles as angle}
    <T.Mesh rotation.y={angle * (Math.PI / 180)}>
      <HTML transform>
        <div style="width: 1200px;">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1300 1300"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xml:space="preserve"
            style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"
            ><circle cx="650" cy="30.528" r="12.56" style="fill:#fff;" /><circle
              cx="887.311"
              cy="77.585"
              r="12.56"
              style="fill:#fff;"
            /><circle cx="1088.5" cy="211.166" r="12.56" style="fill:#fff;" /><circle
              cx="1221.52"
              cy="412.954"
              r="12.56"
              style="fill:#fff;"
            /><circle cx="1269.52" cy="649.701" r="12.56" style="fill:#fff;" /><circle
              cx="1222.24"
              cy="887.677"
              r="12.56"
              style="fill:#fff;"
            /><circle cx="1088.5" cy="1088.42" r="12.56" style="fill:#fff;" /><circle
              cx="887.891"
              cy="1221.01"
              r="12.56"
              style="fill:#fff;"
            /><circle cx="651.427" cy="1267.75" r="12.56" style="fill:#fff;" /><circle
              cx="412.108"
              cy="1221.1"
              r="12.56"
              style="fill:#fff;"
            /><circle cx="210.831" cy="1086.81" r="12.56" style="fill:#fff;" /><circle
              cx="76.3"
              cy="886.993"
              r="12.56"
              style="fill:#fff;"
            /><circle cx="32.502" cy="653.424" r="12.56" style="fill:#fff;" /><circle
              cx="76.3"
              cy="414.988"
              r="12.56"
              style="fill:#fff;"
            /><circle cx="212.863" cy="211.327" r="12.56" style="fill:#fff;" /><circle
              cx="414.333"
              cy="78.914"
              r="12.56"
              style="fill:#fff;"
            /></svg
          >
        </div>
      </HTML>
    </T.Mesh>
  {/each}
</T.Group>
