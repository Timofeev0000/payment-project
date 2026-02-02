<template>
  <div class="dashboard">
    <Header />
    <main class="main-content">
      <div class="payment-card">
        <h2 class="payment-title">Создать платеж</h2>
        <form @submit.prevent="handlePayment" class="payment-form">
          <div class="form-group">
            <label for="amount">Сумма (₽)</label>
            <input
              id="amount"
              v-model="state.amount"
              type="number"
              min="1"
              placeholder="1000"
              required
            />
          </div>
          <div class="form-group">
            <label for="description">Описание</label>
            <input
              id="description"
              v-model="state.description"
              type="text"
              placeholder="Оплата услуг"
            />
          </div>
          <button type="submit" class="payment-button" :disabled="loading">
            {{ loading ? 'Создание...' : 'Оплатить' }}
          </button>
        </form>

        <div v-if="errors.length" class="payment-error">
          <p class="payment-error-title">Не получилось создать платёж:</p>
          <ul class="payment-error-list">
            <li v-for="(msg, index) in errors" :key="index">
              {{ msg }}
            </li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const state = reactive({
  amount: '',
  description: ''
})

const loading = ref(false)
const paymentUrl = ref(null)
const errors = ref([])

const handlePayment = async () => {
  const token = useCookie('accessToken')

  if (!token.value) {
    errors.value = ['Сначала нужно авторизоваться, чтобы создать платеж.']
    return
  }

  loading.value = true
  paymentUrl.value = null
  errors.value = []

  const config = useRuntimeConfig()

  try {
    const response = await $fetch('/payments', {
      baseURL: config.public.apiBase,
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token.value
      },
      body: {
        amount: state.amount,
        description: state.description
      }
    })

    paymentUrl.value = response
    if (response) {
      await navigateTo(response, {external: true,  open: {
      target: "_blank",
  }} )
    }
  } catch (err) {
    console.error('Payment error:', err)

    const messages = []
    const data = err && err.data
    const backendMessage = data && data.message

    if (Array.isArray(backendMessage)) {
      messages.push(...backendMessage)
    } else if (typeof backendMessage === 'string') {
      messages.push(backendMessage)
    } else {
      messages.push('Не удалось создать платеж. Попробуйте ещё раз.')
    }

    errors.value = messages
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #e0e0e0;
}

.logout-button {
  padding: 8px 16px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #fca5a5;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-button:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.5);
  transform: translateY(-1px);
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.payment-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.payment-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 32px;
  text-align: center;
  color: #ffffff;
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #b0b0b0;
}

.form-group input {
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 16px;
  color: #ffffff;
  transition: all 0.2s;
  outline: none;
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.form-group input:focus {
  background: rgba(255, 255, 255, 0.08);
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.payment-button {
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 8px;
}

.payment-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

.payment-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.payment-success {
  margin-top: 24px;
  padding: 20px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  text-align: center;
}

.payment-success p {
  margin: 0 0 12px;
  color: #86efac;
  font-weight: 600;
}

.payment-link {
  display: inline-block;
  padding: 10px 20px;
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.4);
  border-radius: 6px;
  color: #86efac;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
}

.payment-link:hover {
  background: rgba(34, 197, 94, 0.3);
  transform: translateY(-1px);
}

.payment-error {
  margin-top: 20px;
  padding: 14px 16px;
  border-radius: 10px;
  background: rgba(248, 113, 113, 0.12);
  border: 1px solid rgba(248, 113, 113, 0.6);
}

.payment-error-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: #fecaca;
}

.payment-error-list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.payment-error-list li {
  font-size: 13px;
  color: #fee2e2;
}
</style>