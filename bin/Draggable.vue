<template>
  <div class="bgm-player-draggable" @mousedown="onDragBegin" @click="onClick">
    <slot />
  </div>
</template>
<script>
export default {
  props: {
    enableDrag: {
      type: Boolean,
      default: false
    },
    align: {
      type: Object,
      default: {
        x: "left", y: "bottom"
      }
    },
    pos: {
      type: Object,
      default: {
        x: 0, y: 0
      }
    }
  },
  data() {
    return {
      hasMovedSinceMouseDown: false,
      dragStart: {
        x: 0, y: 0
      }
    }
  },
  methods: {
    onDragBegin(e) {
      if (!this.enableDrag) return;
      this.hasMovedSinceMouseDown = false;
      this.$emit('dragbegin');
      this.dragStart.x = e.clientX;
      this.dragStart.y = e.clientY;
      console.log(this.dragStart)
      document.addEventListener('mousemove', this.onDocumentMouseMove);
      document.addEventListener('mouseup', this.onDocumentMouseUp);
    },
    onDocumentMouseMove(e) {
      this.hasMovedSinceMouseDown = true;
      this.$emit('dragging', {
        dx: e.clientX - this.dragStart.x,
        dy: e.clientY - this.dragStart.y
      });
    },
    onDocumentMouseUp(e) {
      document.removeEventListener('mouseup', this.onDocumentMouseUp)
      document.removeEventListener('mousemove', this.onDocumentMouseMove)

      this.$emit('dragend')
    },
    onClick() {
      // if (!this.hasMovedSinceMouseDown) {
      //   this.$emit('toggleplay')
      // }
    }
  }
}
</script>

<style lang="scss">

.bgm-player-draggable {
  &:active {
    cursor: move;
  }
}

// .aplayer-pic {
//   flex-shrink: 0;

//   position: relative;
//   height: $aplayer-height;
//   width: $aplayer-height;
//   background-image: url(../default.jpg);
//   background-size: cover;
//   transition: all 0.3s ease;
//   cursor: pointer;

//   &:hover {
//     .aplayer-button {
//       opacity: 1;
//     }
//   }

//   .aplayer-button {
//     position: absolute;
//     border-radius: 50%;
//     opacity: 0.8;
//     text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
//     box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
//     background: rgba(0, 0, 0, 0.2);
//     transition: all 0.1s ease;

//     .aplayer-fill {
//       fill: #fff;
//     }
//   }

//   .aplayer-play {
//     width: 26px;
//     height: 26px;
//     border: 2px solid #fff;
//     bottom: 50%;
//     right: 50%;
//     margin: 0 -15px -15px 0;

//     .aplayer-icon-play {
//       position: absolute;
//       top: 3px;
//       left: 4px;
//       height: 20px;
//       width: 20px;
//     }
//   }

//   .aplayer-pause {
//     width: 16px;
//     height: 16px;
//     border: 2px solid #fff;
//     bottom: 4px;
//     right: 4px;

//     .aplayer-icon-pause {
//       position: absolute;
//       top: 2px;
//       left: 2px;
//       height: 12px;
//       width: 12px;
//     }
//   }
// }
</style>
