<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePocket } from '@/composables/usePocket'
import { searchEntries, matchesSearch } from '@/utils/search'
import { validatePocket, type PocketData } from '@/utils/pocketData'
import StampArt from '@/components/scene/StampArt.vue'
import SaveButton from '@/components/content/SaveButton.vue'
import SearchField from '@/components/ui/SearchField.vue'
import { readableInk } from '@/utils/colors'
const { data, count, stampCatalog, exportData, importData, reset, removePalette } = usePocket()
const query = ref(''),
  tab = ref('全部'),
  message = ref('')
const file = ref<HTMLInputElement>(),
  confirm = ref<HTMLDialogElement>()
const pending = ref<PocketData>()
let previousFocus: HTMLElement | null = null
const entries = computed(() =>
  data.value.favorites
    .map((saved) => ({ saved, item: searchEntries.find((x) => x.id === saved.id) }))
    .filter(
      ({ item }) =>
        (tab.value === '全部' || item?.group === tab.value) &&
        matchesSearch((item?.title ?? '已下架内容') + ' ' + (item?.description ?? ''), query.value),
    ),
)
const reading = computed(() =>
  data.value.reading
    .map((r) => ({ ...r, item: searchEntries.find((x) => x.id === r.id) }))
    .filter((r) => r.item && r.progress > 0.01),
)
function exportBackup() {
  const url = URL.createObjectURL(new Blob([exportData()], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = '云上小屋-我的口袋.json'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
  message.value = '已导出本地口袋备份。'
}
async function readBackup(event: Event) {
  const input = event.target as HTMLInputElement,
    selected = input.files?.[0]
  if (!selected) return
  try {
    if (selected.size > 256 * 1024) throw Error('备份不得超过 256KB。')
    pending.value = validatePocket(JSON.parse(await selected.text()))
    openConfirm()
  } catch (error) {
    message.value = error instanceof Error ? error.message : '备份无法读取。'
  } finally {
    input.value = ''
  }
}
function requestReset() {
  pending.value = undefined
  openConfirm()
}
function openConfirm() {
  previousFocus = document.activeElement as HTMLElement
  confirm.value?.showModal()
}
function restoreFocus() {
  previousFocus?.focus()
}
function apply() {
  if (pending.value) {
    message.value = importData(pending.value)
      ? '备份已恢复到当前浏览器。'
      : '已载入到本次访问，浏览器未能持久保存。'
  } else {
    message.value = reset()
      ? '口袋与漫游记录已重置。'
      : '本次访问的口袋已清空，但未能改写浏览器记录。'
  }
  confirm.value?.close()
}
</script>
<template>
  <div class="pocket-view page-shell page-content">
    <header class="pocket-heading">
      <div>
        <span class="material-label">只属于这次漫游的你</span>
        <h1>我的小口袋</h1>
        <p>喜欢的东西，先装好。下次还可以接着看。</p>
      </div>
      <span class="pocket-shape" aria-hidden="true">♥<i></i></span>
    </header>
    <p class="local-explanation">
      保存在当前浏览器，不上传、不代表全站统计。清理浏览器数据会移除记录，换设备可使用备份导入。
    </p>
    <section class="pocket-bag" aria-label="收藏的内容">
      <div class="pocket-bag__seam">
        <h2>口袋里的 {{ count }} 件小东西</h2>
        <RouterLink to="/#discovery" class="text-link">再去发现一点 →</RouterLink>
      </div>
      <template v-if="count"
        ><SearchField
          v-model="query"
          label="搜索口袋"
          name="pocket-search"
          placeholder="找找收藏的文章、作品或站点"
        />
        <div class="pocket-tabs">
          <button
            v-for="group in ['全部', '文章', '项目', '站点']"
            :key="group"
            type="button"
            class="chip"
            :aria-pressed="tab === group"
            @click="tab = group"
          >
            {{ group }}
          </button>
        </div>
        <div class="pocket-entries">
          <article v-for="{ saved, item } in entries" :key="saved.id">
            <span class="entry-type">{{ item?.group ?? '已下架' }}</span>
            <div>
              <h3>
                <RouterLink v-if="item?.href.startsWith('/')" :to="item.href">{{
                  item.title
                }}</RouterLink
                ><a v-else-if="item" :href="item.href" target="_blank" rel="noopener noreferrer"
                  >{{ item.title }} ↗</a
                ><span v-else>原内容已不在公开索引</span>
              </h3>
              <p>{{ item?.description ?? saved.id }}</p>
            </div>
            <SaveButton :id="saved.id" compact />
          </article>
        </div>
        <p v-if="!entries.length" class="muted">没有找到，换个词或切回全部试试。</p></template
      >
      <div v-else class="pocket-empty">
        <p>
          口袋还是空的。给喜欢的文章或作品按一下爱心，<br />它就会出现在这里，也会留下一枚印章。
        </p>
        <RouterLink to="/articles" class="cottage-button cottage-button--blue"
          >去书架挑一篇 →</RouterLink
        >
      </div>
    </section>
    <section v-if="reading.length || data.later.length" class="reading-shelf">
      <h2>留着慢慢看</h2>
      <div v-for="record in reading" :key="record.id">
        <RouterLink :to="record.item!.href" class="text-link">{{ record.item!.title }} →</RouterLink
        ><span>上次浏览到约 {{ Math.round(record.progress * 100) }}%</span>
      </div>
      <div v-for="id in data.later" :key="id">
        <RouterLink
          v-if="searchEntries.find((e) => e.id === id)"
          :to="searchEntries.find((e) => e.id === id)!.href"
          class="text-link"
          >稍后读 · {{ searchEntries.find((e) => e.id === id)!.title }} →</RouterLink
        >
      </div>
    </section>
    <section class="roaming-passport">
      <header>
        <span>✦</span>
        <div>
          <h2>我的漫游护照</h2>
          <p>不设关卡，不用打卡。每枚印章来自一次真实的小动作。</p>
        </div>
      </header>
      <div class="passport-stamps">
        <div v-for="stamp in stampCatalog" :key="stamp.id">
          <StampArt
            :id="stamp.id"
            :locked="!data.stamps.some((s) => s.id === stamp.id)"
          /><strong>{{ stamp.label }}</strong>
          <p>{{ stamp.reason }}</p>
          <small>{{
            data.stamps.some((s) => s.id === stamp.id) ? '已收集' : '还没有留下印记'
          }}</small>
        </div>
      </div>
      <RouterLink to="/lab/postcard" class="cottage-button">把印章贴在明信片上 ↗</RouterLink>
    </section>
    <section v-if="data.palettes.length" class="saved-palettes">
      <h2>口袋里的颜色</h2>
      <article v-for="palette in data.palettes" :key="palette.id">
        <strong>{{ palette.name }}</strong
        ><button
          type="button"
          class="text-link palette-remove"
          :aria-label="'删除配色 ' + palette.name"
          @click="removePalette(palette.id)"
        >
          删除
        </button>
        <div>
          <span
            v-for="color in palette.colors"
            :key="color"
            :style="{ background: color, color: readableInk(color) }"
            >{{ color }}</span
          >
        </div>
      </article>
    </section>
    <section class="pocket-management">
      <h2>整理与备份</h2>
      <div>
        <button type="button" class="chip" @click="exportBackup">导出本地备份 ↓</button
        ><button type="button" class="chip" @click="file?.click()">导入备份 ↑</button
        ><button type="button" class="chip" @click="requestReset">重置我的口袋</button
        ><input
          ref="file"
          type="file"
          accept="application/json,.json"
          hidden
          @change="readBackup"
        />
      </div>
      <p role="status">{{ message }}</p>
    </section>
    <dialog
      ref="confirm"
      class="cottage-dialog"
      aria-labelledby="pocket-confirm"
      @close="restoreFocus"
    >
      <h2 id="pocket-confirm">{{ pending ? '恢复这个备份？' : '重置本地口袋？' }}</h2>
      <p>
        {{
          pending
            ? '恢复将替换当前收藏、印章、配色与阅读记录。请先导出当前备份。'
            : '这会清空当前浏览器里的收藏、印章、配色、专注和阅读记录。'
        }}
      </p>
      <div>
        <button type="button" class="chip" @click="confirm?.close()">保留当前记录</button
        ><button type="button" class="cottage-button" @click="apply">
          {{ pending ? '确认恢复' : '确认重置' }}
        </button>
      </div>
    </dialog>
  </div>
</template>
<style scoped>
.pocket-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}
.pocket-heading h1 {
  font-size: var(--text-2xl);
}
.pocket-heading p {
  margin-top: 0.6rem;
  color: var(--color-text-secondary);
}
.pocket-shape {
  position: relative;
  display: grid;
  place-items: center;
  width: 6rem;
  height: 7rem;
  background: var(--color-primary);
  border: 1px solid var(--color-rim);
  border-radius: 8px 8px 40px 40px;
  font-size: 2.3rem;
  color: var(--color-surface);
  transform: rotate(12deg);
  box-shadow: var(--shadow-card);
}
.pocket-shape i {
  position: absolute;
  inset: 8px;
  border: 2px dashed var(--color-surface);
  border-radius: 3px 3px 30px 30px;
}
.local-explanation {
  max-width: 48rem;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}
.pocket-bag {
  padding: 2rem;
  background: var(--color-blue-soft);
  border: 1px solid var(--color-rim);
  border-radius: 16px 16px 55px 55px;
  box-shadow: var(--shadow-card);
}
.pocket-bag__seam {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  border-bottom: 2px dashed var(--color-blue);
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}
.pocket-bag h2 {
  font-size: var(--text-lg);
}
.pocket-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-block: 1rem;
}
.pocket-entries article {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid var(--color-border);
}
.entry-type {
  writing-mode: vertical-rl;
  letter-spacing: 0.25em;
  color: var(--color-link);
  font-size: var(--text-xs);
}
.pocket-entries article > div {
  flex: 1;
  min-width: 0;
}
.pocket-entries h3 {
  font-size: var(--text-lg);
}
.pocket-entries h3 a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
}
.pocket-entries p {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
.pocket-empty {
  padding: 1.5rem 0;
  display: grid;
  justify-items: start;
  gap: 1.5rem;
}
.roaming-passport {
  position: relative;
  margin-block: 4rem;
  padding: 2rem 2.5rem;
  border: 1px solid var(--color-rim);
  border-radius: var(--radius-jelly);
  background: linear-gradient(135deg, rgb(var(--tone-rose) / 0.15), var(--color-surface-glass) 60%);
  box-shadow: var(--shadow-card);
}

.roaming-passport header {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.roaming-passport header > span {
  font-size: 3rem;
  color: var(--color-link);
}
.roaming-passport h2 {
  font-size: var(--text-xl);
}
.roaming-passport p {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}
.passport-stamps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2rem;
  margin-block: 2rem;
}
.passport-stamps > div {
  text-align: center;
}
.passport-stamps :deep(.stamp-art) {
  margin: 0 auto 1rem;
}
.passport-stamps strong {
  font-size: var(--text-sm);
}
.passport-stamps small {
  font-size: var(--text-xs);
  color: var(--color-link);
}
.pocket-management h2,
.reading-shelf h2,
.saved-palettes h2 {
  font-size: var(--text-xl);
  margin-bottom: 1rem;
}
.pocket-management > div {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.pocket-management > p {
  margin-top: 0.8rem;
  font-size: var(--text-sm);
}
.reading-shelf {
  margin-top: 3rem;
}
.reading-shelf > div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.reading-shelf span {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}
.saved-palettes {
  margin-bottom: 3rem;
}
.palette-remove {
  margin-left: 1rem;
}
.saved-palettes article > div {
  display: flex;
  flex-wrap: wrap;
  margin: 1rem 0;
}
.saved-palettes article span {
  padding: 2rem 0.8rem 0.5rem;
  font: 12px monospace;
}
@media (max-width: 600px) {
  .pocket-bag {
    padding: 1.2rem;
    border-radius: 14px 14px 30px 30px;
  }
  .pocket-shape {
    width: 4.5rem;
    height: 5rem;
    flex-shrink: 0;
  }
  .pocket-heading p {
    font-size: var(--text-sm);
  }
  .roaming-passport {
    padding: 1.3rem 1.5rem;
  }
  .passport-stamps {
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem 1rem;
  }
  .passport-stamps :deep(.stamp-art) {
    width: 6rem;
  }
}
</style>
