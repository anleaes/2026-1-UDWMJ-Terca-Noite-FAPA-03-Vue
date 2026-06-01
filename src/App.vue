<script setup>
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <RouterLink class="navbar-brand" to="/">
        <i class="bi bi-building me-1"></i> InfraestruturaApp
      </RouterLink>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/companies">
              <i class="bi bi-building me-1"></i>Empresas
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <div class="container mt-4">
    <RouterView />
  </div>
</template>
