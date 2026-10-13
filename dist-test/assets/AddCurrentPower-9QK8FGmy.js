import{_ as oe,J as v,c as ne,H as le,s as p,a as l,b as i,n as f,w as s,u as D,e as N,aV as M,x as E,y as U,P as T,z as ie,aZ as se,a_ as de,f as A,r as w,h as C,o as H,D as ue,M as me,t as L}from"./index-D8r8wMJu.js";import{C as ce,l as pe}from"./CommonAddDataHeader-BgT5t8WM.js";import{U as fe}from"./Upload-CgHqPdmQ.js";import{E as ge}from"./Editor-CKSpASRt.js";import{a as j,u as B,c as O,b as V}from"./commonDataManage-BYt_0L7o.js";import{u as I}from"./index-DoyBEZ4G.js";import{A as J}from"./currentPower-DWsDgkTR.js";import{t as Pe}from"./static-CgaIfbts.js";import{_ as F}from"./detail-title-Co9eJ8iu.js";import"./public-sEsTa_LN.js";import"./climate-tb82PZ5z.js";/* empty css                  */const ve="jpg,jpeg,png,pdf,doc,docx",we={__name:"AddCurrentPower",setup(z,{expose:e}){e();const G=w(null),t=I(),g=D(),y=N(),u=w({provice:"",code:[],num:12,noNum:0}),P=w(1),m=w(null);let a=A({suitRange:1,rangeFile:[],locations:"",filePath:[],currentPowerGrid:"",currentPowerSupply:"",electricityConsumptionDevLevel:"",powerGridSurroundRela:"",v500PowerGridProblem:"",needPrediction:"",developPlan:"",powerPlan:""});const S=["currentPowerGrid","currentPowerSupply","electricityConsumptionDevLevel","powerGridSurroundRela","v500PowerGridProblem","needPrediction","developPlan","powerPlan"],d=r=>{r.target.value==1?(a.locations="",a.rangeFile=[]):m.value.validateFields(["rangeFile"])},K=async(r,o)=>{if(o=="rangeFile"){const n=new FormData;n.append("file",r);const c=await O(n);if(c.code==200){a.locations=JSON.stringify(c.data);let b=await t.uploadFile(r);a[o]=[{fileName:r.name,filePath:b.obsPath,suffix:r.name.split(".")[r.name.split(".").length-1],fileType:2}]}else C.error(c.msg)}else a[o]=[{fileName:r.fileName,filePath:r.filePath,suffix:r.suffix,fileType:1}];m.value.validateFields([o])},Z=(r,o,n)=>(console.log(a.currentPowerGrid,"rule",o),a.currentPowerGrid||o?Promise.resolve():Promise.reject("请填写电源现状")),Q=(r,o,n)=>a.currentPowerSupply||o?Promise.resolve():Promise.reject("请填写电网现状"),W=()=>{m.value.resetFields(),y.push({path:"/currentPower"})},X=async()=>{m.value.validate().then(async()=>{let r={rangeType:u.value.code.length,status:2,source:1,isDisable:0,...a,cityCode:u.value.code[u.value.code.length-1],parentId:u.value.code.length>=2?u.value.code[u.value.code.length-2]:0,powerGridCurrentFiles:[]};r.suitRange==2&&r.powerGridCurrentFiles.push(...a.rangeFile),console.log("formState.filePath",a.filePath),a.filePath&&a.filePath.length&&r.powerGridCurrentFiles.push(...a.filePath),delete r.rangeFile,delete r.filePath;try{if((g.query.id?await B(r):await V(r)).code==200){let n=g.query.id?"修改成功":"新增成功";C.success(n),y.push({path:"/currentPower"})}}catch(o){console.log("err",o)}}).catch(r=>{console.log("错误",r)})},_=r=>{const o=r.data;let n="";u.value.code=[];for(let c=0;c<=r.type;c++)n+=(c==0||!o[c].areaName?"":"/")+(o[c].areaName?o[c].areaName:""),u.value.code.push(o[c].areaCode);u.value.provice=n,P.value=u.value.code.length},Y=(r,o)=>{m.value.validateFields([o])},R=async()=>{const r=await j(g.query.id);if(r.code==200&&(["id","suitRange","locations","currentPowerGrid","currentPowerSupply","electricityConsumptionDevLevel","powerGridSurroundRela","v500PowerGridProblem","needPrediction","developPlan","powerPlan"].forEach(n=>{a[n]=r.data[n]}),a.rangeFile=r.data.powerGridCurrentFiles?.filter(n=>n.fileType==2),a.filePath=r.data.powerGridCurrentFiles?.filter(n=>n.fileType==1),r.data.addressCode)){let{provinceCode:n,provinceName:c,cityCode:b,cityName:ee,districtCode:re,districtName:te}=r.data?.addressCode||{},k={areaCode:n,areaName:c},q={areaCode:b,areaName:ee},ae={areaCode:re,areaName:te},h;switch(r.data.rangeType){case 1:h=[k];break;case 2:h=[k,q];break;default:h=[k,q,ae];break}T(()=>{_({data:h,type:r.data.rangeType-1})})}console.log("详情",a)},$=r=>{let o="省级${4.4.1}市级${4.4.2}县区级${4.4.3}";return o=J[r][P.value],o};M(()=>{sessionStorage.setItem("obsPath","dw/")}),E(()=>{g.query.id&&R()}),U(()=>{sessionStorage.removeItem("obsPath")});const x={currentPowerLink:G,obsUpload:t,route:g,router:y,selectData:u,rangeType:P,fileTypes:ve,currentPowerFormRef:m,get formState(){return a},set formState(r){a=r},needHandleField:S,changeAreaPoint:d,getUploadFile:K,validatorSupply:Z,validatorPower:Q,resetForm:W,saveData:X,getSelectAddress:_,checkRequire:Y,initDetail:R,computedNumber:$,ref:w,reactive:A,toRefs:de,onBeforeMount:M,onMounted:E,onUnmounted:U,watchEffect:se,computed:ie,nextTick:T,get useRoute(){return D},get useRouter(){return N},linkage:pe,CommonAddDataHeader:ce,Upload:fe,Ckeditor:ge,get addGrid(){return V},get checkPointsExcel(){return O},get getGridDetail(){return j},get updateGrid(){return B},get ElMessage(){return C},get useOssUpload(){return I},get AREA_NUMBER(){return J},get templatePath(){return Pe}};return Object.defineProperty(x,"__isScriptSetup",{enumerable:!1,value:!0}),x}},ye={class:"add-current-power"},he={class:"add-power-right"},Se={class:"add-power-right-content"},be={class:"tip-download"},ke=["href"],Ce={class:"content-second-title require-item"},Fe={class:"content-title"};function Ge(z,e,G,t,g,y){const u=v("a-radio"),P=v("a-radio-group"),m=v("a-form-item"),a=v("a-button"),S=v("a-form");return H(),ne("div",ye,[t.route.query.id?p("v-if",!0):(H(),le(t.linkage,{key:0,interfaceType:2,onSelectAddress:t.getSelectAddress,class:"linkage",ref:"currentPowerLink"},null,512)),l("div",he,[i(t.CommonAddDataHeader,{selectData:t.selectData},null,8,["selectData"]),l("div",Se,[e[19]||(e[19]=l("h4",{class:"content-title"},[l("img",{src:F,alt:""}),f(" 项目基本信息 ")],-1)),i(S,{ref:"currentPowerFormRef",hideRequiredMark:!0,name:"advanced_search",class:"ant-advanced-search-form",layout:"vertical",model:t.formState},{default:s(()=>[i(m,{name:"suitRange",rules:[{required:!0,ElMessage:"请选择范围指定"}]},{label:s(()=>[...e[7]||(e[7]=[l("span",{class:"self-label"},"范围指定",-1)])]),default:s(()=>[i(P,{value:t.formState.suitRange,"onUpdate:value":e[0]||(e[0]=d=>t.formState.suitRange=d),name:"radioGroup",onChange:t.changeAreaPoint},{default:s(()=>[i(u,{value:1},{default:s(()=>[...e[8]||(e[8]=[f("全城通用",-1)])]),_:1}),i(u,{value:2},{default:s(()=>[...e[9]||(e[9]=[f("拐点坐标",-1)])]),_:1})]),_:1},8,["value"])]),_:1}),ue(i(m,{name:"rangeFile",rules:[{required:t.formState.suitRange==2,ElMessage:"请上传已填写的模板数据",trigger:["change"]}],style:{"margin-top":"-20px"}},{default:s(()=>[l("p",be,[e[10]||(e[10]=f("点击这里先 ",-1)),l("a",{href:t.templatePath.geologyRegion,download:""},"下载导入模板.xlsx",8,ke)]),i(t.Upload,{isImmediatelyUpload:!1,defaultFiles:t.formState.rangeFile,fileTypes:"xlsx",maxCount:1,fileTypeMessage:"目前仅支持 xlsx 格式",onUpFileList:e[1]||(e[1]=d=>t.getUploadFile(d,"rangeFile"))},{tip:s(()=>[...e[11]||(e[11]=[l("div",{class:"tip"},"上传已填写模板数据",-1)])]),default:s(()=>[e[12]||(e[12]=f("> ",-1))]),_:1},8,["defaultFiles"])]),_:1},8,["rules"]),[[me,t.formState.suitRange==2]]),i(m,{name:"filePath",rules:[{required:!1,ElMessage:"请上传电网报告附件",trigger:["change"]}]},{label:s(()=>[...e[13]||(e[13]=[l("span",{class:"self-label-no-require"},"电网报告附件",-1)])]),default:s(()=>[i(t.Upload,{defaultFiles:t.formState.filePath,"onUpdate:defaultFiles":e[2]||(e[2]=d=>t.formState.filePath=d),fileTypes:t.fileTypes,fileSize:50,maxCount:1,fileTypeMessage:"目前支持 JPG、PNG、PDF、doc、docx 格式",fileSizeMessage:"文件最大50M",onUpFileList:e[3]||(e[3]=d=>t.getUploadFile(d,"filePath"))},{tip:s(()=>[...e[14]||(e[14]=[l("div",{class:"tip"},"说明：资料支持格式为 JPG、PNG、doc、docx、pdf等类型，上限1个，文件最大50M",-1)])]),_:1},8,["defaultFiles"])]),_:1}),e[18]||(e[18]=l("h4",{class:"content-title"},[l("img",{src:F,alt:""}),l("span",null,"电网现状")],-1)),l("h4",Ce,[l("span",null,"电网现状【标题使用"+L(t.computedNumber("current"))+"】",1)]),i(m,{name:"currentPowerGrid",rules:[{required:!0,ElMessage:"请输入电网现状描述",trigger:"blur",validator:t.validatorPower}]},{default:s(()=>[i(t.Ckeditor,{onBlur:e[4]||(e[4]=d=>t.checkRequire(d,"currentPowerGrid")),dataHtml:t.formState.currentPowerGrid,"onUpdate:dataHtml":e[5]||(e[5]=d=>t.formState.currentPowerGrid=d)},null,8,["dataHtml"])]),_:1},8,["rules"]),p(` <h4 class="content-title require-item">\r
                        <span>电源现状</span>\r
                    </h4>\r
                    <a-form-item\r
                        name="currentPowerSupply"\r
                        :rules="[\r
                            {\r
                                required: true,\r
                                ElMessage: '请输入电源现状描述',\r
                                validator: validatorSupply,\r
                            },\r
                        ]"\r
                    >\r
                        <ckeditor\r
                            @blur="(val) => checkRequire(val, 'currentPowerSupply')"\r
                            v-model:dataHtml="formState.currentPowerSupply"\r
                        >\r
                        </ckeditor>\r
                    </a-form-item> `),p(` <h4 class="content-title no-require-label">\r
                        <span>用电量及负荷发展水平</span>\r
                    </h4>\r
                    <a-form-item\r
                        name="electricityConsumptionDevLevel"\r
                        :rules="[{ required: false, ElMessage: '请输入用电量及负荷发展水平描述' }]"\r
                    >\r
                        <ckeditor\r
                            v-model:dataHtml="formState.electricityConsumptionDevLevel"\r
                        ></ckeditor>\r
                    </a-form-item> `),p(` <h4 class="content-title no-require-label">\r
                        <span>与周边电网联系</span>\r
                    </h4>\r
                    <a-form-item\r
                        name="powerGridSurroundRela"\r
                        :rules="[{ required: false, ElMessage: '请输入与周边电网联系描述' }]"\r
                    >\r
                        <ckeditor\r
                            :id="'three'"\r
                            v-model:dataHtml="formState.powerGridSurroundRela"\r
                        ></ckeditor>\r
                    </a-form-item>\r
                    <h4 class="content-title no-require-label">\r
                        <span>500kV电网存在问题</span>\r
                    </h4>\r
                    <a-form-item name="v500PowerGridProblem">\r
                        <ckeditor v-model:dataHtml="formState.v500PowerGridProblem"></ckeditor>\r
                    </a-form-item> `),l("h4",Fe,[e[15]||(e[15]=l("img",{src:F,alt:""},null,-1)),p(" <span>电力发展【省级${4.4.1}市级${4.4.2}县区级${4.4.3}】</span> "),l("span",null,"电力发展【标题使用"+L(t.computedNumber("development"))+"】",1)]),p(` <h4 class="content-title no-require-label">\r
                        <span>电力需求预测</span>\r
                    </h4> `),i(m,{name:"needPrediction"},{default:s(()=>[i(t.Ckeditor,{dataHtml:t.formState.needPrediction,"onUpdate:dataHtml":e[6]||(e[6]=d=>t.formState.needPrediction=d)},null,8,["dataHtml"])]),_:1}),p(` <h4 class="content-title no-require-label">\r
                        <span>相关电网发展规划</span>\r
                    </h4>\r
                    <a-form-item name="developPlan">\r
                        <ckeditor v-model:dataHtml="formState.developPlan"></ckeditor>\r
                    </a-form-item>\r
                    <h4 class="content-title no-require-label">\r
                        <span>电源规划</span>\r
                    </h4>\r
                    <a-form-item name="powerPlan">\r
                        <ckeditor v-model:dataHtml="formState.powerPlan"></ckeditor>\r
                    </a-form-item> `),i(m,{style:{"text-align":"center"}},{default:s(()=>[i(a,{class:"handle-button",onClick:t.resetForm},{default:s(()=>[...e[16]||(e[16]=[f(" 取消 ",-1)])]),_:1}),i(a,{class:"handle-button",type:"primary",onClick:t.saveData},{default:s(()=>[...e[17]||(e[17]=[f("保存",-1)])]),_:1})]),_:1})]),_:1},8,["model"])])])])}const Le=oe(we,[["render",Ge],["__scopeId","data-v-077db145"],["__file","D:/fcs/web/web-sx/web-sx/src/views/hucang/commonDataManage/currentPower/AddCurrentPower.vue"]]);export{Le as default};
//# sourceMappingURL=AddCurrentPower-9QK8FGmy.js.map
