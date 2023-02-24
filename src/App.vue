<template>
  <el-config-provider>
    <!-- <BaseHeader /> -->
    <!-- <div style="display: flex"> -->
    <!-- <BaseSide /> -->
    <router-view />
    <!-- <Suspense>
      <select-files />
    </Suspense> -->
    <!-- </div> -->
  </el-config-provider>
</template>

<style>
#app {
  text-align: center;
  color: var(--ep-text-color-primary);
  height: 100%;
}

.element-plus-logo {
  width: 50%;
}
</style>
