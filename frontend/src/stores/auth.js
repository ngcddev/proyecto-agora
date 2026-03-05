// stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // ── State ──────────────────────────────────────────────
  const token   = ref(localStorage.getItem('admin_token') || null)
  const usuario = ref(JSON.parse(localStorage.getItem('admin_user') || 'null'))
  const loading = ref(false)
  const error   = ref(null)

  // ── Getters ────────────────────────────────────────────
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin         = computed(() => !!usuario.value)

  // ── Actions ────────────────────────────────────────────
  async function login(email, password) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.post('/auth/login', { email, password })

      token.value   = data.token
      usuario.value = data.usuario

      // Persiste en localStorage para sobrevivir recarga
      localStorage.setItem('admin_token', data.token)
      localStorage.setItem('admin_user',  JSON.stringify(data.usuario))

      return true
    } catch (e) {
      error.value = e.response?.data?.error || 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value   = null
    usuario.value = null
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
  }

  async function verificarSesion() {
    if (!token.value) return false
    try {
      const { data } = await api.get('/auth/me')
      usuario.value = data.usuario
      return true
    } catch {
      logout()
      return false
    }
  }

  return { token, usuario, loading, error, isAuthenticated, isAdmin, login, logout, verificarSesion }
})