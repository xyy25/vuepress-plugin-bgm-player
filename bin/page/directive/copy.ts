import { DirectiveHook } from "vue";

const beforeMount: DirectiveHook = function(el, { value }) {
  el.$value = value
  el.handler = () => {
    if (!el.$value) {
      // 值为空的时候，给出提示。可根据项目UI仔细设计
      console.log('无复制内容');
      return;
    }
    // 动态创建 textarea 标签
    const textarea = document.createElement('textarea');
    // 将该 textarea 设为 readonly 防止 iOS 下自动唤起键盘，同时将 textarea 移出可视区域
    textarea.readOnly = true;
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    // 将要 copy 的值赋给 textarea 标签的 value 属性
    textarea.value = el.$value;
    // 将 textarea 插入到 body 中
    document.body.appendChild(textarea);
    // 选中值并复制
    textarea.select();
    let selected: string = "";
    // @ts-ignore
    if(window.getSelection) {
      if(textarea.selectionStart !== void 0 && textarea.selectionEnd !== void 0) {
        selected = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
      }
    } else {
      // @ts-ignore
      selected = document.selection.createRange().text;
    }
    navigator.clipboard.writeText(selected).then(res => {
      // 可根据项目UI仔细设计
      alert('复制链接成功，分享给你的朋友吧~');
    })
    // document.execCommand('Copy');
    document.body.removeChild(textarea);
  }
  // 绑定点击事件，就是所谓的一键 copy 啦
  el.addEventListener('click', el.handler);
}

// 当传进来的值更新的时候触发
const updated: DirectiveHook = function(el, { value }) {
  el.$value = value
}

// 指令与元素解绑的时候，移除事件绑定
const unmounted: DirectiveHook = function(el) {
  el.removeEventListener('click', el.handler)
}

export default {
  beforeMount,
  updated,
  unmounted,
}
