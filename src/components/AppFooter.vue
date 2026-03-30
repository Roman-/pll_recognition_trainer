<template>
  <footer class="app-footer text-center mt-5">
    <div class="container py-4">
      <div class="footer-tagline mb-3">Train your eyes. Trust your hands.</div>
      <div class="mb-2">
        <small class="text-secondary">
          <a href="https://github.com/Roman-/pll_recognition_trainer" target="_blank" rel="noopener" class="footer-link">
            <i class="bi-github me-1"></i>Source
          </a>
          <span class="mx-2">&middot;</span>
          <a href="https://bestsiteever.net" target="_blank" rel="noopener" class="footer-link">best site ever</a>
          <span class="mx-2">&middot;</span>
          by <a href="https://roman.bz" target="_blank" rel="noopener" class="footer-link">Roman Strakhov</a>
        </small>
      </div>
      <small class="text-secondary opacity-50">&copy; {{ new Date().getFullYear() }} PLL Recognition Trainer</small>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  border-top: 1px solid rgba(var(--bs-secondary-rgb), 0.15);
  background: radial-gradient(
    ellipse at 50% 100%,
    rgba(var(--bs-primary-rgb), 0.05) 0%,
    transparent 70%
  );
}

.footer-tagline {
  font-style: italic;
  color: var(--bs-body-color);
  opacity: 0.35;
  letter-spacing: 0.12em;
  font-size: 0.85rem;
}

.footer-link {
  color: var(--bs-body-color);
  text-decoration: none;
  opacity: 0.6;
  transition: opacity 0.2s, color 0.2s;
}

.footer-link:hover {
  opacity: 1;
  color: rgb(var(--bs-primary-rgb));
}
</style>
