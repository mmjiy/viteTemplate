
import index from "@lib/components/page/index.vue";
import {createRouter,createWebHistory} from "vue-router";
const router = createRouter({
    history: createWebHistory(),
    routes:[
        {
            path:"/",
            name:"index",
            component:index,
        }
    ],
})

export default router;