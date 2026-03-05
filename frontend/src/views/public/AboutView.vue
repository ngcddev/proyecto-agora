<template>
  <div class="about-page">

    <section class="page-hero">
      <div class="container">
        <span class="page-hero__eyebrow">Who we are</span>
        <h1 class="page-hero__title">About Us</h1>
      </div>
    </section>

    <section class="about-content">
      <div class="container about-content__grid">

        <div class="about-block">
          <h2 class="about-block__title">The Project</h2>
          <p class="about-block__text">
            Ágora is an academic software project built to explore the integration of
            SOAP APIs within a modern full-stack environment — specifically the MEVN stack
            (MySQL, Express, Vue, Node). The name Ágora comes from the ancient Greek gathering
            place where citizens debated and voted on matters of public life.
          </p>
          <p class="about-block__text">
            This project demonstrates how legacy enterprise protocols like SOAP can coexist
            with modern architectures, providing a real-world simulation of an electronic
            voting platform.
          </p>
        </div>

        <div class="about-block">
          <h2 class="about-block__title">The Stack</h2>
          <div class="tech-list">
            <div v-for="tech in stack" :key="tech.name" class="tech-item">
              <span class="tech-item__name">{{ tech.name }}</span>
              <span class="tech-item__role">{{ tech.role }}</span>
            </div>
          </div>
        </div>

        <div class="about-block about-block--full">
          <h2 class="about-block__title">The Team</h2>
          <div class="team-grid">
            <div v-for="member in team" :key="member.name" class="team-card">
              <div class="team-card__avatar">{{ member.initials }}</div>
              <div class="team-card__info">
                <span class="team-card__name">{{ member.name }}</span>
                <span class="team-card__role">{{ member.role }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

  </div>
</template>

<script setup>
const stack = [
  { name: 'MySQL',   role: 'Relational database' },
  { name: 'Express', role: 'REST API backend' },
  { name: 'Vue 3',   role: 'Reactive frontend' },
  { name: 'Node.js', role: 'JavaScript runtime' },
  { name: 'Python',  role: 'SOAP microservice' },
  { name: 'Spyne',   role: 'SOAP framework' },
]

const team = [
  { initials: 'AC', name: 'Andres Casanova', role: 'Full-Stack Developer' },
  { initials: 'NC', name: 'Nicolas Cerón',   role: 'Full-Stack Developer' },
]
</script>

<style scoped>
.page-hero {
  padding: 5rem 0 3rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.page-hero__eyebrow {
  font-family: 'Space Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
  display: block;
  margin-bottom: 0.75rem;
}
.page-hero__title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.2rem, 5vw, 3.5rem);
  font-weight: 700;
}

.about-content { padding: 5rem 0 6rem; }
.about-content__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem 5rem;
}

.about-block__title {
  font-family: 'Playfair Display', serif;
  font-size: 1.35rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.about-block__text {
  font-family: 'Crimson Pro', serif;
  font-size: 1rem;
  color: rgba(255,255,255,0.65);
  line-height: 1.8;
  margin-bottom: 1rem;
}
.about-block--full { grid-column: 1 / -1; }

/* Tech list */
.tech-list { display: flex; flex-direction: column; gap: 0.75rem; }
.tech-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.tech-item__name {
  font-family: 'Space Mono', monospace;
  font-size: 0.85rem;
  color: #fff;
}
.tech-item__role {
  font-family: 'Crimson Pro', serif;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.45);
}

/* Team */
.team-grid { display: flex; gap: 2rem; flex-wrap: wrap; }
.team-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  min-width: 240px;
}
.team-card__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Space Mono', monospace;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.7);
  flex-shrink: 0;
}
.team-card__info { display: flex; flex-direction: column; gap: 0.25rem; }
.team-card__name {
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  font-weight: 600;
}
.team-card__role {
  font-family: 'Crimson Pro', serif;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.45);
}

@media (max-width: 640px) {
  .about-content__grid { grid-template-columns: 1fr; }
  .about-block--full { grid-column: 1; }
}
</style>