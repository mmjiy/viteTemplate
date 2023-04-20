import { createApp } from 'vue'
import App from "@lib/App.vue"
import router from "@lib/router/index.js"
import server from "@lib/service/globalSetting/server.js";
import routerSetTag from "@lib/service/globalSetting/routerSetTag.js";
import store from "@lib/store/index.js"

const init = async function (){
    window.store = store;
    window.router= router;


    await server();
    await routerSetTag(router);



    const app = createApp(App)

    app.use(router);
    app.use(store);

    //引入组件


    app.mount('#app');
}
init().catch(e=>{
    console.error("加载失败",e)
});




