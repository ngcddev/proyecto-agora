<template>
  <div class="login-page">
    <div class="login-card">

      <div class="login-card__brand">
        <svg width="40" height="40" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="17" stroke="white" stroke-width="1.5"/>
          <path d="M18 8C18 8 10 14 10 20C10 24.4 13.6 28 18 28C22.4 28 26 24.4 26 20C26 14 18 8 18 8Z"
                stroke="white" stroke-width="1.5" fill="none"/>
          <circle cx="18" cy="20" r="2.5" fill="white"/>
        </svg>
        <span class="login-card__brand-name">Ágora</span>
      </div>

      <h1 class="login-card__title">Admin Access</h1>
      <p class="login-card__sub">Sign in to manage elections and candidates.</p>

      <form class="login-form" @submit.prevent="handleLogin" novalidate>
        <div class="field">
          <label class="field__label">Email</label>
          <input
            v-model="email"
            class="field__input"
            type="email"
            placeholder="admin@voto.com"
            autocomplete="email"
            required
          />
        </div>
        <div class="field">
          <label class="field__label">Password</label>
          <input
            v-model="password"
            class="field__input"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            autocomplete="current-password"
            required
            @keyup.enter="handleLogin"
          />
        </div>

        <p v-if="authStore.error" class="login-form__error" role="alert">
          {{ authStore.error }}
        </p>

        <button type="submit" class="btn btn--filled login-form__btn" :disabled="authStore.loading">
          {{ authStore.loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>

      <RouterLink to="/" class="login-card__back">← Back to site</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router    = useRouter()
const authStore = useAuthStore()

const email        = ref('')
const password     = ref('')
const showPassword = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) return
  const ok = await authStore.login(email.value, password.value)
  if (ok) router.push('/admin')
}
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 2.5rem 2rem;
  background: #141414;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-card__brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.5rem;
}
.login-card__brand-name {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
  font-weight: 600;
}
.login-card__title {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 700;
}
.login-card__sub {
  font-family: 'Crimson Pro', serif;
  font-size: 0.95rem;
  color: rgba(255,255,255,0.5);
  margin-bottom: 0.5rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 0.5rem;
}
.login-form__error {
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  color: #ff6b6b;
}
.login-form__btn {
  width: 100%;
  margin-top: 0.25rem;
}
.login-form__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.login-card__back {
  font-family: 'Crimson Pro', serif;
  font-size: 0.88rem;
  color: rgba(255,255,255,0.35);
  text-align: center;
  margin-top: 0.5rem;
  transition: color 0.2s;
}
.login-card__back:hover { color: rgba(255,255,255,0.7); }
</style>