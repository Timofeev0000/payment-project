<template>
  <header class="header">
    <div class="header-content">
      <h1 class="logo">Payment App</h1>

      <div v-if="showAuthControls" class="auth-actions">
        <div class="user-section" v-if="isAuthenticated">
          <button @click="handleLogout" class="logout-button">Выйти</button>
        </div>

        <div class="auth-section" v-else>
          <NuxtLink to="/login" class="auth-link-button">Авторизация</NuxtLink>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  showAuthControls: {
    type: Boolean,
    default: true,
  },
})

const config = useRuntimeConfig()
const token = useCookie('accessToken')

const isAuthenticated = computed(() => !!token.value)

const handleLogout = async () => {
  try {
    await $fetch('/auth/logout', {
      baseURL: config.public.apiBase,
      method: 'POST'
    })
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    token.value = null
    await navigateTo('/login')
  }
}
</script>

<style scoped>
.header {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.auth-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logout-button,
.auth-link-button {
  padding: 10px 20px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: radial-gradient(circle at top left, rgba(129, 140, 248, 0.35), rgba(59, 130, 246, 0.15))
      border-box,
    linear-gradient(135deg, rgba(129, 140, 248, 0.4), rgba(56, 189, 248, 0.3)) padding-box;
  color: #e5e7eb;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease,
    border-color 0.18s ease;
}

.logout-button:hover,
.auth-link-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.45);
  border-color: rgba(129, 140, 248, 0.7);
}

.logout-button {
  background: radial-gradient(circle at top left, rgba(248, 113, 113, 0.4), rgba(239, 68, 68, 0.18))
      border-box,
    linear-gradient(135deg, rgba(248, 113, 113, 0.5), rgba(239, 68, 68, 0.3)) padding-box;
  border-color: rgba(248, 113, 113, 0.7);
}

.logout-button:hover {
  box-shadow: 0 10px 30px rgba(248, 113, 113, 0.55);
}

.auth-link-button {
  padding-inline: 22px;
}
</style>