<template>
  <Navbar />
  <main class="main-content">
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>
  <Footer />
</template>

<script setup>
import Navbar from '@/components/layout/Navbar.vue'
import Footer from '@/components/layout/Footer.vue'
</script>

<style>
.main-content {
  padding-top: 64px; /* height of fixed navbar */
  min-height: 100vh;
}
</style>