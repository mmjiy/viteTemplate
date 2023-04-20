import { normal } from "@lib/request/base/request"

export async function imInfo (data = {}) {
    return normal.call(this,{
        url:"/admin/api/user/im/info",
        data:{
            "buc_code":data.bucCode,
            "external_map_id":data.externalMapId
        },
        serverType:"ims",
        error:{},
        type:"get",
        disMock:0
    })
}