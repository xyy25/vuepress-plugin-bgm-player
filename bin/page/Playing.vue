<template>
  <div class="bars">
    <div class="bar" v-for="() in new Array(4)"></div>
  </div>
</template>

<style scoped>
/* loading.css */
.bars {
  display: inline-block;
  position: relative;
  width: 18px;
  --color: rgb(22 22 23);
}
.dark .bars {
  --color: rgb(255 255 245);
}
.bar {
  background-color: var(--color);
  position: absolute;
  bottom: -2px;
  height: 3px;
  width: 3px;
  animation: sound 0ms -800ms linear infinite alternate;
}
@keyframes sound {
  0% {
    opacity: .35;
    height: 2px;
  }
  100% {
    opacity: 1;
    height: 1rem;
  }
}
/* 1 +3+1  .25 ++.25*/
.bar:nth-child(1)  { left: 1px; animation-duration: 474ms; }
.bar:nth-child(2)  { left: 5px; animation-duration: 433ms; }
.bar:nth-child(3)  { left: 9px; animation-duration: 407ms; }
.bar:nth-child(4)  { left: 13px; animation-duration: 458ms; }
.bar:nth-child(5)  { left: 17px; animation-duration: 400ms; }
.bar:nth-child(6)  { left: 21px; animation-duration: 427ms; }
.bar:nth-child(7)  { left: 25px; animation-duration: 441ms; }
.bar:nth-child(8)  { left: 29px; animation-duration: 419ms; }
.bar:nth-child(9)  { left: 33px; animation-duration: 487ms; }
.bar:nth-child(10) { left: 37px; animation-duration: 442ms; }
</style>
