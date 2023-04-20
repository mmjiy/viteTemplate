import {watch} from "vue"
import {useRoute} from "vue-router"
import {isSafari} from "@lib/common/lib/ua.js";

export default  (transitionName)=>{
    watch(useRoute(),(to,from)=>{
        transitionName.value = "";
        //
        if (to && from) {
            console.log("路由:" + to.fullPath);

            if (to.meta && from.meta) {
                //同级别不跳的页面
                if (to.meta.disSwfInSameLevel && from.meta.disSwfInSameLevel && to.meta.disSwfInSameLevel == from.meta.disSwfInSameLevel) {
                    transitionName.value = "none";
                } else if (to.meta.isJump) {
                    transitionName.value = "slideLeft";
                }
                //后退
                else {
                    if (!isSafari()) {
                        transitionName.value = "slideRight";
                    } else {
                        transitionName.value = "none";
                    }
                }
            }
        }
    })
}