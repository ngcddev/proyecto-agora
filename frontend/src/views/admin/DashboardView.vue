<template>
  <div class="dashboard">

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar__top">
        <div class="sidebar__brand">
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="17" stroke="white" stroke-width="1.5"/>
            <path d="M18 8C18 8 10 14 10 20C10 24.4 13.6 28 18 28C22.4 28 26 24.4 26 20C26 14 18 8 18 8Z" stroke="white" stroke-width="1.5" fill="none"/>
            <circle cx="18" cy="20" r="2.5" fill="white"/>
          </svg>
          <span>Ágora Admin</span>
        </div>
        <nav class="sidebar__nav">
          <button
            v-for="item in navItems"
            :key="item.id"
            class="sidebar__nav-item"
            :class="{ active: activeSection === item.id }"
            @click="activeSection = item.id"
          >
            <span class="sidebar__nav-icon">{{ item.icon }}</span>
            {{ item.label }}
          </button>
        </nav>
      </div>
      <div class="sidebar__footer">
        <span class="sidebar__user">{{ adminUser?.nombre || 'Admin' }}</span>
        <button class="sidebar__logout" @click="logout">Sign out</button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="dashboard__main">

      <!-- ── OVERVIEW ──────────────────────────────────── -->
      <section v-if="activeSection === 'overview'" class="dash-section">
        <h1 class="dash-section__title">Overview</h1>
        <div class="stats-grid">
          <div v-for="stat in stats" :key="stat.label" class="stat-card">
            <span class="stat-card__value">{{ stat.value }}</span>
            <span class="stat-card__label">{{ stat.label }}</span>
          </div>
        </div>

        <!-- Chart placeholder -->
        <div class="chart-block">
          <h2 class="chart-block__title">Votes by Candidate</h2>
          <div class="chart-placeholder">
            <div
              v-for="candidato in candidatos.slice(0, 5)"
              :key="candidato.id"
              class="chart-bar-row"
            >
              <span class="chart-bar-row__name">{{ candidato.nombre }}</span>
              <div class="chart-bar-row__track">
                <div
                  class="chart-bar-row__fill"
                  :style="{ width: barWidth(candidato.total_votos || 0) }"
                ></div>
              </div>
              <span class="chart-bar-row__count">{{ candidato.total_votos || 0 }}</span>
            </div>
            <p v-if="!candidatos.length" class="chart-placeholder__empty">No data yet</p>
          </div>
        </div>
      </section>

      <!-- ── CANDIDATOS CRUD ───────────────────────────── -->
      <section v-if="activeSection === 'candidatos'" class="dash-section">
        <div class="dash-section__header">
          <h1 class="dash-section__title">Candidates</h1>
          <button class="btn btn--sm" @click="openModal()">+ Add Candidate</button>
        </div>

        <div class="table-wrap">
          <table class="dash-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Photo</th>
                <th>Name</th>
                <th>Party</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!candidatos.length">
                <td colspan="5" class="dash-table__empty">No candidates yet</td>
              </tr>
              <tr v-for="c in candidatos" :key="c.id">
                <td class="dash-table__num">{{ c.numero_candidato }}</td>
                <td>
                  <div class="table-avatar">
                    <img v-if="c.foto_url" :src="`${apiBase}${c.foto_url}`" :alt="c.nombre" />
                    <span v-else>{{ c.nombre.charAt(0) }}</span>
                  </div>
                </td>
                <td class="dash-table__name">{{ c.nombre }}</td>
                <td class="dash-table__party">{{ c.partido }}</td>
                <td>
                  <div class="table-actions">
                    <button class="table-btn" @click="openModal(c)" title="Edit">✏️</button>
                    <button class="table-btn table-btn--danger" @click="eliminarCandidato(c.id)" title="Delete">🗑</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ── ELECCIONES ────────────────────────────────── -->
      <section v-if="activeSection === 'elecciones'" class="dash-section">
        <h1 class="dash-section__title">Elections</h1>
        <p class="dash-section__coming">Election management coming in next sprint.</p>
      </section>

    </div>

    <!-- ── MODAL: create / edit candidato ───────────────── -->
    <Transition name="popup">
      <div v-if="showModal" class="popup-backdrop" @click.self="closeModal">
        <div class="popup popup--wide">
          <h2 class="popup__heading">{{ editingId ? 'Edit Candidate' : 'New Candidate' }}</h2>

          <div class="modal-form">
            <div class="modal-form__row">
              <div class="field">
                <label class="field__label">Full Name *</label>
                <input v-model="modalForm.nombre" class="field__input" type="text" placeholder="Ana García" />
              </div>
              <div class="field">
                <label class="field__label">Party *</label>
                <input v-model="modalForm.partido" class="field__input" type="text" placeholder="Partido Progresista" />
              </div>
            </div>
            <div class="modal-form__row">
              <div class="field">
                <label class="field__label">Candidate Number *</label>
                <input v-model.number="modalForm.numero_candidato" class="field__input" type="number" min="1" />
              </div>
              <div class="field">
                <label class="field__label">Election ID *</label>
                <input v-model.number="modalForm.eleccion_id" class="field__input" type="number" min="1" />
              </div>
            </div>
            <div class="field">
              <label class="field__label">Proposal / Platform</label>
              <input v-model="modalForm.propuesta" class="field__input" type="text" placeholder="Main proposal text" />
            </div>
            <div class="field">
              <label class="field__label">Photo</label>
              <input ref="fileInput" class="field__input" type="file" accept="image/*" @change="onFileChange" />
            </div>
          </div>

          <p v-if="modalError" class="modal-error">{{ modalError }}</p>

          <div class="popup__actions">
            <button class="btn" @click="closeModal">Cancel</button>
            <button class="btn btn--filled" @click="saveCandidato" :disabled="saving">
              {{ saving ? 'Saving…' : editingId ? 'Update' : 'Create' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router   = useRouter()
const apiBase  = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'

// Layout
const activeSection = ref('overview')
const navItems = [
  { id: 'overview',   icon: '📊', label: 'Overview' },
  { id: 'candidatos', icon: '🧑‍💼', label: 'Candidates' },
  { id: 'elecciones', icon: '🗳',  label: 'Elections' },
]

// Data
const adminUser  = ref(JSON.parse(localStorage.getItem('admin_user') || 'null'))
const candidatos = ref([])
const totalVotos = ref(0)

// Stats
const stats = computed(() => [
  { value: candidatos.value.length,                        label: 'Candidates' },
  { value: totalVotos.value,                               label: 'Votes cast' },
  { value: candidatos.value.filter(c => c.activo).length,  label: 'Active' },
  { value: 1,                                               label: 'Elections' },
])

function barWidth(votos) {
  const max = Math.max(...candidatos.value.map(c => c.total_votos || 0), 1)
  return `${(votos / max) * 100}%`
}

async function fetchCandidatos() {
  try {
    const { data } = await api.get('/candidatos/resultados/1')
    candidatos.value = data
    totalVotos.value = data.reduce((s, c) => s + (c.total_votos || 0), 0)
  } catch { candidatos.value = [] }
}

onMounted(fetchCandidatos)

// ── Modal ────────────────────────────────────────────────
const showModal = ref(false)
const editingId = ref(null)
const saving    = ref(false)
const modalError = ref('')
const fileInput  = ref(null)
const selectedFile = ref(null)

const modalForm = reactive({
  nombre: '', partido: '', propuesta: '',
  numero_candidato: 1, eleccion_id: 1,
})

function openModal(candidato = null) {
  modalError.value = ''
  selectedFile.value = null
  if (candidato) {
    editingId.value = candidato.id
    Object.assign(modalForm, {
      nombre: candidato.nombre,
      partido: candidato.partido,
      propuesta: candidato.propuesta || '',
      numero_candidato: candidato.numero_candidato,
      eleccion_id: candidato.eleccion_id,
    })
  } else {
    editingId.value = null
    Object.assign(modalForm, { nombre: '', partido: '', propuesta: '', numero_candidato: 1, eleccion_id: 1 })
  }
  showModal.value = true
}

function closeModal() { showModal.value = false }

function onFileChange(e) { selectedFile.value = e.target.files[0] || null }

async function saveCandidato() {
  if (!modalForm.nombre || !modalForm.partido) {
    modalError.value = 'Name and Party are required.'
    return
  }
  saving.value = true
  modalError.value = ''
  try {
    const fd = new FormData()
    Object.entries(modalForm).forEach(([k, v]) => fd.append(k, v))
    if (selectedFile.value) fd.append('foto', selectedFile.value)

    if (editingId.value) {
      await api.put(`/candidatos/${editingId.value}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    } else {
      await api.post('/candidatos', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    }
    closeModal()
    await fetchCandidatos()
  } catch (e) {
    modalError.value = e.response?.data?.error || 'Error saving candidate.'
  } finally {
    saving.value = false
  }
}

async function eliminarCandidato(id) {
  if (!confirm('Delete this candidate?')) return
  try {
    await api.delete(`/candidatos/${id}`)
    await fetchCandidatos()
  } catch { alert('Error deleting candidate.') }
}

function logout() {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
  router.push('/')
}
</script>

<style scoped>
/* ── Layout ─────────────────────────────────────────────── */
.dashboard {
  display: flex;
  min-height: calc(100vh - 64px);
  background: #1e1d1d;
}

/* ── Sidebar ───────────────────────────────────────────── */
.sidebar {
  width: 220px;
  background: #141414;
  border-right: 1px solid rgba(255,255,255,0.07);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.5rem 0;
  flex-shrink: 0;
}
.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  margin-bottom: 1rem;
}
.sidebar__brand span {
  font-family: 'Playfair Display', serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
}
.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 0.75rem;
}
.sidebar__nav-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 0.75rem;
  border-radius: 4px;
  background: none;
  border: none;
  color: rgba(255,255,255,0.55);
  font-family: 'Crimson Pro', serif;
  font-size: 0.95rem;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, color 0.15s;
}
.sidebar__nav-item:hover { background: rgba(255,255,255,0.05); color: #fff; }
.sidebar__nav-item.active { background: rgba(255,255,255,0.08); color: #fff; }
.sidebar__nav-icon { font-size: 1rem; }
.sidebar__footer {
  padding: 0 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.sidebar__user {
  font-family: 'Space Mono', monospace;
  font-size: 0.72rem;
  color: rgba(255,255,255,0.35);
  word-break: break-all;
}
.sidebar__logout {
  background: none; border: none;
  font-family: 'Crimson Pro', serif;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  text-align: left;
  transition: color 0.15s;
  padding: 0;
}
.sidebar__logout:hover { color: #ff6b6b; }

/* ── Main ──────────────────────────────────────────────── */
.dashboard__main {
  flex: 1;
  padding: 2.5rem 2.5rem 4rem;
  overflow-y: auto;
}
.dash-section__title {
  font-family: 'Playfair Display', serif;
  font-size: 1.7rem;
  font-weight: 700;
  margin-bottom: 2rem;
}
.dash-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}
.dash-section__coming {
  font-family: 'Crimson Pro', serif;
  color: rgba(255,255,255,0.45);
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 3rem;
}
.stat-card {
  background: #141414;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.stat-card__value {
  font-family: 'Space Mono', monospace;
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
}
.stat-card__label {
  font-family: 'Crimson Pro', serif;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.45);
}

/* Chart */
.chart-block {
  background: #141414;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  padding: 1.75rem;
}
.chart-block__title {
  font-family: 'Playfair Display', serif;
  font-size: 1.05rem;
  margin-bottom: 1.5rem;
}
.chart-bar-row {
  display: grid;
  grid-template-columns: 180px 1fr 50px;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}
.chart-bar-row__name {
  font-family: 'Crimson Pro', serif;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.chart-bar-row__track {
  height: 6px;
  background: rgba(255,255,255,0.07);
  border-radius: 999px;
  overflow: hidden;
}
.chart-bar-row__fill {
  height: 100%;
  background: rgba(255,255,255,0.7);
  border-radius: 999px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.chart-bar-row__count {
  font-family: 'Space Mono', monospace;
  font-size: 0.72rem;
  color: rgba(255,255,255,0.4);
  text-align: right;
}
.chart-placeholder__empty {
  font-family: 'Crimson Pro', serif;
  color: rgba(255,255,255,0.3);
  font-size: 0.9rem;
}

/* Table */
.table-wrap { overflow-x: auto; }
.dash-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Crimson Pro', serif;
}
.dash-table th {
  font-family: 'Space Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  text-align: left;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.dash-table td {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  vertical-align: middle;
}
.dash-table__empty {
  text-align: center;
  color: rgba(255,255,255,0.3);
  font-size: 0.9rem;
  padding: 2rem !important;
}
.dash-table__num {
  font-family: 'Space Mono', monospace;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.35);
}
.dash-table__name { font-weight: 600; color: #fff; }
.dash-table__party { color: rgba(255,255,255,0.5); font-size: 0.92rem; }

.table-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255,255,255,0.08);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  color: rgba(255,255,255,0.5);
}
.table-avatar img { width: 100%; height: 100%; object-fit: cover; }

.table-actions { display: flex; gap: 0.5rem; }
.table-btn {
  background: none; border: none;
  font-size: 1rem; cursor: pointer;
  opacity: 0.6; transition: opacity 0.15s;
  padding: 2px;
}
.table-btn:hover { opacity: 1; }
.table-btn--danger:hover { filter: hue-rotate(330deg); }

/* Modal */
.popup-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
}
.popup {
  background: #1e1d1d;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 6px;
  padding: 2rem;
  max-width: 380px;
  width: 100%;
  display: flex; flex-direction: column; gap: 1.5rem;
}
.popup--wide { max-width: 600px; }
.popup__heading {
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
  font-weight: 600;
}
.modal-form { display: flex; flex-direction: column; gap: 1.25rem; }
.modal-form__row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
.modal-error {
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  color: #ff6b6b;
}
.popup__actions {
  display: flex; justify-content: flex-end; gap: 0.75rem;
}

/* Transitions */
.popup-enter-active, .popup-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.popup-enter-from, .popup-leave-to { opacity: 0; transform: scale(0.96) translateY(8px); }

@media (max-width: 768px) {
  .sidebar { display: none; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .chart-bar-row { grid-template-columns: 100px 1fr 40px; }
}
</style>