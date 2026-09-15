<script setup lang="ts">
withDefaults(defineProps<{ kind?: string; tone?: 'rose' | 'blue' | 'mint' | 'lilac' }>(), {
  kind: 'cloud',
  tone: 'blue',
})
</script>
<template>
  <svg
    class="soft-illustration"
    :style="{ '--illustration-tone': 'var(--tone-' + tone + ')' }"
    viewBox="0 0 220 160"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M24 89C10 51 53 20 83 31C109 0 164 18 168 46C207 33 225 78 199 105C214 138 163 152 140 135C95 163 47 149 44 121C27 121 16 106 24 89Z"
      fill="rgb(var(--illustration-tone) / .38)"
    />
    <path
      d="M35 66C39 44 59 38 74 41"
      stroke="var(--color-rim)"
      stroke-width="5"
      stroke-linecap="round"
    />
    <g
      class="illustration-object"
      stroke="var(--color-link)"
      stroke-width="1.7"
      stroke-linejoin="round"
      stroke-linecap="round"
    >
      <g v-if="kind === 'garden'">
        <path
          d="M26 129Q71 106 109 128Q153 105 193 130"
          stroke="rgb(var(--tone-mint))"
          stroke-width="13"
        />
        <path
          d="M48 122V66M48 94Q23 92 26 77Q46 75 48 94M48 111Q72 105 70 91Q53 92 48 111"
          fill="rgb(var(--tone-mint))"
        />
        <path
          d="M48 66C22 71 20 45 37 43C31 23 59 19 62 37C83 34 85 59 64 65C62 83 42 82 48 66Z"
          fill="rgb(var(--tone-rose))"
        />
        <circle cx="51" cy="51" r="8" fill="var(--color-surface)" />
        <path d="M90 60H159L165 129H84Z" fill="var(--color-surface)" />
        <path
          d="M89 61L103 48H148L160 61M94 115H154"
          stroke="rgb(var(--tone-blue))"
          stroke-width="4"
        />
        <path
          d="M125 110V82M125 94Q101 92 106 74Q125 74 125 94M125 103Q149 103 149 82Q128 83 125 103"
          fill="rgb(var(--tone-mint))"
        />
        <path
          d="M176 124V104Q166 96 168 88M177 109Q191 106 190 95"
          stroke="rgb(var(--tone-mint))"
          stroke-width="4"
        />
      </g>
      <g v-else-if="kind === 'mail'">
        <path
          d="M45 70L107 28Q111 25 116 29L179 74V125Q179 134 169 134H54Q44 134 44 125Z"
          fill="rgb(var(--tone-blue) / .75)"
        />
        <path d="M63 87V43Q63 36 72 36H152Q160 36 160 45V91" fill="var(--color-surface)" />
        <path d="M79 52H141M79 64H123" stroke="rgb(var(--tone-lilac))" stroke-width="4" />
        <path
          d="M44 72L108 111Q112 114 117 111L179 74V125Q179 134 169 134H54Q44 134 44 125Z"
          fill="rgb(var(--tone-rose))"
        />
        <path d="M47 129L91 96M176 129L132 96" opacity=".4" />
        <path
          d="M105 92C96 80 80 94 112 113C143 94 127 80 117 91L112 97Z"
          fill="var(--color-surface)"
          stroke="none"
        />
      </g>
      <g v-else-if="kind === 'palette'">
        <path
          d="M112 28C55 25 31 70 51 113C67 150 105 137 108 115C111 98 126 100 132 112C144 133 180 109 181 76C181 46 148 28 112 28Z"
          fill="var(--color-surface)"
        />
        <circle cx="81" cy="61" r="12" fill="rgb(var(--tone-rose))" stroke="none" />
        <circle cx="118" cy="48" r="12" fill="rgb(var(--tone-blue))" stroke="none" />
        <circle cx="153" cy="67" r="12" fill="rgb(var(--tone-mint))" stroke="none" />
        <circle cx="71" cy="100" r="12" fill="rgb(var(--tone-lilac))" stroke="none" />
        <circle cx="127" cy="81" r="9" fill="rgb(var(--illustration-tone) / .5)" />
        <path d="M141 120L171 139Q178 143 181 135L149 112" fill="rgb(var(--tone-blue))" />
        <path d="M148 113Q146 98 130 104Q132 122 144 122Z" fill="rgb(var(--tone-rose))" />
      </g>
      <g v-else-if="kind === 'clock'">
        <path
          d="M49 71C32 59 42 36 62 40C71 13 104 21 107 39C133 24 148 49 137 63"
          fill="var(--color-surface)"
        />
        <circle cx="119" cy="86" r="49" fill="rgb(var(--tone-mint))" />
        <circle cx="119" cy="86" r="38" fill="var(--color-surface)" />
        <path d="M119 61V86L137 98" stroke-width="4" />
        <path d="M83 131L77 141M154 131L160 141" stroke-width="5" />
        <circle cx="119" cy="86" r="4" fill="var(--color-link)" stroke="none" />
      </g>
      <g v-else-if="kind === 'book-open' || kind === 'book'">
        <path
          d="M39 45Q72 28 110 48Q145 28 180 45V125Q145 107 110 129Q75 109 39 125Z"
          fill="rgb(var(--tone-lilac))"
        />
        <path
          d="M46 38Q78 26 110 45Q142 25 173 38V116Q141 104 110 122Q77 103 46 116Z"
          fill="var(--color-surface)"
        />
        <path
          d="M110 47V120M60 60Q78 56 94 65M60 77Q78 73 94 82M60 94Q78 90 94 99M126 63Q142 55 158 59M126 80Q142 72 158 77"
          stroke="rgb(var(--tone-blue))"
          stroke-width="4"
        />
        <path d="M143 35V73L154 65L163 72V36" fill="rgb(var(--tone-rose))" stroke="none" />
      </g>
      <g v-else-if="kind === 'terminal' || kind === 'code'">
        <rect x="37" y="36" width="145" height="100" rx="21" fill="var(--color-surface)" />
        <path d="M37 59H182" stroke="rgb(var(--tone-blue))" />
        <circle cx="53" cy="48" r="3" fill="rgb(var(--tone-rose))" stroke="none" />
        <circle cx="65" cy="48" r="3" fill="rgb(var(--tone-mint))" stroke="none" />
        <path d="M62 80L80 94L62 108M94 110H135" stroke-width="5" />
        <path
          d="M157 105Q170 96 180 109Q190 118 178 131L164 137L153 120Z"
          fill="rgb(var(--tone-rose))"
          stroke="none"
        />
      </g>
      <g v-else-if="kind === 'box' || kind === 'folder'">
        <path d="M61 65L111 89L163 64V118L112 143L61 118Z" fill="rgb(var(--tone-blue))" />
        <path d="M61 65L112 39L163 64L112 91Z" fill="var(--color-surface)" />
        <path d="M112 91V143M86 52L136 77V101L126 98V81" fill="rgb(var(--tone-rose))" />
        <path
          d="M61 65L45 46L96 21L112 39M163 64L178 46L129 21L112 39"
          fill="rgb(var(--tone-mint) / .7)"
        />
      </g>
      <g
        v-else-if="
          kind === 'gamepad' || kind === 'users' || kind === 'message-circle' || kind === 'server'
        "
      >
        <path d="M109 40V26" stroke-width="4" />
        <circle cx="109" cy="21" r="8" fill="rgb(var(--tone-rose))" />
        <rect x="48" y="40" width="125" height="90" rx="34" fill="var(--color-surface)" />
        <rect
          x="65"
          y="60"
          width="91"
          height="44"
          rx="19"
          fill="rgb(var(--tone-blue) / .5)"
          stroke="none"
        />
        <path d="M86 79V87M133 79V87M100 111Q111 121 123 111" stroke-width="4" />
        <path
          d="M45 73Q29 70 33 99L47 104M176 73Q193 70 189 99L175 104"
          fill="rgb(var(--tone-mint))"
        />
      </g>
      <g v-else>
        <path
          d="M57 119C22 115 32 72 58 75C54 40 109 24 128 61C165 40 194 80 170 99C189 125 143 138 129 121Z"
          fill="var(--color-surface)"
        />
        <path d="M83 84V91M127 84V91M96 99Q106 109 116 99" stroke-width="3" />
        <ellipse cx="70" cy="99" rx="9" ry="4" fill="rgb(var(--tone-rose))" stroke="none" />
        <ellipse cx="139" cy="99" rx="9" ry="4" fill="rgb(var(--tone-rose))" stroke="none" />
      </g>
    </g>
    <g class="illustration-satellite" fill="rgb(var(--tone-lilac))">
      <path d="M186 20L189 29L199 32L189 36L186 45L183 36L174 32L183 29Z" />
      <circle cx="29" cy="123" r="5" />
    </g>
  </svg>
</template>
<style scoped>
.soft-illustration {
  width: 100%;
  overflow: visible;
}
.illustration-object,
.illustration-satellite {
  transform-origin: center;
  transition: transform 430ms var(--ease-spring-bold);
}
@media (hover: hover) {
  :global(a:hover .soft-illustration .illustration-object),
  :global(.project-card:hover .soft-illustration .illustration-object) {
    transform: translateY(-2px);
  }
  :global(a:hover .soft-illustration .illustration-satellite),
  :global(.project-card:hover .soft-illustration .illustration-satellite) {
    transform: translateY(-2px);
  }
}
:global([data-motion='off'] :is(a, .project-card):hover .soft-illustration .illustration-object),
:global(
  [data-motion='off'] :is(a, .project-card):hover .soft-illustration .illustration-satellite
) {
  transform: none;
}
</style>
