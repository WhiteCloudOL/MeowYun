<script setup lang="ts">
defineProps<{ kind: 'book' | 'cassette' | 'mail' | 'palette' | 'cloud' | 'cup' }>()
</script>
<template>
  <svg
    viewBox="0 0 160 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    class="scene-object"
  >
    <g
      stroke="var(--scene-outline)"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <g v-if="kind === 'book'">
        <path
          d="M27 25Q51 13 80 26Q109 13 136 25V113Q106 102 80 116Q49 102 27 113Z"
          fill="var(--color-blue)"
        />
        <path
          d="M22 19Q50 9 80 24Q110 8 139 18V103Q112 95 80 109Q51 95 22 104Z"
          fill="var(--color-surface)"
        />
        <path
          d="M80 25V108M36 40Q52 35 67 42M36 52Q52 47 67 54M36 64Q52 59 63 64M94 39Q111 33 125 39M94 51Q111 45 125 51"
        />
        <path d="M102 16V74L113 66L124 73V14" fill="var(--color-primary)" />
        <path d="m46 78 4-6 4 6 7 2-6 4v7l-5-4-6 4v-7l-6-4Z" fill="var(--color-secondary)" />
      </g>
      <g v-else-if="kind === 'cassette'">
        <path d="M22 30 139 24 147 118 27 127Z" fill="var(--color-accent)" />
        <rect x="15" y="20" width="127" height="99" rx="13" fill="var(--color-primary)" />
        <path d="M32 33H124V83H32Z" fill="var(--color-surface)" />
        <path d="M42 69H113" stroke-width="12" />
        <circle cx="49" cy="69" r="13" fill="var(--color-background)" />
        <circle cx="108" cy="69" r="13" fill="var(--color-background)" />
        <path d="M49 61v16m-8-8h16m51-8v16m-8-8h16M43 47h51" />
        <path d="m42 119 9-25h53l12 25" fill="var(--color-blue)" />
        <circle cx="28" cy="106" r="2" fill="var(--scene-outline)" />
        <circle cx="130" cy="105" r="2" fill="var(--scene-outline)" />
      </g>
      <g v-else-if="kind === 'mail'">
        <path d="m17 52 61-38 65 34v73H17Z" fill="var(--color-primary)" />
        <path d="M34 76V28h91v56" fill="var(--color-surface)" />
        <path d="M48 43h50M48 55h61M48 67h42" />
        <path d="m17 51 63 39 63-40v71H17Z" fill="var(--color-blue)" />
        <path d="m17 121 54-38m72 38L89 83" />
        <path d="M72 92q-8-10-15 0q-3 7 16 18q20-15 16-20q-7-8-17 2" fill="var(--color-primary)" />
      </g>
      <g v-else-if="kind === 'palette'">
        <path
          d="M20 76C13 24 82 6 118 29S155 79 127 102C110 116 96 99 85 111C61 138 24 114 20 76Z"
          fill="var(--color-surface)"
        />
        <ellipse cx="109" cy="78" rx="12" ry="17" fill="var(--material-wood)" />
        <circle cx="42" cy="57" r="10" fill="var(--color-primary)" />
        <circle cx="68" cy="38" r="10" fill="var(--color-blue)" />
        <circle cx="98" cy="42" r="10" fill="var(--color-accent)" />
        <circle cx="42" cy="87" r="10" fill="var(--color-secondary)" />
        <path d="m68 126 53-96 12 7-53 96Z" fill="var(--color-secondary)" />
        <path d="m121 30 4-18q23 7 8 25Z" fill="var(--color-link)" />
      </g>
      <g v-else-if="kind === 'cup'">
        <path d="M113 54h19q22 25-17 35" stroke-width="8" />
        <path d="M28 44h89v60q-42 31-85 0Z" fill="var(--color-blue)" />
        <ellipse cx="73" cy="45" rx="46" ry="12" fill="var(--color-surface)" />
        <path d="M47 47h49" stroke="var(--color-link)" />
        <path d="M59 30q-14-12 0-24m26 24q-14-12 0-24" stroke="var(--color-text-muted)" />
        <path d="M54 83q18 18 36 0" />
        <ellipse cx="70" cy="123" rx="62" ry="7" fill="var(--color-primary-soft)" />
      </g>
      <g v-else>
        <path
          d="M27 96C3 85 11 58 34 58C28 25 64 14 84 41C110 18 139 40 134 65C161 74 144 102 126 100Z"
          fill="var(--scene-cloud)"
        />
        <path class="guide-eye" d="M56 68v8m39-8v8" stroke-width="5" />
        <path d="M68 83q8 7 16 0" />
        <path d="M44 85h7m52 0h7" stroke="var(--color-primary)" stroke-width="7" />
        <path d="m77 26 4-10 4 10 10 3-10 3-4 10-4-10-10-3Z" fill="var(--color-primary)" />
      </g>
    </g>
  </svg>
</template>
<style scoped>
.scene-object {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}
</style>
