<template>
  <div class="voter-page">

    <!-- Validation banner -->
    <div v-if="!votanteValidado" class="voter-gate">
      <div class="container voter-gate__inner">
        <h2 class="voter-gate__title">Verify your identity</h2>
        <p class="voter-gate__sub">Enter your ID number to access the ballot.</p>
        <div class="voter-gate__form">
          <div class="field voter-gate__field">
            <label class="field__label">National ID (Cédula)</label>
            <input
              v-model="cedula"
              class="field__input field__input--box"
              type="text"
              placeholder="e.g. 1001234567"
              maxlength="20"
              @keyup.enter="validarVotante"
            />
          </div>
          <p v-if="validationError" class="voter-gate__error">{{ validationError }}</p>
          <button class="btn btn--filled" @click="validarVotante" :disabled="validating">
            {{ validating ? 'Verifying…' : 'Enter Ballot' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Ballot -->
    <template v-else>
      <section class="ballot-header">
        <div class="container">
          <span class="ballot-header__eyebrow">{{ eleccion?.titulo }}</span>
          <h1 class="ballot-header__title">Cast your vote</h1>
          <p class="ballot-header__greeting">Welcome, <strong>{{ votanteNombre }}</strong>. Select one candidate below.</p>
        </div>
      </section>

      <section class="ballot-section">
        <div class="container">

          <!-- Loading -->
          <div v-if="loadingCandidatos" class="ballot-loading">
            <span class="ballot-loading__dot" v-for="n in 3" :key="n"></span>
          </div>

          <!-- Candidates grid -->
          <div v-else class="candidates-grid">
            <div
              v-for="candidato in candidatos"
              :key="candidato.id"
              class="candidate-card"
              :class="{ 'candidate-card--selected': selectedId === candidato.id }"
              @click="!votoEmitido && (selectedId = candidato.id)"
              :tabindex="votoEmitido ? -1 : 0"
              @keyup.enter="!votoEmitido && (selectedId = candidato.id)"
            >
              <div class="candidate-card__number">{{ candidato.numero_candidato }}</div>
              <div class="candidate-card__photo">
                <img
                  v-if="candidato.foto_url"
                  :src="`${apiBase}${candidato.foto_url}`"
                  :alt="candidato.nombre"
                />
                <div v-else class="candidate-card__photo-placeholder">
                  {{ candidato.nombre.charAt(0) }}
                </div>
              </div>
              <div class="candidate-card__info">
                <h3 class="candidate-card__name">{{ candidato.nombre }}</h3>
                <span class="candidate-card__party">{{ candidato.partido }}</span>
                <p class="candidate-card__proposal">{{ candidato.propuesta }}</p>
              </div>
              <div class="candidate-card__selector" aria-hidden="true">
                <span class="candidate-card__radio"></span>
              </div>
            </div>
          </div>

          <!-- Submit vote -->
          <div v-if="!votoEmitido && candidatos.length" class="ballot-submit">
            <p v-if="voteError" class="ballot-submit__error">{{ voteError }}</p>
            <button
              class="btn btn--filled ballot-submit__btn"
              :disabled="!selectedId || submitting"
              @click="emitirVoto"
            >
              {{ submitting ? 'Processing…' : 'Submit Vote' }}
            </button>
          </div>

          <!-- Success state -->
          <div v-if="votoEmitido" class="ballot-success">
            <div class="ballot-success__icon">✓</div>
            <h2 class="ballot-success__title">Vote registered</h2>
            <p class="ballot-success__text">Your vote has been recorded securely. Thank you for participating.</p>
          </div>

        </div>
      </section>
    </template>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'

// Validation state
const cedula          = ref('')
const validating      = ref(false)
const validationError = ref('')
const votanteValidado = ref(false)
const votanteNombre   = ref('')

// Ballot state
const eleccion           = ref(null)
const candidatos         = ref([])
const loadingCandidatos  = ref(false)
const selectedId         = ref(null)
const submitting         = ref(false)
const votoEmitido        = ref(false)
const voteError          = ref('')

const ELECCION_ID = 1 // TODO: obtener dinámicamente la elección activa

async function validarVotante() {
  if (!cedula.value.trim()) {
    validationError.value = 'Please enter your ID number.'
    return
  }

  validating.value = true
  validationError.value = ''

  try {
    const { data } = await api.post('/votantes/validar', {
      cedula:      cedula.value.trim(),
      eleccion_id: ELECCION_ID,
    })

    console.log('Respuesta validación:', data) // ← para confirmar en DevTools

    // Fuerza conversión explícita del booleano
    const habilitado = data.habilitado === true || data.habilitado === 'true'

    if (habilitado) {
      votanteNombre.value   = data.nombre || 'Votante'
      votanteValidado.value = true
      await cargarCandidatos()
    } else {
      validationError.value = data.mensaje || 'No está habilitado para votar.'
    }

  } catch (e) {
    console.error('Error validación:', e)
    validationError.value = 'Verification service unavailable. Please try again.'
  } finally {
    validating.value = false
  }
}

async function cargarCandidatos() {
  loadingCandidatos.value = true
  try {
    const { data } = await api.get(`/candidatos?eleccion_id=${ELECCION_ID}`)
    candidatos.value = data
  } catch {
    candidatos.value = []
  } finally {
    loadingCandidatos.value = false
  }
}

async function emitirVoto() {
  if (!selectedId.value) return
  submitting.value = true
  voteError.value = ''
  try {
    await api.post('/votos', {
      candidato_id: selectedId.value,
      cedula: cedula.value,
      eleccion_id: ELECCION_ID,
    })
    votoEmitido.value = true
  } catch (e) {
    voteError.value = e.response?.data?.error || 'Could not submit vote. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
/* ── Gate (validation) ─────────────────────────────────── */
.voter-gate {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
}
.voter-gate__inner {
  max-width: 480px;
  padding: 4rem 0;
}
.voter-gate__title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  margin-bottom: 0.5rem;
}
.voter-gate__sub {
  font-family: 'Crimson Pro', serif;
  color: rgba(255,255,255,0.55);
  margin-bottom: 2.5rem;
}
.voter-gate__form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.voter-gate__field { width: 100%; }
.voter-gate__error {
  font-family: 'Space Mono', monospace;
  font-size: 0.78rem;
  color: #ff6b6b;
}

/* ── Ballot header ─────────────────────────────────────── */
.ballot-header {
  padding: 4rem 0 2rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.ballot-header__eyebrow {
  font-family: 'Space Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
  display: block;
  margin-bottom: 0.5rem;
}
.ballot-header__title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 700;
  margin-bottom: 0.75rem;
}
.ballot-header__greeting {
  font-family: 'Crimson Pro', serif;
  color: rgba(255,255,255,0.6);
  font-size: 1.05rem;
}

/* ── Ballot section ────────────────────────────────────── */
.ballot-section { padding: 3rem 0 6rem; }

/* Loading dots */
.ballot-loading {
  display: flex;
  gap: 0.5rem;
  padding: 4rem 0;
}
.ballot-loading__dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  animation: pulse 1.2s ease-in-out infinite;
}
.ballot-loading__dot:nth-child(2) { animation-delay: 0.2s; }
.ballot-loading__dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1); }
}

/* Candidates */
.candidates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
.candidate-card {
  border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  padding: 1.5rem;
  cursor: pointer;
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto 1fr;
  gap: 1rem;
  position: relative;
  transition: border-color 0.2s, background 0.2s;
  outline: none;
}
.candidate-card:hover {
  border-color: rgba(255,255,255,0.3);
  background: rgba(255,255,255,0.03);
}
.candidate-card--selected {
  border-color: #fff;
  background: rgba(255,255,255,0.05);
}
.candidate-card__number {
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.35);
  align-self: start;
  padding-top: 2px;
}
.candidate-card__photo {
  grid-row: span 2;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  align-self: center;
}
.candidate-card__photo img {
  width: 100%; height: 100%; object-fit: cover;
}
.candidate-card__photo-placeholder {
  width: 100%; height: 100%;
  background: rgba(255,255,255,0.08);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem;
  color: rgba(255,255,255,0.5);
}
.candidate-card__info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  grid-column: 2;
}
.candidate-card__name {
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  font-weight: 600;
}
.candidate-card__party {
  font-family: 'Space Mono', monospace;
  font-size: 0.72rem;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.04em;
}
.candidate-card__proposal {
  font-family: 'Crimson Pro', serif;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.55);
  line-height: 1.6;
  margin-top: 0.25rem;
}
.candidate-card__selector {
  align-self: center;
}
.candidate-card__radio {
  display: block;
  width: 18px; height: 18px;
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,0.3);
  position: relative;
  transition: border-color 0.2s;
}
.candidate-card--selected .candidate-card__radio {
  border-color: #fff;
}
.candidate-card--selected .candidate-card__radio::after {
  content: '';
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: #fff;
}

/* Submit */
.ballot-submit {
  margin-top: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.ballot-submit__error {
  font-family: 'Space Mono', monospace;
  font-size: 0.78rem;
  color: #ff6b6b;
}
.ballot-submit__btn { min-width: 180px; }
.ballot-submit__btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* Success */
.ballot-success {
  margin-top: 5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}
.ballot-success__icon {
  width: 64px; height: 64px;
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,0.4);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem;
  color: #fff;
}
.ballot-success__title {
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem;
}
.ballot-success__text {
  font-family: 'Crimson Pro', serif;
  color: rgba(255,255,255,0.55);
  max-width: 380px;
  line-height: 1.75;
}
</style>