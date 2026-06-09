<script setup>
defineProps({
  columns: { type: Array, required: true },
  rows: { type: Number, default: 6 },
})
</script>

<template>
  <q-card flat class="skeleton-card">
    <table class="skeleton-table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.name" :class="`text-${col.align || 'left'}`">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r">
          <td v-for="col in columns" :key="col.name">
            <div class="cell" :class="`cell-${col.align || 'left'}`">
              <q-skeleton
                v-if="col.name !== 'actions'"
                type="text"
                dark
                :width="`${40 + ((r * 13 + col.name.length * 7) % 45)}%`"
                animation="wave"
              />
              <template v-else>
                <q-skeleton type="QBtn" size="28px" dark animation="wave" />
                <q-skeleton type="QBtn" size="28px" dark animation="wave" />
              </template>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </q-card>
</template>

<style scoped>
.skeleton-card {
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-card);
}
.skeleton-table {
  width: 100%;
  border-collapse: collapse;
}
.skeleton-table th {
  text-align: left;
  background: rgba(255, 255, 255, 0.02);
  color: var(--text-3);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.7px;
  font-weight: 600;
  border-bottom: 1px solid var(--border-subtle);
  padding: 16px;
}
.skeleton-table td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 14px 16px;
}
.cell {
  display: flex;
  gap: 8px;
}
.cell-center {
  justify-content: center;
}
.cell-right {
  justify-content: flex-end;
}
</style>
