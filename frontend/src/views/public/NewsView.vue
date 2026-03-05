<template>
  <div class="news-page">

    <section class="page-hero">
      <div class="container">
        <span class="page-hero__eyebrow">Updates &amp; Articles</span>
        <h1 class="page-hero__title">News</h1>
      </div>
    </section>

    <section class="news-content">
      <div class="container">
        <div class="news-grid">
          <article v-for="article in articles" :key="article.id" class="news-card">
            <div class="news-card__meta">
              <span class="news-card__date">{{ article.date }}</span>
              <span class="news-card__tag">{{ article.tag }}</span>
            </div>
            <h2 class="news-card__title">{{ article.title }}</h2>
            <p class="news-card__excerpt">{{ article.excerpt }}</p>
            <a href="#" class="news-card__link">Read more →</a>
          </article>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
const articles = [
  {
    id: 1,
    date: 'March 2025',
    tag: 'Development',
    title: 'Ágora v1.0 — Initial Release',
    excerpt: 'We are excited to announce the first working version of the Ágora electronic voting platform, featuring two SOAP microservices for voter validation and official results.',
  },
  {
    id: 2,
    date: 'February 2025',
    tag: 'Architecture',
    title: 'Why We Chose SOAP Over REST for Critical Validation',
    excerpt: 'In an era where REST dominates, we deliberately integrated SOAP APIs to demonstrate their continued relevance in high-integrity, auditable processes like voting.',
  },
  {
    id: 3,
    date: 'January 2025',
    tag: 'Academic',
    title: 'MEVN Stack: A Modern Approach to Full-Stack Development',
    excerpt: 'A deep dive into how MySQL, Express, Vue 3, and Node.js work together to deliver a cohesive and maintainable application architecture.',
  },
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

.news-content { padding: 4rem 0 6rem; }
.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2px;
}

.news-card {
  padding: 2.5rem 2rem;
  border: 1px solid rgba(255,255,255,0.07);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: background 0.2s;
}
.news-card:hover { background: rgba(255,255,255,0.03); }

.news-card__meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.news-card__date {
  font-family: 'Space Mono', monospace;
  font-size: 0.72rem;
  color: rgba(255,255,255,0.35);
  letter-spacing: 0.06em;
}
.news-card__tag {
  font-family: 'Space Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.5);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 999px;
  padding: 0.15rem 0.6rem;
}
.news-card__title {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.35;
}
.news-card__excerpt {
  font-family: 'Crimson Pro', serif;
  font-size: 0.97rem;
  color: rgba(255,255,255,0.55);
  line-height: 1.75;
  flex: 1;
}
.news-card__link {
  font-family: 'Space Mono', monospace;
  font-size: 0.78rem;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.04em;
  transition: color 0.2s;
  margin-top: 0.5rem;
}
.news-card__link:hover { color: #fff; }
</style>