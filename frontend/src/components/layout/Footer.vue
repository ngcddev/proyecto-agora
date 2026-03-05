<template>
  <footer class="footer">
    <div class="container footer__inner">

      <!-- Left: logo + tagline -->
      <div class="footer__brand">
        <RouterLink to="/" class="footer__logo">
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="17" stroke="white" stroke-width="1.5"/>
            <path d="M18 8C18 8 10 14 10 20C10 24.4 13.6 28 18 28C22.4 28 26 24.4 26 20C26 14 18 8 18 8Z" stroke="white" stroke-width="1.5" fill="none"/>
            <path d="M18 12C18 12 13 16.5 13 20.5C13 23.5 15.2 26 18 26" stroke="white" stroke-width="1" fill="none" opacity="0.6"/>
            <circle cx="18" cy="20" r="2.5" fill="white"/>
          </svg>
          <span class="footer__brand-name">Ágora</span>
        </RouterLink>
        <p class="footer__tagline">
          Software created for academic<br>
          purposes, developed by Andres<br>
          Casanova and Nicolas Cerón.
        </p>
      </div>

      <!-- Center: nav links -->
      <nav class="footer__nav" aria-label="Footer navigation">
        <RouterLink v-for="link in links" :key="link.to" :to="link.to" class="footer__nav-link">
          {{ link.label }}
        </RouterLink>
      </nav>

      <!-- Right: social icons -->
      <div class="footer__social">
        <a v-for="s in socials" :key="s.label" :href="s.href" :aria-label="s.label" target="_blank" rel="noopener" class="footer__social-link">
          <component :is="s.icon" />
        </a>
      </div>

    </div>

    <div class="footer__bottom">
      <div class="container">
        <span>© {{ year }} Ágora. Academic project.</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed, defineComponent, h } from 'vue'
import { RouterLink } from 'vue-router'

const year = computed(() => new Date().getFullYear())

const links = [
  { to: '/',       label: 'Home' },
  { to: '/about',  label: 'About Us' },
  { to: '/news',   label: 'News' },
  { to: '/try',    label: 'Try Now' },
]

// SVG social icons inline
const IconX = defineComponent({ render: () => h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'currentColor' }, [h('path', { d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z' })])})
const IconFb = defineComponent({ render: () => h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'currentColor' }, [h('path', { d: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' })])})
const IconIg = defineComponent({ render: () => h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'currentColor' }, [h('path', { d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' })])})
const IconLi = defineComponent({ render: () => h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'currentColor' }, [h('path', { d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' })])})
const IconGh = defineComponent({ render: () => h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'currentColor' }, [h('path', { d: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' })])})

const socials = [
  { label: 'X (Twitter)', href: '#', icon: IconX },
  { label: 'Facebook',    href: '#', icon: IconFb },
  { label: 'Instagram',   href: '#', icon: IconIg },
  { label: 'LinkedIn',    href: '#', icon: IconLi },
  { label: 'GitHub',      href: '#', icon: IconGh },
]
</script>

<style scoped>
.footer {
  background: #141414;
  border-top: 1px solid rgba(255,255,255,0.08);
  padding-top: 3rem;
}

.footer__inner {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 3rem;
  align-items: start;
  padding-bottom: 2.5rem;
}

/* Brand */
.footer__logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.footer__brand-name {
  font-family: 'Playfair Display', serif;
  font-size: 1.15rem;
  font-weight: 600;
  color: #fff;
}
.footer__tagline {
  font-family: 'Crimson Pro', serif;
  font-size: 0.88rem;
  color: rgba(255,255,255,0.5);
  line-height: 1.7;
}

/* Nav */
.footer__nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 80px;
}
.footer__nav-link {
  font-family: 'Crimson Pro', serif;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.6);
  transition: color 0.2s;
  text-align: right;
}
.footer__nav-link:hover { color: #fff; }

/* Social */
.footer__social {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 0.15rem;
}
.footer__social-link {
  color: rgba(255,255,255,0.6);
  transition: color 0.2s, transform 0.2s;
  display: flex;
}
.footer__social-link:hover {
  color: #fff;
  transform: translateY(-2px);
}

/* Bottom bar */
.footer__bottom {
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 1rem 0;
}
.footer__bottom span {
  font-family: 'Space Mono', monospace;
  font-size: 0.72rem;
  color: rgba(255,255,255,0.25);
  letter-spacing: 0.05em;
}

@media (max-width: 640px) {
  .footer__inner {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .footer__nav { flex-direction: row; flex-wrap: wrap; }
  .footer__nav-link { text-align: left; }
}
</style>