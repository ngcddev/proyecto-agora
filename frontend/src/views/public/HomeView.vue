<template>
  <div class="home">

    <!-- ── HERO ──────────────────────────────────────────── -->
    <section class="hero">
      <div class="hero__bg">
        <!-- Placeholder oscuro con overlay — reemplazar con imagen real -->
        <div class="hero__overlay"></div>
        <div class="hero__img-placeholder" aria-hidden="true"></div>
      </div>
      <div class="container hero__content">
        <h1 class="hero__title">
          Democracy has<br>
          never been so easy.
        </h1>
        <RouterLink to="/try" class="btn hero__cta">Try Now</RouterLink>
      </div>
    </section>

    <!-- ── PITCH ──────────────────────────────────────────── -->
    <section class="pitch">
      <div class="container pitch__inner">
        <h2 class="pitch__heading">Voting software for everyone, be democratic</h2>
        <p class="pitch__body">
          This software project was created out of the need to explore the
          functioning of SOAP APIs in an environment with a modern stack,
          in this case the MEVN stack.
        </p>
        <RouterLink to="/about" class="btn">Learn About Us</RouterLink>
      </div>
    </section>

    <!-- ── PILLARS ─────────────────────────────────────────── -->
    <section class="pillars">
      <div class="container pillars__grid">
        <div v-for="pillar in pillars" :key="pillar.title" class="pillar">
          <div class="pillar__icon" aria-hidden="true">{{ pillar.emoji }}</div>
          <h3 class="pillar__title">{{ pillar.title }}</h3>
          <p class="pillar__text">{{ pillar.text }}</p>
        </div>
      </div>
    </section>

    <!-- ── CROWD BANNER ───────────────────────────────────── -->
    <section class="crowd-banner" aria-hidden="true">
      <div class="crowd-banner__overlay"></div>
      <div class="crowd-banner__img-placeholder"></div>
    </section>

  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'

const pillars = [
  {
    emoji: '🔒',
    title: "We're secure",
    text: "Your vote is secure. We use bank-grade technology that digitally seals each election, ensuring that no one can see or change your decision. It is a private, secure, and 100% reliable process.",
  },
  {
    emoji: '📋',
    title: "We're transparent",
    text: "Clear bills, real results. Each step of the process leaves a digital footprint that allows results to be easily audited and verified. With Ágora, you can be sure that every vote counts and is counted correctly.",
  },
  {
    emoji: '⚡',
    title: "We're reliable",
    text: "A system that never lets you down. Our platform is designed to run smoothly, even during peak traffic times. If a technical error occurs, the system detects and fixes it instantly, ensuring a seamless experience for everyone.",
  },
]
</script>

<style scoped>
/* ── Hero ──────────────────────────────────────────────── */
.hero {
  position: relative;
  height: min(90vh, 640px);
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.hero__bg {
  position: absolute;
  inset: 0;
}
.hero__img-placeholder {
  width: 100%;
  height: 100%;
  /* Reemplazar background con: background-image: url('/img/hero.jpg') */
  background:
    linear-gradient(135deg,
      #1a1a2e 0%,
      #16213e 35%,
      #0f3460 65%,
      #1a1a2e 100%);
  background-size: cover;
  background-position: center;
  filter: brightness(0.7);
}
.hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(20,20,20,0.75) 0%,
    rgba(20,20,20,0.3) 60%,
    transparent 100%
  );
  z-index: 1;
}
.hero__content {
  position: relative;
  z-index: 2;
  padding-bottom: 4rem;
}
.hero__title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  font-weight: 700;
  line-height: 1.15;
  color: #fff;
  margin-bottom: 2rem;
  text-shadow: 0 2px 20px rgba(0,0,0,0.4);
  max-width: 580px;
}
.hero__cta {
  font-size: 0.95rem;
}

/* ── Pitch ─────────────────────────────────────────────── */
.pitch {
  padding: 6rem 0;
  background: var(--bg);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.pitch__inner {
  max-width: 680px;
  margin: 0 auto;
  text-align: center;
}
.pitch__heading {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.5rem, 3vw, 2.2rem);
  font-weight: 600;
  margin-bottom: 1.25rem;
  line-height: 1.3;
}
.pitch__body {
  font-family: 'Crimson Pro', serif;
  font-size: 1.05rem;
  color: rgba(255,255,255,0.65);
  margin-bottom: 2.5rem;
  line-height: 1.75;
}

/* ── Pillars ───────────────────────────────────────────── */
.pillars {
  padding: 5rem 0 6rem;
  background: var(--bg);
}
.pillars__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
}
.pillar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.pillar__icon {
  font-size: 1.5rem;
  line-height: 1;
}
.pillar__title {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
}
.pillar__text {
  font-family: 'Crimson Pro', serif;
  font-size: 0.97rem;
  color: rgba(255,255,255,0.6);
  line-height: 1.75;
}

/* ── Crowd banner ──────────────────────────────────────── */
.crowd-banner {
  position: relative;
  height: 340px;
  overflow: hidden;
}
.crowd-banner__img-placeholder {
  width: 100%;
  height: 100%;
  /* Reemplazar con: background-image: url('/img/crowd.jpg') */
  background: linear-gradient(
    160deg,
    #0d1b2a 0%,
    #1b2838 40%,
    #162032 70%,
    #0a0f1a 100%
  );
  background-size: cover;
  background-position: center top;
  filter: brightness(0.6);
}
.crowd-banner__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(30,29,29,0.4) 0%,
    rgba(30,29,29,0.15) 50%,
    rgba(30,29,29,0.7) 100%
  );
  z-index: 1;
}

@media (max-width: 768px) {
  .pillars__grid { grid-template-columns: 1fr; gap: 2.5rem; }
  .hero { height: min(80vh, 520px); }
}
</style>