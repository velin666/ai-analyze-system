<template>
  <div>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage :transition="{ name: 'fade', mode: 'out-in' }" />
    </NuxtLayout>
  </div>
</template>

<style scoped lang="scss">
  * {
    margin: 0;
    padding: 0;
  }

  #__nuxt {
    width: 100vw;
    height: 100vh;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s, transform 0.3s;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: translateY(30px);
  }
</style>
