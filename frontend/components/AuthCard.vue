<template>
  <div class="auth-container">
    <div class="auth-card">
      <NuxtLink to="/" class="auth-logo">Payment App</NuxtLink>
      <h1 class="auth-title">{{ title }}</h1>
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 20px;
}

.auth-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.auth-logo {
  display: inline-block;
  margin: 0 auto 25px;
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  text-decoration: none;
  letter-spacing: 0.04em;
  transition: transform 0.2s, box-shadow 0.2s;
}

.auth-logo:hover {
  text-decoration: underline;
  transform: translateY(-2px);
}

.auth-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 32px;
  text-align: center;
  color: #ffffff;
}
</style>

