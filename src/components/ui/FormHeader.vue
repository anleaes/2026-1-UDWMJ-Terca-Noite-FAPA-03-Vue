<script setup>
defineProps({
  icon: { type: String, default: 'edit' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  backTo: { type: String, default: '' },
})
</script>

<template>
  <header class="form-header">
    <div class="form-header-glow"></div>
    <div class="form-header-content">
      <q-btn
        v-if="backTo"
        flat
        round
        dense
        color="white"
        icon="arrow_back"
        :to="backTo"
        class="back-btn"
      >
        <q-tooltip>Voltar</q-tooltip>
      </q-btn>
      <div class="form-icon">
        <q-icon :name="icon" size="24px" />
      </div>
      <div>
        <h1 class="form-title">{{ title }}</h1>
        <p v-if="subtitle" class="form-subtitle">{{ subtitle }}</p>
      </div>
    </div>
  </header>
</template>

<style scoped>
.form-header {
  position: relative;
  overflow: hidden;
  padding: 24px 28px;
  background: var(--grad-surface);
  border-bottom: 1px solid var(--border-subtle);
}
.form-header-glow {
  position: absolute;
  top: -80px;
  right: -40px;
  width: 260px;
  height: 260px;
  background: var(--glow-accent);
  filter: blur(20px);
  animation: infra-glow-pulse 7s ease-in-out infinite;
}
.form-header-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 14px;
}
.back-btn {
  background: rgba(255, 255, 255, 0.06);
  transition: background 0.2s var(--ease);
}
.back-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}
.form-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: grid;
  place-items: center;
  color: #fff;
  background: var(--grad-accent);
  box-shadow: var(--shadow-icon);
}
.form-title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text-1);
}
.form-subtitle {
  margin: 2px 0 0;
  font-size: 0.82rem;
  color: var(--text-2);
}
</style>
