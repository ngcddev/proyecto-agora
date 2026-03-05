<template>
  <div class="try-page">

    <!-- ── EMAIL VERIFICATION POPUP ─────────────────────── -->
    <Transition name="popup">
      <div v-if="showPopup" class="popup-backdrop" @click.self="showPopup = false">
        <div class="popup" role="dialog" aria-modal="true" aria-labelledby="popup-title">
          <p id="popup-title" class="popup__text">
            We have sent an email with a verification<br>
            code so that you can access the features of<br>
            Ágora.
          </p>
          <div class="field popup__field">
            <input
              v-model="verificationCode"
              class="field__input field__input--box popup__code-input"
              type="text"
              placeholder="Enter code"
              maxlength="6"
              @keyup.enter="submitCode"
            />
          </div>
          <button class="btn popup__submit" @click="submitCode">Send Code</button>
        </div>
      </div>
    </Transition>

    <!-- ── PAGE HEADER ────────────────────────────────────── -->
    <section class="try-header">
      <div class="container">
        <h1 class="try-header__title">Try Now</h1>
        <p class="try-header__sub">Register your interest and access the platform.</p>
      </div>
    </section>

    <!-- ── REGISTRATION FORM ──────────────────────────────── -->
    <section class="try-form-section">
      <div class="container">
        <form class="try-form" @submit.prevent="handleSubmit" novalidate>

          <!-- Row: First + Last name -->
          <div class="try-form__row">
            <div class="field">
              <label class="field__label">First Name</label>
              <input
                v-model="form.firstName"
                class="field__input"
                type="text"
                placeholder="Text Sample"
                required
              />
            </div>
            <div class="field">
              <label class="field__label">Last Name</label>
              <input
                v-model="form.lastName"
                class="field__input"
                type="text"
                placeholder="Text Sample"
                required
              />
            </div>
          </div>

          <!-- Email -->
          <div class="field">
            <label class="field__label">E-Mail</label>
            <input
              v-model="form.email"
              class="field__input"
              type="email"
              placeholder="Text Sample"
              required
            />
          </div>

          <!-- Phone (optional) -->
          <div class="field">
            <label class="field__label">Phone Number (Optional)</label>
            <input
              v-model="form.phone"
              class="field__input"
              type="tel"
              placeholder="Text Sample"
            />
          </div>

          <!-- Why interested -->
          <div class="field">
            <label class="field__label">Why are you interested?</label>
            <input
              v-model="form.reason"
              class="field__input"
              type="text"
              placeholder="Text Sample"
            />
          </div>

          <!-- Error message -->
          <p v-if="error" class="try-form__error" role="alert">{{ error }}</p>

          <div class="try-form__actions">
            <button type="submit" class="btn btn--filled" :disabled="loading">
              <span v-if="!loading">I'm Interested</span>
              <span v-else>Sending…</span>
            </button>
          </div>

        </form>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const showPopup      = ref(false)
const verificationCode = ref('')
const loading        = ref(false)
const error          = ref('')

const form = reactive({
  firstName: '',
  lastName:  '',
  email:     '',
  phone:     '',
  reason:    '',
})

async function handleSubmit() {
  error.value = ''

  if (!form.firstName || !form.lastName || !form.email) {
    error.value = 'Please fill in all required fields.'
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    error.value = 'Please enter a valid email address.'
    return
  }

  loading.value = true
  try {
    // TODO: llamar al endpoint real → POST /api/auth/request-code
    await new Promise(r => setTimeout(r, 900)) // simulación
    showPopup.value = true
  } catch (error) {
    error.value = 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}

async function submitCode() {
  if (!verificationCode.value) return
  // TODO: llamar al endpoint → POST /api/auth/verify-code
  alert(`Code submitted: ${verificationCode.value}`)
  showPopup.value = false
}
</script>

<style scoped>
/* ── Page header ───────────────────────────────────────── */
.try-header {
  padding: 4rem 0 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.try-header__title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.try-header__sub {
  font-family: 'Crimson Pro', serif;
  color: rgba(255,255,255,0.55);
  font-size: 1.05rem;
}

/* ── Form section ──────────────────────────────────────── */
.try-form-section {
  padding: 4rem 0 6rem;
}
.try-form {
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.try-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}
.try-form__actions {
  padding-top: 0.5rem;
  display: flex;
  justify-content: center;
}
.try-form__error {
  font-family: 'Space Mono', monospace;
  font-size: 0.78rem;
  color: #ff6b6b;
  letter-spacing: 0.02em;
}

/* ── Popup ─────────────────────────────────────────────── */
.popup-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.popup {
  background: #1e1d1d;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 6px;
  padding: 2.5rem 2rem;
  max-width: 380px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
}
.popup__text {
  font-family: 'Crimson Pro', serif;
  font-size: 1rem;
  color: rgba(255,255,255,0.8);
  line-height: 1.7;
}
.popup__field {
  width: 100%;
}
.popup__code-input {
  text-align: center;
  font-family: 'Space Mono', monospace;
  letter-spacing: 0.25em;
  font-size: 1.1rem;
}
.popup__submit {
  min-width: 140px;
}

/* Popup transition */
.popup-enter-active, .popup-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.popup-enter-from, .popup-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(8px);
}

@media (max-width: 480px) {
  .try-form__row { grid-template-columns: 1fr; gap: 1.5rem; }
}
</style>