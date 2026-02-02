<template>
  <div class="success-container">
    <div class="success-card">
      <NuxtLink to="/" class="success-logo">Payment App</NuxtLink>

      <h1 class="success-title">Спасибо! Оплата прошла успешно</h1>
      <p class="success-text">
        Платёж был обработан платёжным провайдером. Вы можете вернуться на главную страницу и
        продолжить работу с сервисом.
      </p>

      <NuxtLink to="/" class="success-button">Вернуться на главную</NuxtLink>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.success-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 20px;
}

.success-card {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 18px;
  padding: 40px 32px;
  width: 100%;
  max-width: 520px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 22px 70px rgba(15, 23, 42, 0.75);
  text-align: center;
}

.success-logo {
  display: inline-block;
  margin-bottom: 22px;
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-decoration: none;
  letter-spacing: 0.06em;
}

.success-title {
  margin: 0 0 16px;
  font-size: 28px;
  font-weight: 700;
  color: #f9fafb;
}

.success-text {
  margin: 0 0 28px;
  font-size: 15px;
  line-height: 1.6;
  color: #cbd5f5;
}

.success-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 28px;
  border-radius: 999px;
  background: linear-gradient(135deg, #667eea 0%, #22c55e 100%);
  color: #f9fafb;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 14px 40px rgba(34, 197, 94, 0.45);
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.success-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 55px rgba(34, 197, 94, 0.6);
}
</style>

