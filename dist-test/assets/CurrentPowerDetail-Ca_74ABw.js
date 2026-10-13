import{_ as Z,J as x,c as R,a as i,s as o,n as P,b as s,w as d,u as N,e as C,aV as S,x as T,z as K,aZ as Q,a_ as W,f as h,r as n,o as D,t as v,F as X,A as $}from"./index-D8r8wMJu.js";import{E as ee}from"./Editor-CKSpASRt.js";import{U as ie}from"./currentPower-DWsDgkTR.js";import{T as te}from"./TableList-DqqyJsmj.js";import{a as L}from"./commonDataManage-BYt_0L7o.js";import{R as ne}from"./commonData-DRgJd4U9.js";import"./index-DoyBEZ4G.js";import"./public-sEsTa_LN.js";/* empty css                   *//* empty css                 *//* empty css                  *//* empty css                        */const re={__name:"CurrentPowerDetail",setup(V,{expose:e}){e();const b=N(),t=C(),w=n({currentPowerGrid:"",currentPowerSupply:"",electricityConsumptionDevLevel:"",powerGridSurroundRela:"",v500PowerGridProblem:"",needPrediction:""}),u=n(null),l=n(!1),c=n(null),r=n(!1),m=n(null),k=n(!1),f=n(null),g=n(!1),E=n(null),y=n(!1),j=n(!1),O=n(null),U=n(!1),z=n(null),H=n(!1),A=n(null),I=a=>{switch(a){case"isEditPower":l.value=!l.value,u.value.editorRef.enable();break;case"isEditSupply":r.value=!r.value,c.value.editorRef.enable();break;case"isElectricity":k.value=!0,m.value.editorRef.enable();break;case"isEditPowerGrid":g.value=!0,f.value.editorRef.enable();break;case"isEditV500PowerGridProblem":y.value=!0,E.value.editorRef.enable();break}},B=(a,p)=>{switch(a){case"isEditPower":l.value=!1,p=="save",u.value.editorRef.disable();break;case"isEditSupply":r.value=!1,p=="save",c.value.editorRef.disable();break;case"isElectricity":k.value=!1,p=="save",m.value.editorRef.disable();break;case"isEditPowerGrid":g.value=!1,p=="save",f.value.editorRef.disable();break;case"isEditV500PowerGridProblem":y.value=!1,p=="save",E.value.editorRef.disable();break}},G=async()=>{const a=await L(b.query.id);a.code==200&&(w.value={...a.data})},F=h([{handleTime:"2020-09-09 18:00:00",handleUser:"张开",handleType:1,handleCont:"账号状态【正常】-->【停用】",remark:"这是一个备注信息",attachments:[{fileName:"文件名称",fileUrl:"文件链接"},{fileName:"文件名称",fileUrl:"文件链接"}]},{handleTime:"2020-09-09 18:00:00",handleUser:"张开",handleType:1,handleCont:"账号状态【正常】-->【停用】",remark:"这是一个备注信息",attachments:[{fileName:"文件名称",fileUrl:"文件链接"},{fileName:"文件名称",fileUrl:"文件链接"}]},{handleTime:"2020-09-09 18:00:00",handleUser:"张开",handleType:1,handleCont:"新增服务【按次付费，20次，2023-09-09~2024-01-01】",remark:"这是一个备注信息",attachments:[{fileName:"文件名称",fileUrl:"文件链接"},{fileName:"文件名称",fileUrl:"文件链接"}]}]),M=h({pageNo:1,size:10,total:0}),Y=h({1:"新增",2:"编辑"}),q=(a,p)=>{console.log(a),console.log(p)},J=a=>{a&&window.open(a)};S(()=>{G()}),T(()=>{});const _={route:b,router:t,dataDetail:w,powerEditorRef:u,isEditPower:l,supplyEditorRef:c,isEditSupply:r,electricityRef:m,isElectricity:k,powerGridRef:f,isEditPowerGrid:g,powerProblemRef:E,isEditV500PowerGridProblem:y,isEditNeedPrediction:j,needPredictionRef:O,isEditDevelopPlan:U,developPlanRef:z,isEditPowerPlanRefn:H,powerPlanRef:A,editorDetial:I,submitEdit:B,initDetail:G,tableDataLog:F,tablePageLog:M,handleTypeData:Y,tableLogChangePage:q,downFilePath:J,ref:n,reactive:h,toRefs:W,onBeforeMount:S,onMounted:T,watchEffect:Q,computed:K,Editor:ee,get useRoute(){return N},get useRouter(){return C},get USER_DETAIL_LOG(){return ie},TableList:te,get getGridDetail(){return L},get RANGE_TYPE_PROVINCE(){return ne}};return Object.defineProperty(_,"__isScriptSetup",{enumerable:!1,value:!0}),_}},ae={class:"current-power-detail project-detail-component"},le={class:"detail-component"},se={class:"content-body"},oe={class:"content-list"},de={class:"list-content"},ce={class:"content-list"},pe={class:"list-content"},me={class:"content-list"};function ve(V,e,b,t,w,u){const l=x("a-col"),c=x("a-row");return D(),R("div",ae,[i("div",le,[e[7]||(e[7]=i("h4",{class:"content-title"},[o(' <img src="../../../assets/img/user/detail-title.png" alt="" /> '),P(" 基本信息 ")],-1)),i("div",se,[s(c,null,{default:d(()=>[s(l,{span:8},{default:d(()=>[e[3]||(e[3]=i("span",null,"数据编号",-1)),i("p",null,v(t.dataDetail.powerGridCode),1)]),_:1}),s(l,{span:8},{default:d(()=>[e[4]||(e[4]=i("span",null,"所属区域",-1)),i("p",null,v(t.dataDetail.cityName),1)]),_:1}),s(l,{span:8},{default:d(()=>[e[5]||(e[5]=i("span",null,"数据范围",-1)),i("p",null,v(t.dataDetail.suitRange==1?"全域通用":t.dataDetail.suitRange==2?"拐点坐标":"--"),1)]),_:1})]),_:1}),o(` <a-row>\r
                    <a-col :span="8">\r
                        <span>省数据</span>\r
                        <p>sd23429847</p>\r
                    </a-col>\r
                    <a-col :span="8">\r
                        <span>市总量/覆盖量/覆盖率</span>\r
                        <p>sldkjfsljf</p>\r
                    </a-col>\r
                    <a-col :span="8">\r
                        <span>区总量/覆盖量/覆盖率</span>\r
                        <p>sldkjfsljf</p>\r
                    </a-col>\r
                </a-row> `),s(c,null,{default:d(()=>[s(l,{span:24},{default:d(()=>[e[6]||(e[6]=i("span",null,"地勘报告",-1)),i("p",{class:"active-item",onClick:e[0]||(e[0]=r=>t.downFilePath(t.dataDetail.filePath))},v(t.dataDetail.fileName?t.dataDetail.fileName:"--"),1)]),_:1})]),_:1})])]),e[11]||(e[11]=i("div",{class:"content-list first-item"},[i("div",{class:"list-header"},[i("h4",{class:"content-title first-item"},[o(' <img src="../../../assets/img/user/detail-title.png" alt="" /> '),P(" 电网现状 ")])])],-1)),i("div",oe,[e[8]||(e[8]=i("div",{class:"list-header"},[i("h4",{class:"content-title-circle"},"电网现状"),o(` <div class="list-header-right">\r
                    <template v-if="!isEditPower">\r
                        <div @click="editorDetial('isEditPower')">\r
                            <iconpark-icon name="bianji" size="12" class="edit-icon"></iconpark-icon\r
                            >编辑\r
                        </div>\r
                    </template>\r
                    <template v-if="isEditPower">\r
                        <iconpark-icon\r
                            name="yijieshu"\r
                            size="12"\r
                            class="edit-icon"\r
                            @click="submitEdit('isEditPower', 'cancle')"\r
                        ></iconpark-icon>\r
                        <iconpark-icon\r
                            name="yishengxiao"\r
                            @click="submitEdit('isEditPower', 'save')"\r
                        ></iconpark-icon>\r
                    </template>\r
                </div> `)],-1)),i("div",de,[s(t.Editor,{ref:"powerEditorRef",height:"400px",readOnly:!t.isEditPower,dataHtml:t.dataDetail.currentPowerGrid,"onUpdate:dataHtml":e[1]||(e[1]=r=>t.dataDetail.currentPowerGrid=r)},null,8,["readOnly","dataHtml"])])]),o(` <div class="content-list">\r
            <div class="list-header">\r
                <h4 class="content-title-circle">电源现状</h4>\r
                <div class="list-header-right">\r
                    <template v-if="!isEditSupply">\r
                        <div @click="editorDetial('isEditSupply')">\r
                            <iconpark-icon name="bianji" size="12" class="edit-icon"></iconpark-icon\r
                            >编辑\r
                        </div>\r
                    </template>\r
                    <template v-if="isEditSupply">\r
                        <iconpark-icon\r
                            name="yijieshu"\r
                            size="12"\r
                            class="edit-icon"\r
                            @click="submitEdit('isEditSupply', 'cancle')"\r
                        ></iconpark-icon>\r
                        <iconpark-icon\r
                            name="yishengxiao"\r
                            @click="submitEdit('isEditSupply', 'save')"\r
                        ></iconpark-icon>\r
                    </template>\r
                </div>\r
            </div>\r
            <div class="list-content">\r
                <Editor ref="supplyEditorRef" :height="'400px'" :readOnly="!isEditSupply"\r
                    v-model:dataHtml="dataDetail.currentPowerSupply"></Editor>\r
            </div>\r
        </div>\r
        <div class="content-list">\r
            <div class="list-header">\r
                <h4 class="content-title-circle">用电量及负荷发展水平</h4>\r
                <div class="list-header-right">\r
                    <template v-if="!isEditPowerGrid">\r
                        <div @click="editorDetial('isElectricity')">\r
                            <iconpark-icon name="bianji" size="12" class="edit-icon"></iconpark-icon\r
                            >编辑\r
                        </div>\r
                    </template>\r
                    <template v-if="isElectricity">\r
                        <iconpark-icon\r
                            name="yijieshu"\r
                            size="12"\r
                            class="edit-icon"\r
                            @click="submitEdit('isElectricity', 'cancle')"\r
                        ></iconpark-icon>\r
                        <iconpark-icon\r
                            name="yishengxiao"\r
                            @click="submitEdit('isElectricity', 'save')"\r
                        ></iconpark-icon>\r
                    </template>\r
                </div>\r
            </div>\r
            <div class="list-content">\r
                <Editor ref="electricityRef" :height="'400px'" :readOnly="!isElectricity"\r
                    v-model:dataHtml="dataDetail.electricityConsumptionDevLevel"></Editor>\r
            </div>\r
        </div>\r
        <div class="content-list">\r
            <div class="list-header">\r
                <h4 class="content-title-circle">与周边电网联系\r
                </h4>\r
                <div class="list-header-right">\r
                    <template v-if="!isEditPowerGrid">\r
                        <div @click="editorDetial('isEditPowerGrid')">\r
                            <iconpark-icon name="bianji" size="12" class="edit-icon"></iconpark-icon\r
                            >编辑\r
                        </div>\r
                    </template>\r
                    <template v-if="isEditPowerGrid">\r
                        <iconpark-icon\r
                            name="yijieshu"\r
                            size="12"\r
                            class="edit-icon"\r
                            @click="submitEdit('isEditPowerGrid', 'cancle')"\r
                        ></iconpark-icon>\r
                        <iconpark-icon\r
                            name="yishengxiao"\r
                            @click="submitEdit('isEditPowerGrid', 'save')"\r
                        ></iconpark-icon>\r
                    </template>\r
                </div>\r
            </div>\r
            <div class="list-content">\r
                <Editor ref="powerGridRef" :height="'400px'" :readOnly="!isEditPowerGrid"\r
                    v-model:dataHtml="dataDetail.powerGridSurroundRela"></Editor>\r
            </div>\r
        </div>\r
        <div class="content-list">\r
            <div class="list-header">\r
                <h4 class="content-title-circle">500kV电网存在问题</h4>\r
                <div class="list-header-right">\r
                    <template v-if="!isEditV500PowerGridProblem">\r
                        <div @click="editorDetial('isEditV500PowerGridProblem')">\r
                            <iconpark-icon name="bianji" size="12" class="edit-icon"></iconpark-icon\r
                            >编辑\r
                        </div>\r
                    </template>\r
                    <template v-if="isEditV500PowerGridProblem">\r
                        <iconpark-icon\r
                            name="yijieshu"\r
                            size="12"\r
                            class="edit-icon"\r
                            @click="submitEdit('isEditV500PowerGridProblem', 'cancle')"\r
                        ></iconpark-icon>\r
                        <iconpark-icon\r
                            name="yishengxiao"\r
                            @click="submitEdit('isEditV500PowerGridProblem', 'save')"\r
                        ></iconpark-icon>\r
                    </template>\r
                </div>\r
            </div>\r
            <div class="list-content">\r
                <Editor ref="powerGridRef" :height="'400px'" :readOnly="!isEditV500PowerGridProblem"\r
                    v-model:dataHtml="dataDetail.v500PowerGridProblem"></Editor>\r
            </div>\r
        </div> `),e[12]||(e[12]=i("div",{class:"content-list"},[i("div",{class:"list-header"},[i("h4",{class:"content-title"},[o(' <img src="../../../assets/img/user/detail-title.png" alt="" /> '),P(" 电力发展 ")])])],-1)),i("div",ce,[e[9]||(e[9]=i("div",{class:"list-header"},[i("h4",{class:"content-title-circle"},"电力需求预测")],-1)),i("div",pe,[s(t.Editor,{ref:"needPredictionRef",height:"400px",readOnly:!t.isEditNeedPrediction,dataHtml:t.dataDetail.needPrediction,"onUpdate:dataHtml":e[2]||(e[2]=r=>t.dataDetail.needPrediction=r)},null,8,["readOnly","dataHtml"])])]),o(` <div class="content-list">\r
            <div class="list-header">\r
                <h4 class="content-title-circle">相关电网发展规划</h4>\r
            </div>\r
            <div class="list-content">\r
                <Editor ref="developPlanRef" :height="'400px'" :readOnly="!isEditDevelopPlan"\r
                    v-model:dataHtml="dataDetail.developPlan"></Editor>\r
            </div>\r
        </div>\r
        <div class="content-list">\r
            <div class="list-header">\r
                <h4 class="content-title-circle">电源规划</h4>\r
            </div>\r
            <div class="list-content">\r
                <Editor ref="powerPlanRef" :height="'400px'" :readOnly="!isEditPowerPlanRefn"\r
                    v-model:dataHtml="dataDetail.powerPlan"></Editor>\r
            </div>\r
        </div> `),i("div",me,[e[10]||(e[10]=i("h4",{class:"content-title"},[o(' <img src="../../../assets/img/user/detail-title.png" alt="" /> '),P(" 主要操作日志 ")],-1)),s(t.TableList,{onChangePage:t.tableLogChangePage,class:"table-common table-account",page:t.tablePageLog,tableData:t.tableDataLog,tableColumn:t.USER_DETAIL_LOG},{handleType:d(r=>[i("span",null,v(t.handleTypeData[r.handleType]),1)]),attachments:d(r=>[(D(!0),R(X,null,$(r.attachments,m=>(D(),R("span",null,v(m.fileName),1))),256))]),_:1},8,["page","tableData","tableColumn"])])])}const Ge=Z(re,[["render",ve],["__scopeId","data-v-85f282db"],["__file","D:/fcs/web/web-sx/web-sx/src/views/hucang/commonDataManage/currentPower/CurrentPowerDetail.vue"]]);export{Ge as default};
//# sourceMappingURL=CurrentPowerDetail-Ca_74ABw.js.map
