import {useRouter} from "vue-router";

export default async function(router){
    if(!router){
        console.error("routerSetTag need router");
        return;
    }



    const routerReplace = router.replace.bind(router)
    router.replace = (location, onComplete, onAbort) => {
        //router.isJump = true;
        routerReplace(location, onComplete, onAbort)
    }

    const routerPush = router.push.bind(router)
    router.push = (location, onComplete, onAbort) => {
        router.isJump = true;
        routerPush(location, onComplete, onAbort)
    }

    router.beforeEach((to,from,next)=>{
        if(router.push){
            if(!to.meta){
                to.meta = {};
            }
            to.meta.isJump = !!router.isJump;
        }
        router.isJump =false;
        next();
    })
    return true;
}
