<script setup>
defineProps({
  icon: { type: String, default: 'dashboard' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  search: { type: String, default: '' },
  searchPlaceholder: { type: String, default: 'Buscar...' },
  newLabel: { type: String, default: '' },
  showSearch: { type: Boolean, default: true },
})

defineEmits(['update:search', 'new'])
</script>

<template>
  <header class="hero">
    <div class="hero-glow"></div>
    <div class="hero-content">
      <div class="hero-top">
        <div class="hero-title-wrap">
          <div class="hero-icon">
            <q-icon :name="icon" size="26px" />
          </div>
          <div>
            <h1 class="hero-title">{{ title }}</h1>
            <p v-if="subtitle" class="hero-subtitle">{{ subtitle }}</p>
          </div>
        </div>

        <div class="hero-actions">
          <slot name="actions">
            <q-input
              v-if="showSearch"
              :model-value="search"
              dark
              dense
              borderless
              :placeholder="searchPlaceholder"
              class="hero-search"
              clearable
              @update:model-value="$emit('update:search', $event ?? '')"
            >
              <template #prepend><q-icon name="search" /></template>
            </q-input>
            <q-btn
              v-if="newLabel"
              unelevated
              no-caps
              icon="add"
              :label="newLabel"
              class="btn-accent"
              @click="$emit('new')"
            />
          </slot>
        </div>
      </div>

      <div v-if="$slots.stats" class="stats">
        <slot name="stats" />
      </div>
    </div>
  </header>
</template>

<style scoped>
.hero {
  position: relative;
  border-radius: var(--radius-card);
  padding: 28px 30px;
  overflow: hidden;
  background: var(--grad-surface);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-card);
}
.hero-glow {
  position: absolute;
  top: -90px;
  right: -40px;
  width: 320px;
  height: 320px;
  background: var(--glow-accent);
  filter: blur(20px);
  pointer-events: none;
  animation: infra-glow-pulse 7s ease-in-out infinite;
}
.hero-content {
  position: relative;
  z-index: 1;
}
.hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
}
.hero-title-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
}
.hero-icon {
  width: 52px;
  height: 52px;
  border-radius: 15px;
  display: grid;
  place-items: center;
  color: #fff;
  background: var(--grad-accent);
  box-shadow: var(--shadow-icon);
}
.hero-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-1);
}
.hero-subtitle {
  margin: 2px 0 0;
  font-size: 0.85rem;
  color: var(--text-2);
}
.hero-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.hero-search {
  min-width: 230px;
  padding: 2px 14px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border-soft);
  transition: border-color 0.2s var(--ease);
}
.hero-search:focus-within {
  border-color: var(--border-accent);
}

.stats {
  display: flex;
  gap: 14px;
  margin-top: 24px;
  flex-wrap: wrap;
}

@media (max-width: 480px) {
  .hero-search {
    min-width: 0;
    width: 100%;
  }
  .hero-actions {
    width: 100%;
  }
}
</style>
