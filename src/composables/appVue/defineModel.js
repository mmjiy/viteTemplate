import {ref, watch} from "vue";

export default (props,emit,name,defaultValue,options={})=>{
    const modelValue =  ref(props[name] || defaultValue);
    if(!options.single) {
        watch(modelValue, newObj => {
            emit(`update:${name}`, newObj);
        }, {deep: options.deep})
    }
    watch(() => props[name], newObj => {
        if(options.updateBefore){
            newObj = options.updateBefore(newObj)
        }
        modelValue.value = newObj;
    })
    return modelValue
}