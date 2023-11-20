<template>
  <transition
    name="ModuleTransition"
    @enter="setStyle"
    @after-enter="unsetStyle"
    @before-leave="setStyle"
    @after-leave="">
    <slot />
  </transition>
</template>

<script>
export default {
  name: 'ModuleTransition',
  props: {
    delay: {
      type: String,
      default: '0'
    },
    duration: {
      type: String,
      default: '.25'
    },
    position: {
      type: String,
      default: 'left'
    }
  },
  methods: {
    setStyle (items) {
      items.style.transition = `${this.duration}s ease-in-out ${this.delay}s`
      items.style.transitionProperty = "all";
      items.style.transform = this.position === 'right'
                            ? 'translateX(20px)'
                            : 'translateX(-20px)'
      items.style.opacity = 0
    },
    unsetStyle (items) {
      items.style.transform = null,
      items.style.transitionProperty = "opacity";
      items.style.opacity = 1
    }
  }
}
</script>

<style lang="stylus" scoped>
</style>
