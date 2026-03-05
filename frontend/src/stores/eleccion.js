// stores/eleccion.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useEleccionStore = defineStore('eleccion', () => {
  const eleccionActiva = ref(null)
  const loading        = ref(false)
  const error          = ref(null)

  async function fetchEleccionActiva() {
    loading.value = true
    error.value   = null
    try {
      const { data } = await api.get('/elecciones/activa')
      eleccionActiva.value = data
    } catch (e) {
      error.value = e.response?.status === 404
        ? 'No hay ninguna elección activa en este momento.'
        : 'Error al cargar la elección.'
      eleccionActiva.value = null
    } finally {
      loading.value = false
    }
  }

  return { eleccionActiva, loading, error, fetchEleccionActiva }
})