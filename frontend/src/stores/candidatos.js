import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export const useCandidatosStore = defineStore('candidatos', () => {
  const candidatos = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchCandidatos() {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get('/candidatos');
      candidatos.value = data;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  return { candidatos, loading, error, fetchCandidatos };
});