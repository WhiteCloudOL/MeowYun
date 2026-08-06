<script setup lang="ts">
import type { Component } from 'vue'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Activity,
  Archive,
  BookOpen,
  Box,
  Clock3,
  Cloud,
  Compass,
  Code2,
  Database,
  ExternalLink,
  Feather,
  Folder,
  Gamepad2,
  Github,
  Heart,
  Home,
  Layers3,
  Link,
  Mail,
  MapPin,
  MessageCircle,
  Moon,
  Palette,
  PawPrint,
  Rocket,
  Rss,
  Server,
  Sparkles,
  Sun,
  Terminal,
  TvMinimalPlay,
  UserRound,
  Users,
  Zap,
} from 'lucide-vue-next'
import type { SiteIcon } from '@/types/icon'

withDefaults(
  defineProps<{
    name: SiteIcon
    size?: number
    strokeWidth?: number
  }>(),
  {
    size: 18,
    strokeWidth: 1.8,
  },
)

const icons: Record<SiteIcon, Component> = {
  activity: Activity,
  archive: Archive,
  'arrow-down': ArrowDown,
  'arrow-right': ArrowRight,
  'arrow-up-right': ArrowUpRight,
  article: Feather,
  'book-open': BookOpen,
  box: Box,
  clock: Clock3,
  cloud: Cloud,
  compass: Compass,
  code: Code2,
  database: Database,
  'external-link': ExternalLink,
  feather: Feather,
  folder: Folder,
  gamepad: Gamepad2,
  github: Github,
  heart: Heart,
  home: Home,
  layers: Layers3,
  link: Link,
  mail: Mail,
  'map-pin': MapPin,
  'message-circle': MessageCircle,
  moon: Moon,
  palette: Palette,
  'paw-print': PawPrint,
  rocket: Rocket,
  rss: Rss,
  server: Server,
  sparkles: Sparkles,
  sun: Sun,
  terminal: Terminal,
  user: UserRound,
  users: Users,
  video: TvMinimalPlay,
  zap: Zap,
}
</script>

<template>
  <component
    :is="icons[name]"
    class="icon-glyph"
    :size="size"
    :stroke-width="strokeWidth"
    aria-hidden="true"
  />
</template>

<style scoped>
.icon-glyph {
  flex: none;
}
</style>
