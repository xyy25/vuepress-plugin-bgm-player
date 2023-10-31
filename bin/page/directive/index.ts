import { App } from "vue";
import { default as copy } from "./copy";

const directives = {
  copy
}

export default {
  install(app: App<any>) {
    Object.keys(directives).forEach(key => {
      app.directive(key, directives[key]);
    })
  }
}
