<template>
  <div class="site">
    <SiteHeader />
    <main class="site-main">
      <slot />
    </main>
    <SiteFooter />
    <CartNotice />
  </div>
</template>

<style scoped>
.site { min-height: 100vh; display: flex; flex-direction: column; }
.site-main { flex: 1; }
</style>
