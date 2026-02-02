<template>
  <AuthCard title="Регистрация">
    <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="name">Имя</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="Ваше имя"
            required
            minlength="2"
          />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="your@email.com"
            required
          />
        </div>
        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            required
            minlength="6"
          />
        </div>
        <button type="submit" class="auth-button" :disabled="loading">
          {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>
    </form>

    <div v-if="errors.length" class="auth-error">
      <p class="auth-error-title">Пожалуйста, исправьте ошибки:</p>
      <ul class="auth-error-list">
        <li v-for="(msg, index) in errors" :key="index">
          {{ msg }}
        </li>
      </ul>
    </div>

    <p class="auth-link">
      Уже есть аккаунт?
      <NuxtLink to="/login">Войти</NuxtLink>
    </p>
  </AuthCard>
</template>

<script setup>
import { reactive, ref } from 'vue'
import AuthCard from '~/components/AuthCard.vue'

const form = reactive({
  name: '',
  email: '',
  password: ''
})

const loading = ref(false)
const errors = ref([])
const config = useRuntimeConfig()

const handleRegister = async () => {
  errors.value = []

  try {
    loading.value = true
    
    const response = await $fetch('/auth/register', {
      baseURL: config.public.apiBase,
      method: 'POST',
      body: {
        email: form.email,
        name: form.name,
        password: form.password
      }
    })

    const token = useCookie('accessToken', {
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'strict',
      path: '/'
    })
    
    token.value = response && response.accessToken ? response.accessToken : null

    const refreshExpires = useCookie('refreshTokenExpires', {
      sameSite: 'strict',
      path: '/'
    })
    refreshExpires.value =
      response && response.refreshTokenExpires ? response.refreshTokenExpires : null
    
    await navigateTo('/')
    
  } catch (err) {
    console.error('Registration error:', err)

    const messages = []
    const data = err && err.data
    const backendMessage = data && data.message

    if (Array.isArray(backendMessage)) {
      messages.push(...backendMessage)
    } else if (typeof backendMessage === 'string') {
      messages.push(backendMessage)
    } else {
      messages.push(
        'Не удалось зарегистрироваться. Проверьте поля формы или попробуйте другой email.'
      )
    }

    errors.value = messages
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-form {
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

.auth-button {
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

.auth-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

.auth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-link {
  text-align: center;
  margin-top: 24px;
  color: #b0b0b0;
  font-size: 14px;
}

.auth-link a {
  color: #86efac;
  text-decoration: none;
  font-weight: 600;
}

.auth-link a:hover {
  text-decoration: underline;
  color: #a7f3d0;
}

.auth-error {
  margin-top: 20px;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(248, 113, 113, 0.12);
  border: 1px solid rgba(248, 113, 113, 0.6);
}

.auth-error-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: #fecaca;
}

.auth-error-list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.auth-error-list li {
  font-size: 13px;
  color: #fee2e2;
}
</style>