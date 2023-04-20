<script setup>
import {ref,watch} from "vue";
import appSwf from "@lib/composables/appVue/appSwf.js";

const transitionName = ref("")
appSwf(transitionName)
const exclude  =[

]
</script>
<script>

export default {
    components: {
    },
    watch: {}
}
</script>
<template>
    <div  :class="{ app:1,app_swf: transitionName }">
        <router-view  class="app_page" v-slot="{ Component }">
            <transition :name="transitionName">
                <keep-alive :exclude="exclude">
                    <component :is="Component"/>
                </keep-alive>
            </transition>
        </router-view>
    </div>
</template>
