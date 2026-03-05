// stores/candidatos.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useCandidatosStore = defineStore('candidatos', () => {
  const candidatos = ref([])
  const stats      = ref(null)
  const loading    = ref(false)
  const error      = ref(null)

  async function fetchCandidatos(eleccionId) {
    loading.value = true
    error.value   = null
    try {
      const params = eleccionId ? `?eleccion_id=${eleccionId}` : ''
      const { data } = await api.get(`/candidatos${params}`)
      candidatos.value = data
    } catch (e) {
      error.value = 'Error al cargar candidatos'
    } finally {
      loading.value = false
    }
  }

  async function fetchStats(eleccionId) {
    try {
      const { data } = await api.get(`/votos/stats/${eleccionId}`)
      stats.value = data
      // Sincroniza total_votos en la lista de candidatos
      if (data.candidatos) candidatos.value = data.candidatos
    } catch {
      stats.value = null
    }
  }

  async function crearCandidato(formData) {
    const { data } = await api.post('/candidatos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  }

  async function actualizarCandidato(id, formData) {
    const { data } = await api.put(`/candidatos/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  }

  async function eliminarCandidato(id) {
    await api.delete(`/candidatos/${id}`)
  }

  return {
    candidatos, stats, loading, error,
    fetchCandidatos, fetchStats,
    crearCandidato, actualizarCandidato, eliminarCandidato,
  }
})