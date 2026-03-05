<template>
  <header class="navbar" :class="{ 'navbar--scrolled': scrolled }">
    <div class="container navbar__inner">
      <!-- Logo -->
      <RouterLink to="/" class="navbar__logo">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="18" cy="18" r="17" stroke="white" stroke-width="1.5"/>
          <path d="M18 8C18 8 10 14 10 20C10 24.4 13.6 28 18 28C22.4 28 26 24.4 26 20C26 14 18 8 18 8Z" stroke="white" stroke-width="1.5" fill="none"/>
          <path d="M18 12C18 12 13 16.5 13 20.5C13 23.5 15.2 26 18 26" stroke="white" stroke-width="1" fill="none" opacity="0.6"/>
          <circle cx="18" cy="20" r="2.5" fill="white"/>
        </svg>
        <span class="navbar__brand">Ágora</span>
      </RouterLink>

      <!-- Desktop nav -->
      <nav class="navbar__nav" aria-label="Main navigation">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="navbar__link"
          :class="{ 'navbar__link--active': $route.path === link.to }"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <!-- Mobile hamburger -->
      <button
        class="navbar__hamburger"
        @click="menuOpen = !menuOpen"
        :aria-expanded="menuOpen"
        aria-label="Toggle menu"
      >
        <span class="navbar__hamburger-bar" :class="{ open: menuOpen }"></span>
        <span class="navbar__hamburger-bar" :class="{ open: menuOpen }"></span>
        <span class="navbar__hamburger-bar" :class="{ open: menuOpen }"></span>
      </button>
    </div>

    <!-- Mobile menu -->
    <Transition name="mobile-menu">
      <div v-if="menuOpen" class="navbar__mobile">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="navbar__mobile-link"
          @click="menuOpen = false"
        >
          {{ link.label }}
        </RouterLink>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const $route = useRoute()
const scrolled = ref(false)
const menuOpen = ref(false)

const links = [
  { to: '/',       label: 'Home' },
  { to: '/about',  label: 'About Us' },
  { to: '/news',   label: 'News' },
  { to: '/try',    label: 'Try Now' },
]

function onScroll() {
  scrolled.value = window.scrollY > 40
}

onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #141414;
  border-bottom: 1px solid transparent;
  transition: border-color 0.3s ease, background 0.3s ease;
}
.navbar--scrolled {
  border-bottom-color: rgba(255,255,255,0.1);
  background: rgba(20,20,20,0.97);
  backdrop-filter: blur(12px);
}

.navbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

/* Logo */
.navbar__logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
}
.navbar__brand {
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.02em;
}

/* Desktop nav */
.navbar__nav {
  display: flex;
  align-items: center;
  gap: 2.5rem;
}
.navbar__link {
  font-family: 'Crimson Pro', serif;
  font-size: 1rem;
  color: rgba(255,255,255,0.75);
  letter-spacing: 0.04em;
  position: relative;
  transition: color 0.2s;
}
.navbar__link::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 0;
  height: 1px;
  background: #fff;
  transition: width 0.25s ease;
}
.navbar__link:hover,
.navbar__link--active {
  color: #fff;
}
.navbar__link--active::after,
.navbar__link:hover::after {
  width: 100%;
}

/* Hamburger */
.navbar__hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}
.navbar__hamburger-bar {
  display: block;
  width: 22px;
  height: 1.5px;
  background: #fff;
  transition: transform 0.25s, opacity 0.25s;
}
.navbar__hamburger-bar.open:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
.navbar__hamburger-bar.open:nth-child(2) { opacity: 0; }
.navbar__hamburger-bar.open:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

/* Mobile menu */
.navbar__mobile {
  display: flex;
  flex-direction: column;
  background: #141414;
  border-top: 1px solid rgba(255,255,255,0.08);
  padding: 1rem 2rem 1.5rem;
  gap: 0.75rem;
}
.navbar__mobile-link {
  font-family: 'Crimson Pro', serif;
  font-size: 1.1rem;
  color: rgba(255,255,255,0.8);
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

/* Mobile menu transition */
.mobile-menu-enter-active,
.mobile-menu-leave-active { transition: opacity 0.2s, transform 0.2s; }
.mobile-menu-enter-from,
.mobile-menu-leave-to { opacity: 0; transform: translateY(-8px); }

@media (max-width: 640px) {
  .navbar__nav { display: none; }
  .navbar__hamburger { display: flex; }
}
</style>