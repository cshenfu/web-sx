import{_ as te,J as g,o as j,c as G,a as D,b as a,n as U,w as i,s as I,H as Se,F as de,A as Me,D as pe,M as ve,t as ke,u as z,e as O,r as m,x as L,z as re,Q as ie,aV as Z,a_ as ne,f as K,h as W,B as sa,aO as da,aZ as ua,be as ee}from"./index-D8r8wMJu.js";import{C as oe,l as he}from"./CommonAddDataHeader-BgT5t8WM.js";import{U as ue}from"./Upload-CgHqPdmQ.js";import{A as xe,B as Te,C as De,D as Pe,E as we,F as Fe,G as Ne,H as Ee,I as Ae,J as Ue,K as Re,L as Ce,M as je,N as qe,O as Ie,P as Ge,Q as ze,R as Oe,S as Le,T as We,U as Je,V as Ve,W as Be,X as Ye,Y as He,Z as Qe,_ as Ze}from"./climate-tb82PZ5z.js";import{_ as se}from"./detail-title-Co9eJ8iu.js";import"./public-sEsTa_LN.js";/* empty css                  */import"./static-CgaIfbts.js";import"./index-DoyBEZ4G.js";const ye="jpg,jpeg,png,pdf,doc,docx",ae="jpg,jpeg,png",me="shp,tif",be=F=>/^(\-|\+)?\d+(\.\d+)?$/.test(F),Ke=F=>/^[0-9]\d*$/.test(F),ca={__name:"AddThunderData",props:{selectData:{type:Object}},setup(F,{expose:t}){t();const p=F,e=m({provice:""}),h=z(),k=O(),d=m(!!h.query.id),n=m(null),u=v=>(f,N,V)=>N?(Ke(N),Promise.resolve()):Promise.reject(v),s=(v,f,N)=>{if(v.required){if(!f.fileName&&!f.data.length)return Promise.reject("请上传文件并且输入数据文件名称");if(!f.fileName)return Promise.reject("请输入数据文件名称");if(!f.data.length)return Promise.reject("请上传文件");if(f.fileName&&f.data.length)return Promise.resolve()}else{if(f.fileName&&f.data.length||!f.fileName&&!f.data.length)return Promise.resolve();if(f.fileName)return f.length?Promise.resolve():Promise.reject("请上传文件");if(f.data.length)return f.fileName?Promise.resolve():Promise.reject(v.selfMessage)}},c=m({dataType:0,thunderstormDays:"",thunderMap:[{data:[],fileName:""}],remark:"",dataSources:[{data:[],fileName:""}]}),y=m(!1),x=m("温度分布图"),o=m("说明：文件格式需为JPG、PNG，上限1个，文件最大5M"),_=m(5),b=m("目前支持 JPG、PNG 格式"),S=m(ae),E=m("请输入图片名称"),R=v=>{n.value.resetFields(),c.value.dataType=v.target.value,c.value.thunderMap=[{data:[],fileName:""}],c.value.dataSources=[{data:[],fileName:""}],v.target.value==0?y.value=!1:y.value=!0,v.target.value==0?x.value="温度分布图":x.value="数据文件",v.target.value==0?o.value="说明：文件格式需为JPG、PNG，上限1个，文件最大5M":o.value="说明：格式需为tif、shp 矢量数据格式，上限1个，最大500M",v.target.value==0?_.value=5:_.value=500,v.target.value==0?b.value="目前支持 JPG、PNG 格式":b.value="目前支持 tif、shp矢量数据格式",v.target.value==0?S.value=ae:S.value=me,v.target.value==0?E.value="请输入图片名称":E.value="请输入数据文件名称"},C=(v,f,N)=>{N=="thunder"?n.value.validateFields([["thunderMap",f]]):n.value.validateFields([["dataSources",f]])},l={dataType:[{required:!0,ElMessage:"请选择",trigger:"change"}],thunderstormDays:[{required:!0,trigger:"blur",validator:u("请输入雷暴日数")}]},r=v=>{v=="thunder"?c.value.thunderMap.push({data:[],fileName:""}):c.value.dataSources.push({data:[],fileName:""})},M=(v,f)=>{f=="thunder"?c.value.thunderMap.splice(v,1):c.value.dataSources.splice(v,1)},P=(v,f,N)=>{N=="thunder"?(c.value.thunderMap[f].data=[v],n.value.validateFields([["thunderMap",f]])):(c.value.dataSources[f].data=[v],n.value.validateFields([["dataSources",f]])),console.log("--或缺文件--",v)},A=()=>{n.value.resetFields(),k.go(-1)},q=async()=>{try{let{dataType:v,thunderstormDays:f,remark:N}=c.value,V={fileName:"",filePath:""};c.value.thunderMap.forEach(w=>{V.fileName=w.fileName,V.filePath=w.data.length>0?w.data[0].filePath:""});let B={dataType:v,thunderstormDays:Number(f),areaCode:p.selectData.code[p.selectData.code.length-1],remark:N,mapImage:V};d.value&&(B.id=c.value.id,delete B.areaCode);let H=d.value?await Te(B):await De(B);H.code==200&&H.data&&(W.success("提交成功"),n.value.resetFields(),k.go(-1))}catch(v){console.log("报错",v)}},J=async()=>{try{let v=h.query.id,f=await xe(v);if(f.code==200&&f.data){let{dataType:N,thunderstormDays:V,id:B,areaCode:H,remark:w}=f.data;c.value={dataType:N,thunderstormDays:V,id:B,areaCode:H,remark:w},c.value.thunderMap=[{data:f.data.mapImage?[f.data.mapImage]:[],fileName:f.data.mapImage?f.data.mapImage.fileName:""}],e.value.provice=f.data.areaName}}catch{}};L(()=>{sessionStorage.setItem("obsPath","climate/thunder/"),d.value&&J()});const ce={props:p,editSelectData:e,route:h,router:k,isAddOrEdit:d,thunderFormRef:n,checkReuqired:u,validateFileName:s,formState:c,vectorRequired:y,labelTitile:x,uploadFileTip:o,upFileSize:_,fileTypeMessage:b,fileTypes:S,placeholderTip:E,getModeType:R,saveIndex:C,rules:l,addMap:r,deleteMap:M,getUploadFile:P,resetForm:A,submitData:q,getThunderDetail:J,saveData:()=>{n.value.validateFields().then(()=>{console.log("保存数据",c.value),q()}).catch(v=>{console.log("err",v)})},ref:m,reactive:K,toRefs:ne,onBeforeMount:Z,onMounted:L,watch:ie,computed:re,get useRoute(){return z},get useRouter(){return O},linkage:he,CommonAddDataHeader:oe,Upload:ue,get positiveIntegerPattern(){return Ke},get DATA_SOURCE_FILE_TYPES(){return ye},get MAP_FILE_TYPES(){return ae},get VECTOR_MAP_FILE_TYPES(){return me},get addThunderstorm(){return De},get getThunderstormDetail(){return xe},get updateThunderstorm(){return Te},get ElMessage(){return W}};return Object.defineProperty(ce,"__isScriptSetup",{enumerable:!1,value:!0}),ce}},ma={class:"add-power-right"},fa={class:"add-power-right-content"},pa={class:"add-upload-file"},va={class:"tip-content"},ga={class:"tip-content-add"},_a={class:"tip-title"};function ha(F,t,p,e,h,k){const d=g("a-input"),n=g("a-form-item"),u=g("a-col"),s=g("iconpark-icon"),c=g("a-row"),y=g("a-button"),x=g("a-form");return j(),G("div",ma,[D("div",fa,[a(e.CommonAddDataHeader,{selectData:p.selectData.provice?p.selectData:e.editSelectData},null,8,["selectData"]),t[5]||(t[5]=D("h4",{class:"content-title"},[D("img",{src:se,alt:""}),U(" 项目基本信息 ")],-1)),a(x,{ref:"thunderFormRef",name:"advanced_search",rules:e.rules,class:"ant-advanced-search-form",layout:"vertical",model:e.formState},{default:i(()=>[a(c,null,{default:i(()=>[I(` <a-col :span="12">\r
                        <a-form-item name="dataType" label="数据格式">\r
                            <a-radio-group v-model:value="formState.dataType" name="radioGroup" @change="getModeType">\r
                                <a-radio :value="0">标准数据</a-radio>\r
                                <a-radio :value="1">矢量地图类数据</a-radio>\r
                            </a-radio-group>\r
                        </a-form-item>\r
                    </a-col> `),e.formState.dataType==0?(j(),Se(u,{key:0,span:12},{default:i(()=>[a(n,{name:"thunderstormDays",label:"雷暴日数"},{default:i(()=>[a(d,{style:{width:"424px"},suffix:"天",value:e.formState.thunderstormDays,"onUpdate:value":t[0]||(t[0]=o=>e.formState.thunderstormDays=o),valueModifiers:{trim:!0},placeholder:"请输入雷暴日数"},null,8,["value"])]),_:1})]),_:1})):I("v-if",!0),a(u,{span:12},{default:i(()=>[a(c,null,{default:i(()=>[a(u,{span:24},{default:i(()=>[(j(!0),G(de,null,Me(e.formState.thunderMap,(o,_)=>(j(),G("div",{key:_},[a(n,{name:["thunderMap",_],label:_==0?e.labelTitile:"",rules:[{required:e.vectorRequired,trigger:"blur",index:_,selfMessage:e.placeholderTip,validator:e.validateFileName}]},{default:i(()=>[D("div",pa,[a(e.Upload,{defaultFiles:o.data,"onUpdate:defaultFiles":b=>o.data=b,fileTypes:e.fileTypes,name:"pic",fileSize:e.upFileSize,maxCount:1,fileTypeMessage:e.fileTypeMessage,fileSizeMessage:`文件最大${e.upFileSize}M`,onUpFileList:b=>e.getUploadFile(b,_,"thunder")},{tip:i(()=>[D("div",va,[D("div",ga,[a(n,{name:["thunderMap",_]},{default:i(()=>[a(d,{placeholder:e.placeholderTip,onBlur:b=>e.saveIndex(b,_,"thunder"),value:o.fileName,"onUpdate:value":b=>o.fileName=b,valueModifiers:{trim:!0},style:{width:"356px"}},null,8,["placeholder","onBlur","value","onUpdate:value"])]),_:2},1032,["name"]),e.formState.dataType==0?(j(),G(de,{key:0},[pe(a(s,{class:"add-icon",name:"shanjian",size:"16",onClick:b=>e.deleteMap(_,"thunder")},null,8,["onClick"]),[[ve,e.formState.thunderMap.length>1]]),pe(a(s,{class:"add-icon",name:"tianjia",size:"16",onClick:t[1]||(t[1]=b=>e.addMap("thunder"))},null,512),[[ve,_==e.formState.thunderMap.length-1]])],64)):I("v-if",!0)]),D("div",_a,ke(e.uploadFileTip),1)])]),_:2},1032,["defaultFiles","onUpdate:defaultFiles","fileTypes","fileSize","fileTypeMessage","fileSizeMessage","onUpFileList"])])]),_:2},1032,["name","label","rules"])]))),128))]),_:1})]),_:1})]),_:1}),a(u,{span:12},{default:i(()=>[a(n,{name:"remark",label:"来源"},{default:i(()=>[a(d,{style:{width:"424px"},value:e.formState.remark,"onUpdate:value":t[2]||(t[2]=o=>e.formState.remark=o),valueModifiers:{trim:!0},placeholder:"请输入来源"},null,8,["value"])]),_:1}),I(" 暂时隐藏 "),I(` <a-row>\r
                            <a-col :span="24">\r
                                <div v-for="(item, index) in formState.dataSources" :key="index">\r
                                    <a-form-item :name="['dataSources', index]" :label="index == 0 ? '数据来源' : ''" :rules="[\r
                                        {\r
                                            required: false,\r
                                            trigger: 'blur',\r
                                            index: index,\r
                                            selfMessage: '请输入数据来源的文档名称',\r
                                            validator: validateFileName,\r
                                        },\r
                                    ]">\r
                                        <div class="add-upload-file ">\r
                                            <Upload v-model:defaultFiles="item.data" \r
                                                :fileTypes="DATA_SOURCE_FILE_TYPES" :fileSize="50" :maxCount="1"\r
                                                fileTypeMessage="目前支持 JPG、PNG、doc、docx、pdf格式" fileSizeMessage="文件最大50M"\r
                                                @upFileList="(val) => getUploadFile(val, index, 'source')">\r
                                                <template #tip>\r
                                                    <div class="tip-content">\r
                                                        <div class="tip-content-add">\r
                                                            <a-form-item :name="['dataSources', index]">\r
                                                                <a-input placeholder="请输入数据来源的文档名称"\r
                                                                    @blur="(e) => saveIndex(e, index, 'source')"\r
                                                                    v-model:value="item.fileName"\r
                                                                    style="width: 356px"></a-input>\r
                                                            </a-form-item>\r
                                                            <iconpark-icon class="add-icon" name="shanjian" size="16"\r
                                                                @click="deleteMap(index, 'source')"\r
                                                                v-show="formState.dataSources.length > 1"></iconpark-icon>\r
                                                            <iconpark-icon class="add-icon" name="tianjia" size="16"\r
                                                                @click="addMap('source')"\r
                                                                v-show="index == formState.dataSources.length - 1"></iconpark-icon>\r
                                                        </div>\r
\r
                                                        <div class="tip-title">说明：支持 JPG、PNG、doc、docx、pdf等，上限1个，上限50M</div>\r
                                                    </div>\r
                                                </template>\r
                                            </Upload>\r
\r
                                        </div>\r
                                    </a-form-item>\r
                                </div>\r
\r
                            </a-col>\r
                        </a-row> `)]),_:1})]),_:1}),a(n,{style:{"text-align":"center"},class:"footer-list"},{default:i(()=>[a(y,{class:"handle-button",onClick:e.resetForm},{default:i(()=>[...t[3]||(t[3]=[U(" 取消 ",-1)])]),_:1}),a(y,{class:"handle-button",type:"primary",onClick:e.saveData},{default:i(()=>[...t[4]||(t[4]=[U("保存",-1)])]),_:1})]),_:1})]),_:1},8,["model"])])])}const Xe=te(ca,[["render",ha],["__scopeId","data-v-ba95708b"],["__file","D:/fcs/web/web-sx/web-sx/src/views/hucang/commonDataManage/climateDataBase/components/add/AddThunderData.vue"]]),ya={__name:"AddAcidRain",props:{selectData:{type:Object}},setup(F,{expose:t}){t();const p=F,e=m({provice:""}),h=z(),k=O(),d=m(!!h.query.id),n=m(null),u=m(!1),s=m(!1),c=m(!1),y=()=>{u.value=!0},x=()=>{u.value=c.value},o=()=>{u.value=!1,c.value=!1,n.value.validateFields(["number"])},_=(w,T)=>T.maxAcidRainValue!=""&&T.minAcidRainValue!=""&&T.maxAcidRainValue>=T.minAcidRainValue?(s.value=!1,Promise.resolve()):(s.value=!0,Promise.reject("请输入正确数值范围！")),b=(w,T,Y)=>{if(w.required){if(!T.fileName&&!T.data.length)return Promise.reject("请上传文件并且输入数据文件名称");if(!T.fileName)return Promise.reject("请输入数据文件名称");if(!T.data.length)return Promise.reject("请上传文件");if(T.fileName&&T.data.length)return Promise.resolve()}else{if(T.fileName&&T.data.length||!T.fileName&&!T.data.length)return Promise.resolve();if(T.fileName)return T.length?Promise.resolve():Promise.reject("请上传文件");if(T.data.length)return T.fileName?Promise.resolve():Promise.reject(w.selfMessage)}},S=m({dataType:0,precipitationSamplesNum:"",ph56SamplesNum:"",number:{minAcidRainValue:"",maxAcidRainValue:""},remark:"",thunderMap:[{data:[],fileName:""}],dataSources:[{data:[],fileName:""}]}),E=m(!1),R=m("酸雨分布图"),C=m("说明：文件格式需为JPG、PNG，上限1个，文件最大5M"),l=m(5),r=m("目前支持 JPG、PNG 格式"),M=m(ae),P=m("请输入图片名称"),A=w=>{n.value.resetFields(),S.value.dataType=w.target.value,S.value.thunderMap=[{data:[],fileName:""}],S.value.dataSources=[{data:[],fileName:""}],w.target.value==0?E.value=!1:E.value=!0,w.target.value==0?R.value="酸雨分布图":R.value="数据文件",w.target.value==0?C.value="说明：文件格式需为JPG、PNG，上限1个，文件最大5M":C.value="说明：格式需为tif、shp 矢量数据格式，上限1个，最大500M",w.target.value==0?l.value=5:l.value=500,w.target.value==0?r.value="目前支持 JPG、PNG 格式":r.value="目前支持 tif、shp矢量数据格式",w.target.value==0?M.value=ae:M.value=me,w.target.value==0?P.value="请输入图片名称":P.value="请输入数据文件名称"},q=(w,T,Y)=>{Y=="thunder"?n.value.validateFields([["thunderMap",T]]):n.value.validateFields([["dataSources",T]])},J={dataType:[{required:!0,ElMessage:"请选择",trigger:"change"}]},ge=w=>{w=="thunder"?S.value.thunderMap.push({data:[],fileName:""}):S.value.dataSources.push({data:[],fileName:""})},ce=(w,T)=>{T=="thunder"?S.value.thunderMap.splice(w,1):S.value.dataSources.splice(w,1)},v=(w,T,Y)=>{Y=="thunder"?(S.value.thunderMap[T].data=[w],n.value.validateFields([["thunderMap",T]])):(S.value.dataSources[T].data=[w],n.value.validateFields([["dataSources",T]]))},f=()=>{n.value.resetFields(),k.go(-1)};L(()=>{h.query.id&&B(h.query.id)});const N=()=>{n.value.validateFields().then(()=>{V()}).catch(w=>{console.log("err",w)})},V=async()=>{try{let{dataType:w,ph56SamplesNum:T,precipitationSamplesNum:Y,maxAcidRainValue:le,minAcidRainValue:X}={...S.value,...S.value.number},$={fileName:"",filePath:""};S.value.thunderMap.forEach(_e=>{$.fileName=_e.fileName,$.filePath=_e.data.length>0?_e.data[0].filePath:""});let Q={dataType:w,ph56SamplesNum:T,precipitationSamplesNum:Y,maxAcidRainValue:le,minAcidRainValue:X,areaCode:d.value?S.value.areaCode:p.selectData.code[p.selectData.code.length-1],remark:"",mapImage:$};d.value&&(Q.id=S.value.id);let fe=d.value?await we(Q):await Fe(Q);fe.code==200&&fe.data&&(W.success("提交成功"),n.value.resetFields(),k.go(-1))}catch(w){console.log("报错",w)}},B=async()=>{try{let w=h.query.id,T=await Pe(w);if(T.code==200&&T.data){let{dataType:Y,minAcidRainValue:le,maxAcidRainValue:X,ph56SamplesNum:$,precipitationSamplesNum:Q,remark:fe,id:_e,areaCode:oa}=T.data;S.value.id=_e,S.value.dataType=Y,S.value.remark=fe,S.value.number.minAcidRainValue=le,S.value.number.maxAcidRainValue=X,S.value.ph56SamplesNum=$,S.value.precipitationSamplesNum=Q,S.value.areaCode=oa,S.value.thunderMap=[{data:[T.data.mapImage],fileName:T.data.mapImage.fileName}],e.value.provice=T.data.areaName}}catch{}},H={props:p,editSelectData:e,route:h,router:k,isAddOrEdit:d,acidFormRef:n,isActive:u,isError:s,isFocus:c,mouseover:y,mouseout:x,blur:o,validatorNumber:_,validateFileName:b,formState:S,vectorRequired:E,labelTitile:R,uploadFileTip:C,upFileSize:l,fileTypeMessage:r,fileTypes:M,placeholderTip:P,getModeType:A,saveIndex:q,rules:J,addMap:ge,deleteMap:ce,getUploadFile:v,resetForm:f,saveData:N,submitData:V,getAcidRainDetail:B,ref:m,reactive:K,toRefs:ne,onBeforeMount:Z,onMounted:L,watch:ie,computed:re,get useRoute(){return z},get useRouter(){return O},linkage:he,CommonAddDataHeader:oe,Upload:ue,get addDryRain(){return Fe},get getDryRainDetail(){return Pe},get updateDryRain(){return we},get DATA_SOURCE_FILE_TYPES(){return ye},get MAP_FILE_TYPES(){return ae},get VECTOR_MAP_FILE_TYPES(){return me},get ElMessage(){return W}};return Object.defineProperty(H,"__isScriptSetup",{enumerable:!1,value:!0}),H}},Sa={class:"add-power-right"},ba={class:"add-power-right-content"},Ma={class:"add-upload-file"},ka={class:"tip-content"},xa={class:"tip-content-add"},Ta={class:"tip-title"};function Da(F,t,p,e,h,k){const d=g("a-input-number"),n=g("a-form-item"),u=g("a-col"),s=g("a-input"),c=g("iconpark-icon"),y=g("a-row"),x=g("a-button"),o=g("a-form");return j(),G("div",Sa,[a(e.CommonAddDataHeader,{selectData:p.selectData.provice?p.selectData:e.editSelectData},null,8,["selectData"]),D("div",ba,[t[11]||(t[11]=D("h4",{class:"content-title"},[D("img",{src:se,alt:""}),U(" 项目基本信息 ")],-1)),a(o,{ref:"acidFormRef",name:"advanced_search",rules:e.rules,class:"ant-advanced-search-form",layout:"vertical",model:e.formState},{default:i(()=>[a(y,null,{default:i(()=>[I(` <a-col :span="12">\r
                        <a-form-item name="dataType" label="数据格式">\r
                            <a-radio-group v-model:value="formState.dataType" name="radioGroup" @change="getModeType">\r
                                <a-radio :value="0">标准数据</a-radio>\r
                                <a-radio :value="1">矢量地图类数据</a-radio>\r
                            </a-radio-group>\r
                        </a-form-item>\r
                    </a-col> `),e.formState.dataType==0?(j(),G(de,{key:0},[a(u,{span:12},{default:i(()=>[a(n,{label:"降水样本数",name:"precipitationSamplesNum"},{default:i(()=>[a(d,{style:{width:"424px"},controls:!1,placeholder:"请输入降水样本数",class:"right-input",value:e.formState.precipitationSamplesNum,"onUpdate:value":t[0]||(t[0]=_=>e.formState.precipitationSamplesNum=_),"addon-after":"个"},null,8,["value"])]),_:1})]),_:1}),a(u,{span:12},{default:i(()=>[a(n,{label:"pH<5.6样本数",name:"ph56SamplesNum"},{default:i(()=>[a(d,{style:{width:"424px"},controls:!1,placeholder:"请输入pH<5.6样本数",class:"right-input",value:e.formState.ph56SamplesNum,"onUpdate:value":t[1]||(t[1]=_=>e.formState.ph56SamplesNum=_),"addon-after":"个"},null,8,["value"])]),_:1})]),_:1}),a(u,{span:12},{default:i(()=>[a(n,{label:"pH均值范围",class:"custom-range-number",name:["number"],rules:[{required:!0,ElMessage:"请输入合理数值范围!",trigger:"blur",validator:e.validatorNumber}]},{default:i(()=>[D("div",{class:sa(["range-number-cont",e.isError?"error":e.isActive?"active":"unActive"])},[a(n,{class:"range-number-input"},{default:i(()=>[a(d,{style:{width:"100%"},precision:2,onMouseover:e.mouseover,onMouseout:e.mouseout,onFocus:t[2]||(t[2]=_=>(e.isActive=!0,e.isFocus=!0)),onBlur:e.blur,controls:!1,placeholder:"最小值",value:e.formState.number.minAcidRainValue,"onUpdate:value":t[3]||(t[3]=_=>e.formState.number.minAcidRainValue=_)},null,8,["value"])]),_:1}),t[8]||(t[8]=D("span",{class:"custom-icon"},"~",-1)),a(n,{class:"range-number-input"},{default:i(()=>[a(d,{style:{width:"100%"},precision:2,onMouseover:e.mouseover,onMouseout:e.mouseout,onFocus:t[4]||(t[4]=_=>(e.isActive=!0,e.isFocus=!0)),onBlur:e.blur,controls:!1,placeholder:"最大值",value:e.formState.number.maxAcidRainValue,"onUpdate:value":t[5]||(t[5]=_=>e.formState.number.maxAcidRainValue=_)},null,8,["value"])]),_:1})],2)]),_:1},8,["rules"])]),_:1})],64)):I("v-if",!0),a(u,{span:12},{default:i(()=>[a(y,null,{default:i(()=>[a(u,{span:24},{default:i(()=>[(j(!0),G(de,null,Me(e.formState.thunderMap,(_,b)=>(j(),G("div",{key:b},[a(n,{name:["thunderMap",b],label:b==0?e.labelTitile:"",rules:[{required:e.vectorRequired,trigger:"blur",index:b,selfMessage:e.placeholderTip,validator:e.validateFileName}]},{default:i(()=>[D("div",Ma,[a(e.Upload,{name:"pic",defaultFiles:_.data,"onUpdate:defaultFiles":S=>_.data=S,fileTypes:e.fileTypes,fileSize:e.upFileSize,maxCount:1,fileTypeMessage:e.fileTypeMessage,fileSizeMessage:`文件最大${e.upFileSize}M`,onUpFileList:S=>e.getUploadFile(S,b,"thunder")},{tip:i(()=>[D("div",ka,[D("div",xa,[a(n,{name:["thunderMap",b]},{default:i(()=>[a(s,{placeholder:e.placeholderTip,onBlur:S=>e.saveIndex(S,b,"thunder"),value:_.fileName,"onUpdate:value":S=>_.fileName=S,valueModifiers:{trim:!0},style:{width:"356px"}},null,8,["placeholder","onBlur","value","onUpdate:value"])]),_:2},1032,["name"]),e.formState.dataType==0?(j(),G(de,{key:0},[pe(a(c,{class:"add-icon",name:"shanjian",size:"16",onClick:S=>e.deleteMap(b,"thunder")},null,8,["onClick"]),[[ve,e.formState.thunderMap.length>1]]),pe(a(c,{class:"add-icon",name:"tianjia",size:"16",onClick:t[6]||(t[6]=S=>e.addMap("thunder"))},null,512),[[ve,b==e.formState.thunderMap.length-1]])],64)):I("v-if",!0)]),D("div",Ta,ke(e.uploadFileTip),1)])]),_:2},1032,["defaultFiles","onUpdate:defaultFiles","fileTypes","fileSize","fileTypeMessage","fileSizeMessage","onUpFileList"])])]),_:2},1032,["name","label","rules"])]))),128))]),_:1})]),_:1})]),_:1}),a(u,{span:12},{default:i(()=>[a(y,null,{default:i(()=>[a(n,{name:"remark",label:"来源"},{default:i(()=>[a(s,{style:{width:"424px"},value:e.formState.remark,"onUpdate:value":t[7]||(t[7]=_=>e.formState.remark=_),valueModifiers:{trim:!0},placeholder:"请输入来源"},null,8,["value"])]),_:1}),I(` <a-col :span="24">\r
                                <div v-for="(item, index) in formState.dataSources" :key="index">\r
                                    <a-form-item\r
                                        :name="['dataSources', index]"\r
                                        :label="index == 0 ? '数据来源' : ''"\r
                                        :rules="[\r
                                            {\r
                                                required: false,\r
                                                trigger: 'blur',\r
                                                index: index,\r
                                                selfMessage: '请输入数据来源的文档名称',\r
                                                validator: validateFileName,\r
                                            },\r
                                        ]"\r
                                    >\r
                                        <div class="add-upload-file">\r
                                            <Upload\r
                                                v-model:defaultFiles="item.data"\r
                                                :fileTypes="DATA_SOURCE_FILE_TYPES"\r
                                                :fileSize="50"\r
                                                :maxCount="1"\r
                                                fileTypeMessage="目前支持 JPG、PNG、doc、docx、pdf格式"\r
                                                fileSizeMessage="文件最大50M"\r
                                                @upFileList="\r
                                                    (val) => getUploadFile(val, index, 'source')\r
                                                "\r
                                            >\r
                                                <template #tip>\r
                                                    <div class="tip-content">\r
                                                        <div class="tip-content-add">\r
                                                            <a-form-item\r
                                                                :name="['dataSources', index]"\r
                                                            >\r
                                                                <a-input\r
                                                                    placeholder="请输入图片名称"\r
                                                                    @blur="\r
                                                                        (e) =>\r
                                                                            saveIndex(\r
                                                                                e,\r
                                                                                index,\r
                                                                                'source',\r
                                                                            )\r
                                                                    "\r
                                                                    v-model:value="item.fileName"\r
                                                                    style="width: 356px"\r
                                                                ></a-input>\r
                                                            </a-form-item>\r
                                                            <iconpark-icon\r
                                                                class="add-icon"\r
                                                                name="shanjian"\r
                                                                size="16"\r
                                                                @click="deleteMap(index, 'source')"\r
                                                                v-show="\r
                                                                    formState.dataSources.length > 1\r
                                                                "\r
                                                            ></iconpark-icon>\r
                                                            <iconpark-icon\r
                                                                class="add-icon"\r
                                                                name="tianjia"\r
                                                                size="16"\r
                                                                @click="addMap('source')"\r
                                                                v-show="\r
                                                                    index ==\r
                                                                    formState.dataSources.length - 1\r
                                                                "\r
                                                            ></iconpark-icon>\r
                                                        </div>\r
\r
                                                        <div class="tip-title"\r
                                                            >说明：支持\r
                                                            JPG、PNG、doc、docx、pdf等，上限1个，上限50M</div\r
                                                        >\r
                                                    </div>\r
                                                </template>\r
                                            </Upload>\r
                                        </div>\r
                                    </a-form-item>\r
                                </div>\r
                            </a-col> `)]),_:1})]),_:1})]),_:1}),a(n,{style:{"text-align":"center"},class:"footer-list"},{default:i(()=>[a(x,{class:"handle-button",onClick:e.resetForm},{default:i(()=>[...t[9]||(t[9]=[U(" 取消 ",-1)])]),_:1}),a(x,{class:"handle-button",type:"primary",onClick:e.saveData},{default:i(()=>[...t[10]||(t[10]=[U("保存",-1)])]),_:1})]),_:1})]),_:1},8,["model"])])])}const $e=te(ya,[["render",Da],["__scopeId","data-v-39895bc8"],["__file","D:/fcs/web/web-sx/web-sx/src/views/hucang/commonDataManage/climateDataBase/components/add/AddAcidRain.vue"]]),Pa={__name:"AddTemperature",props:{selectData:{type:Object}},setup(F,{expose:t}){t();const p=F,e=m({provice:""}),h=z(),k=O(),d=m(!!h.query.id),n=m(null),u=v=>(f,N,V)=>N?be(N)?Promise.resolve():Promise.reject("请输入数字"):Promise.reject(v),s=(v,f,N)=>{if(v.required){if(!f.fileName&&!f.data.length)return Promise.reject("请上传文件并且输入数据文件名称");if(!f.fileName)return Promise.reject("请输入数据文件名称");if(!f.data.length)return Promise.reject("请上传文件");if(f.fileName&&f.data.length)return Promise.resolve()}else{if(f.fileName&&f.data.length||!f.fileName&&!f.data.length)return Promise.resolve();if(f.fileName)return f.length?Promise.resolve():Promise.reject("请上传文件");if(f.data.length)return f.fileName?Promise.resolve():Promise.reject(v.selfMessage)}},c=m({dataType:0,winterOutdoorTemperature:"",winterIndoorTemperature:"",summerOutdoorTemperature:"",summerIndoorTemperature:"",highExtremeTemperature:"",lowExtremeTemperature:"",avgTemperature:"",remark:"",thunderMap:[{data:[],fileName:""}],dataSources:[{data:[],fileName:""}]}),y=m(!1),x=m("温度分布图"),o=m("说明：文件格式需为JPG、PNG，上限1个，文件最大5M"),_=m(5),b=m("目前支持 JPG、PNG 格式"),S=m(ae),E=m("请输入图片名称"),R=v=>{n.value.resetFields(),c.value.dataType=v.target.value,c.value.thunderMap=[{data:[],fileName:""}],c.value.dataSources=[{data:[],fileName:""}],v.target.value=="1"?y.value=!1:y.value=!0,v.target.value=="1"?x.value="温度分布图":x.value="数据文件",v.target.value=="1"?o.value="说明：文件格式需为JPG、PNG，上限1个，文件最大5M":o.value="说明：格式需为tif、shp 矢量数据格式，上限1个，最大500M",v.target.value=="1"?_.value=5:_.value=500,v.target.value=="1"?b.value="目前支持 JPG、PNG 格式":b.value="目前支持 tif、shp矢量数据格式",v.target.value=="1"?S.value=ae:S.value=me,v.target.value=="1"?E.value="请输入图片名称":E.value="请输入数据文件名称"},C=(v,f,N)=>{N=="thunder"?n.value.validateFields([["thunderMap",f]]):n.value.validateFields([["dataSources",f]])},l={dataType:[{required:!0,ElMessage:"请选择",trigger:"change"}],winterOutdoorTemperature:[{required:!0,trigger:"blur",validator:u("请输入冬季通风室外计算温度")}],winterIndoorTemperature:[{required:!0,trigger:"blur",validator:u("请输入冬季采暖室外计算温度")}],summerOutdoorTemperature:[{required:!0,trigger:"blur",validator:u("请输入夏季通风室外计算温度")}],summerIndoorTemperature:[{required:!0,trigger:"blur",validator:u("请输入夏季采暖室外计算温度")}],highExtremeTemperature:[{required:!0,trigger:"blur",validator:u("请输入历年极端最高气温")}],lowExtremeTemperature:[{required:!0,trigger:"blur",validator:u("请输入极端最低气温")}],avgTemperature:[{required:!0,trigger:"blur",validator:u("请输入多年平均气温")}]},r=v=>{v=="thunder"?c.value.thunderMap.push({data:[],fileName:""}):c.value.dataSources.push({data:[],fileName:""})},M=(v,f)=>{f=="thunder"?c.value.thunderMap.splice(v,1):c.value.dataSources.splice(v,1)},P=(v,f,N)=>{N=="thunder"?(c.value.thunderMap[f].data=[v],n.value.validateFields([["thunderMap",f]])):(c.value.dataSources[f].data=[v],n.value.validateFields([["dataSources",f]])),console.log("--或缺文件--",v)},A=()=>{n.value.resetFields(),k.go(-1)};L(()=>{d.value&&ge()});const q=()=>{n.value.validateFields().then(()=>{J()}).catch(v=>{console.log("err",v)})},J=async()=>{try{let{dataType:v,avgTemperature:f,highExtremeTemperature:N,lowExtremeTemperature:V,summerIndoorTemperature:B,summerOutdoorTemperature:H,winterIndoorTemperature:w,winterOutdoorTemperature:T,remark:Y}=c.value,le={fileName:"",filePath:""};c.value.thunderMap.forEach(Q=>{le.fileName=Q.fileName,le.filePath=Q.data.length&&Q.data[0].filePath});let X={dataType:v,avgTemperature:f,highExtremeTemperature:N,lowExtremeTemperature:V,summerIndoorTemperature:B,summerOutdoorTemperature:H,winterIndoorTemperature:w,winterOutdoorTemperature:T,areaCode:p.selectData.code[p.selectData.code.length-1],remark:Y,mapImage:le};d.value&&(X.id=c.value.id,delete X.areaCode);let $=d.value?await Ee(X):await Ae(X);$.code==200&&$.data&&(W.success("提交成功"),n.value.resetFields(),k.go(-1))}catch(v){console.log("报错",v)}},ge=async v=>{try{let f=h.query.id,N=await Ne(f);if(N.code==200&&N.data){let{dataType:V,avgTemperature:B,highExtremeTemperature:H,lowExtremeTemperature:w,summerIndoorTemperature:T,summerOutdoorTemperature:Y,winterIndoorTemperature:le,winterOutdoorTemperature:X,remark:$,id:Q,areaCode:fe}=N.data;c.value={dataType:V,avgTemperature:B,highExtremeTemperature:H,lowExtremeTemperature:w,summerIndoorTemperature:T,summerOutdoorTemperature:Y,winterIndoorTemperature:le,winterOutdoorTemperature:X,remark:$,id:Q,areaCode:fe},c.value.thunderMap=[{data:[N.data.mapImage],fileName:N.data.mapImage.fileName}],e.value.provice=N.data.areaName}}catch{}},ce={props:p,editSelectData:e,route:h,router:k,isAddOrEdit:d,temperatureFormRef:n,checkReuqired:u,validateFileName:s,formState:c,vectorRequired:y,labelTitile:x,uploadFileTip:o,upFileSize:_,fileTypeMessage:b,fileTypes:S,placeholderTip:E,getModeType:R,saveIndex:C,rules:l,addMap:r,deleteMap:M,getUploadFile:P,resetForm:A,saveData:q,submitData:J,getTemperatureDetailData:ge,ref:m,reactive:K,toRefs:ne,onBeforeMount:Z,onMounted:L,watch:ie,computed:re,get useRoute(){return z},get useRouter(){return O},linkage:he,CommonAddDataHeader:oe,Upload:ue,get temperaturePattern(){return be},get DATA_SOURCE_FILE_TYPES(){return ye},get MAP_FILE_TYPES(){return ae},get VECTOR_MAP_FILE_TYPES(){return me},get addTemperature(){return Ae},get updateTemperature(){return Ee},get getTemperatureDetail(){return Ne},get ElMessage(){return W}};return Object.defineProperty(ce,"__isScriptSetup",{enumerable:!1,value:!0}),ce}},wa={class:"add-power-right"},Fa={class:"add-power-right-content"},Na={class:"add-upload-file"},Ea={class:"tip-content"},Aa={class:"tip-content-add"},Ua={class:"tip-title"};function Ra(F,t,p,e,h,k){const d=g("a-input"),n=g("a-form-item"),u=g("a-col"),s=g("iconpark-icon"),c=g("a-row"),y=g("a-button"),x=g("a-form");return j(),G("div",wa,[a(e.CommonAddDataHeader,{selectData:p.selectData.provice?p.selectData:e.editSelectData},null,8,["selectData"]),D("div",Fa,[t[11]||(t[11]=D("h4",{class:"content-title"},[D("img",{src:se,alt:""}),U(" 项目基本信息 ")],-1)),a(x,{ref:"temperatureFormRef",name:"advanced_search",rules:e.rules,layout:"vertical",model:e.formState},{default:i(()=>[a(c,null,{default:i(()=>[I(` <a-col :span="12">\r
                        <a-form-item name="dataType" label="数据格式">\r
                            <a-radio-group v-model:value="formState.dataType" name="radioGroup" @change="getModeType">\r
                                <a-radio :value="0">标准数据</a-radio>\r
                                <a-radio :value="1">矢量地图类数据</a-radio>\r
                            </a-radio-group>\r
                        </a-form-item>\r
                    </a-col> `),e.formState.dataType==0?(j(),G(de,{key:0},[a(u,{span:12},{default:i(()=>[a(n,{label:"冬季通风室外计算温度",name:"winterOutdoorTemperature"},{default:i(()=>[a(d,{style:{width:"380px"},suffix:"℃",controls:!1,value:e.formState.winterOutdoorTemperature,"onUpdate:value":t[0]||(t[0]=o=>e.formState.winterOutdoorTemperature=o),valueModifiers:{trim:!0},placeholder:"请输入冬季通风室外计算温度"},null,8,["value"])]),_:1})]),_:1}),a(u,{span:12},{default:i(()=>[a(n,{label:"冬季采暖室外计算温度",name:"winterIndoorTemperature"},{default:i(()=>[a(d,{style:{width:"380px"},suffix:"℃",value:e.formState.winterIndoorTemperature,"onUpdate:value":t[1]||(t[1]=o=>e.formState.winterIndoorTemperature=o),valueModifiers:{trim:!0},placeholder:"请输入冬季采暖室外计算温度"},null,8,["value"])]),_:1})]),_:1}),a(u,{span:12},{default:i(()=>[a(n,{label:"夏季通风室外计算温度",name:"summerOutdoorTemperature"},{default:i(()=>[a(d,{style:{width:"380px"},suffix:"℃",value:e.formState.summerOutdoorTemperature,"onUpdate:value":t[2]||(t[2]=o=>e.formState.summerOutdoorTemperature=o),valueModifiers:{trim:!0},placeholder:"请输入夏季通风室外计算温度"},null,8,["value"])]),_:1})]),_:1}),a(u,{span:12},{default:i(()=>[a(n,{label:"夏季空调室外计算干球温度",name:"summerIndoorTemperature"},{default:i(()=>[a(d,{style:{width:"380px"},suffix:"℃",value:e.formState.summerIndoorTemperature,"onUpdate:value":t[3]||(t[3]=o=>e.formState.summerIndoorTemperature=o),valueModifiers:{trim:!0},placeholder:"请输入夏季空调室外计算干球温度"},null,8,["value"])]),_:1})]),_:1}),a(u,{span:12},{default:i(()=>[a(n,{label:"历年极端最高气温",name:"highExtremeTemperature"},{default:i(()=>[a(d,{style:{width:"380px"},suffix:"℃",value:e.formState.highExtremeTemperature,"onUpdate:value":t[4]||(t[4]=o=>e.formState.highExtremeTemperature=o),valueModifiers:{trim:!0},placeholder:"请输入历年极端最高气温"},null,8,["value"])]),_:1})]),_:1}),a(u,{span:12},{default:i(()=>[a(n,{label:"极端最低气温",name:"lowExtremeTemperature"},{default:i(()=>[a(d,{style:{width:"380px"},suffix:"℃",value:e.formState.lowExtremeTemperature,"onUpdate:value":t[5]||(t[5]=o=>e.formState.lowExtremeTemperature=o),valueModifiers:{trim:!0},placeholder:"请输入极端最低气温"},null,8,["value"])]),_:1})]),_:1}),a(u,{span:12},{default:i(()=>[a(n,{label:"多年平均气温",name:"avgTemperature"},{default:i(()=>[a(d,{style:{width:"380px"},suffix:"℃",value:e.formState.avgTemperature,"onUpdate:value":t[6]||(t[6]=o=>e.formState.avgTemperature=o),valueModifiers:{trim:!0},placeholder:"请输入多年平均气温"},null,8,["value"])]),_:1})]),_:1})],64)):I("v-if",!0),a(u,{span:12},{default:i(()=>[a(c,null,{default:i(()=>[a(u,{span:24},{default:i(()=>[(j(!0),G(de,null,Me(e.formState.thunderMap,(o,_)=>(j(),G("div",{key:_},[a(n,{name:["thunderMap",_],label:_==0?e.labelTitile:"",rules:[{required:e.vectorRequired,trigger:"blur",index:_,selfMessage:e.placeholderTip,validator:e.validateFileName}]},{default:i(()=>[D("div",Na,[a(e.Upload,{name:"pic",defaultFiles:o.data,"onUpdate:defaultFiles":b=>o.data=b,fileTypes:e.fileTypes,fileSize:e.upFileSize,maxCount:1,fileTypeMessage:e.fileTypeMessage,fileSizeMessage:`文件最大${e.upFileSize}M`,onUpFileList:b=>e.getUploadFile(b,_,"thunder")},{tip:i(()=>[D("div",Ea,[D("div",Aa,[a(n,{name:["thunderMap",_]},{default:i(()=>[a(d,{placeholder:e.placeholderTip,onBlur:b=>e.saveIndex(b,_,"thunder"),value:o.fileName,"onUpdate:value":b=>o.fileName=b,valueModifiers:{trim:!0},style:{width:"312px"}},null,8,["placeholder","onBlur","value","onUpdate:value"])]),_:2},1032,["name"]),e.formState.dataType==0?(j(),G(de,{key:0},[pe(a(s,{class:"add-icon",name:"shanjian",size:"16",onClick:b=>e.deleteMap(_,"thunder")},null,8,["onClick"]),[[ve,e.formState.thunderMap.length>1]]),pe(a(s,{class:"add-icon",name:"tianjia",size:"16",onClick:t[7]||(t[7]=b=>e.addMap("thunder"))},null,512),[[ve,_==e.formState.thunderMap.length-1]])],64)):I("v-if",!0)]),D("div",Ua,ke(e.uploadFileTip),1)])]),_:2},1032,["defaultFiles","onUpdate:defaultFiles","fileTypes","fileSize","fileTypeMessage","fileSizeMessage","onUpFileList"])])]),_:2},1032,["name","label","rules"])]))),128))]),_:1})]),_:1})]),_:1}),a(u,{span:12},{default:i(()=>[a(c,null,{default:i(()=>[a(n,{name:"remark",label:"来源"},{default:i(()=>[a(d,{style:{width:"424px"},value:e.formState.remark,"onUpdate:value":t[8]||(t[8]=o=>e.formState.remark=o),valueModifiers:{trim:!0},placeholder:"请输入来源"},null,8,["value"])]),_:1}),I(` <a-col :span="24">\r
                                <div v-for="(item, index) in formState.dataSources" :key="index">\r
                                    <a-form-item :name="['dataSources', index]" :label="index == 0 ? '数据来源' : ''" :rules="[\r
                                        {\r
                                            required: false,\r
                                            trigger: 'blur',\r
                                            index: index,\r
                                            selfMessage: '请输入数据来源的文档名称',\r
                                            validator: validateFileName,\r
                                        },\r
                                    ]">\r
                                        <div class="add-upload-file ">\r
                                            <Upload \r
                                                v-model:defaultFiles="item.data" \r
                                                :fileTypes="DATA_SOURCE_FILE_TYPES" \r
                                                :fileSize="50" \r
                                                :maxCount="1"\r
                                                fileTypeMessage="目前支持 JPG、PNG、doc、docx、pdf格式" \r
                                                fileSizeMessage="文件最大50M"\r
                                                @upFileList="(val) => getUploadFile(val, index, 'source')">\r
                                                <template #tip>\r
                                                    <div class="tip-content">\r
                                                        <div class="tip-content-add">\r
                                                            <a-form-item :name="['dataSources', index]">\r
                                                                <a-input placeholder="请输入数据来源的文档名称"\r
                                                                    @blur="(e) => saveIndex(e, index, 'source')"\r
                                                                    v-model:value.trim="item.fileName"\r
                                                                    style="width: 312px"></a-input>\r
                                                            </a-form-item>\r
                                                            <iconpark-icon class="add-icon" name="shanjian" size="16"\r
                                                                @click="deleteMap(index, 'source')"\r
                                                                v-show="formState.dataSources.length > 1"></iconpark-icon>\r
                                                            <iconpark-icon class="add-icon" name="tianjia" size="16"\r
                                                                @click="addMap('source')"\r
                                                                v-show="index == formState.dataSources.length - 1"></iconpark-icon>\r
                                                        </div>\r
\r
                                                        <div class="tip-title">说明：支持 JPG、PNG、doc、docx、pdf等，上限1个，上限50M\r
                                                        </div>\r
                                                    </div>\r
                                                </template>\r
                                            </Upload>\r
\r
                                        </div>\r
                                    </a-form-item>\r
                                </div>\r
\r
                            </a-col> `)]),_:1})]),_:1})]),_:1}),a(n,{style:{"text-align":"center"},class:"footer-list"},{default:i(()=>[a(y,{class:"handle-button",onClick:e.resetForm},{default:i(()=>[...t[9]||(t[9]=[U(" 取消 ",-1)])]),_:1}),a(y,{class:"handle-button",type:"primary",onClick:e.saveData},{default:i(()=>[...t[10]||(t[10]=[U("保存",-1)])]),_:1})]),_:1})]),_:1},8,["model"])])])}const ea=te(Pa,[["render",Ra],["__scopeId","data-v-e108b111"],["__file","D:/fcs/web/web-sx/web-sx/src/views/hucang/commonDataManage/climateDataBase/components/add/AddTemperature.vue"]]),Ca={__name:"AddWindPressure",props:{selectData:{type:Object}},setup(F,{expose:t}){t();const p=F,e=m({provice:""}),h=z(),k=O(),d=m(!!h.query.id),n=m(null),u=(l,r,M)=>{if(l.required){if(!r.fileName&&!r.data.length)return Promise.reject("请上传文件并且输入数据文件名称");if(!r.fileName)return Promise.reject("请输入数据文件名称");if(!r.data.length)return Promise.reject("请上传文件");if(r.fileName&&r.data.length)return Promise.resolve()}else{if(r.fileName&&r.data.length||!r.fileName&&!r.data.length)return Promise.resolve();if(r.fileName)return r.length?Promise.resolve():Promise.reject("请上传文件");if(r.data.length)return r.fileName?Promise.resolve():Promise.reject(l.selfMessage)}},s=m({dataType:0,n10:"",n50:"",n100:"",remark:""}),c=(l,r,M)=>{n.value.validateFields([["remark",r]])},y={dataType:[{required:!0,ElMessage:"请选择",trigger:"change"}],n10:[{required:!0,ElMessage:"请输入n=10",trigger:"blur"}],n50:[{required:!0,ElMessage:"请输入n=50",trigger:"blur"}],n100:[{required:!0,ElMessage:"请输入n=100",trigger:"blur"}]},x=l=>{s.value.remark.push({data:[],fileName:""})},o=(l,r)=>{s.value.remark.splice(l,1)},_=(l,r,M)=>{s.value.remark[r].data=l,n.value.validateFields([["remark",r]])},b=()=>{n.value.resetFields(),k.go(-1)};L(()=>{d.value&&R()});const S=()=>{n.value.validateFields().then(()=>{E()}).catch(l=>{console.log("err",l)})},E=async()=>{try{let{dataType:l,n10:r,n50:M,n100:P,remark:A}=s.value,q={areaCode:p.selectData.code[p.selectData.code.length-1],dataType:l,n10:r,n50:M,n100:P,remark:A};h.query.id&&(q.id=s.value.id,delete q.areaCode);let J=d.value?await Re(q):await Ce(q);J.code==200&&J.data&&(W.success("提交成功"),n.value.resetFields(),k.go(-1))}catch{}},R=async()=>{try{let l=await Ue(h.query.id);if(l.code==200&&l.data){let{dataType:r,n10:M,n50:P,n100:A,remark:q,areaCode:J}=l.data;s.value={id:l.data.id,dataType:r,n10:M,n50:P,n100:A,areaCode:J,remark:q},e.value.provice=l.data.areaName}}catch{}},C={props:p,editSelectData:e,route:h,router:k,isAddOrEdit:d,windPressureRef:n,validateFileName:u,formState:s,saveIndex:c,rules:y,addMap:x,deleteMap:o,getUploadFile:_,resetForm:b,saveData:S,submitData:E,getWindPressureDetailData:R,ref:m,reactive:K,toRefs:ne,onBeforeMount:Z,onMounted:L,watch:ie,computed:re,get useRoute(){return z},get useRouter(){return O},CommonAddDataHeader:oe,get addWindPressure(){return Ce},get getWindPressureDetail(){return Ue},get updateWindPressure(){return Re},get DATA_SOURCE_FILE_TYPES(){return ye},get MAP_FILE_TYPES(){return ae},get VECTOR_MAP_FILE_TYPES(){return me},get temperaturePattern(){return be},get ElMessage(){return W}};return Object.defineProperty(C,"__isScriptSetup",{enumerable:!1,value:!0}),C}},ja={class:"add-power-right"},qa={class:"add-power-right-content"};function Ia(F,t,p,e,h,k){const d=g("a-input-number"),n=g("a-form-item"),u=g("a-col"),s=g("a-input"),c=g("a-row"),y=g("a-button"),x=g("a-form");return j(),G("div",ja,[a(e.CommonAddDataHeader,{selectData:p.selectData.provice?p.selectData:e.editSelectData},null,8,["selectData"]),D("div",qa,[t[6]||(t[6]=D("h4",{class:"content-title"},[D("img",{src:se,alt:""}),U(" 项目基本信息 ")],-1)),a(x,{ref:"windPressureRef",name:"advanced_search",rules:e.rules,class:"ant-advanced-search-form",layout:"vertical",model:e.formState},{default:i(()=>[a(c,null,{default:i(()=>[I(` <a-col :span="12">\r
                        <a-form-item name="dataType" label="数据格式">\r
                            <a-radio-group v-model:value="formState.dataType" name="radioGroup">\r
                                <a-radio :value="0">标准数据</a-radio>\r
                            </a-radio-group>\r
                        </a-form-item>\r
                    </a-col> `),a(u,{span:12},{default:i(()=>[a(n,{label:"n=10",name:"n10"},{default:i(()=>[a(d,{style:{width:"424px"},controls:!1,placeholder:"请输入n=10",class:"right-input",value:e.formState.n10,"onUpdate:value":t[0]||(t[0]=o=>e.formState.n10=o),"addon-after":"kN/m²"},null,8,["value"])]),_:1})]),_:1}),a(u,{span:12},{default:i(()=>[a(n,{label:"n=50",name:"n50"},{default:i(()=>[a(d,{style:{width:"424px"},controls:!1,placeholder:"请输入n=50",class:"right-input",value:e.formState.n50,"onUpdate:value":t[1]||(t[1]=o=>e.formState.n50=o),"addon-after":"kN/m²"},null,8,["value"])]),_:1})]),_:1}),a(u,{span:12},{default:i(()=>[a(n,{label:"n=100",name:"n100"},{default:i(()=>[a(d,{style:{width:"424px"},controls:!1,placeholder:"请输入n=100",class:"right-input",value:e.formState.n100,"onUpdate:value":t[2]||(t[2]=o=>e.formState.n100=o),"addon-after":"kN/m²"},null,8,["value"])]),_:1})]),_:1}),a(u,{span:12},{default:i(()=>[a(n,{name:"remark",label:"来源"},{default:i(()=>[a(s,{style:{width:"424px"},value:e.formState.remark,"onUpdate:value":t[3]||(t[3]=o=>e.formState.remark=o),valueModifiers:{trim:!0},placeholder:"请输入来源"},null,8,["value"])]),_:1}),I(` <a-row>\r
                            <a-col :span="24">\r
                                <div v-for="(item, index) in formState.remark" :key="index">\r
                                    <a-form-item :name="['remark', index]" :label="index == 0 ? '数据来源' : ''" :rules="[\r
                                        {\r
                                            required: false,\r
                                            trigger: 'blur',\r
                                            index: index,\r
                                            selfMessage: '请输入数据来源的文档名称',\r
                                            validator: validateFileName,\r
                                        },\r
                                    ]">\r
                                        <div class="add-upload-file">\r
                                            <Upload v-model:defaultFiles="item.data" :fileTypes="DATA_SOURCE_FILE_TYPES"\r
                                                :fileSize="50" :maxCount="1" fileTypeMessage="目前支持 JPG、PNG、doc、docx、pdf格式"\r
                                                fileSizeMessage="文件最大50M" @upFileList="(val) => getUploadFile(val, index, 'source')\r
                                                    ">\r
                                                <template #tip>\r
                                                    <div class="tip-content">\r
                                                        <div class="tip-content-add">\r
                                                            <a-form-item :name="['remark', index]">\r
                                                                <a-input placeholder="请输入图片名称" @blur="(e) =>\r
                                                                        saveIndex(\r
                                                                            e,\r
                                                                            index,\r
                                                                            'source',\r
                                                                        )\r
                                                                    " v-model:value="item.fileName"\r
                                                                    style="width: 356px"></a-input>\r
                                                            </a-form-item>\r
                                                            <iconpark-icon class="add-icon" name="shanjian" size="16"\r
                                                                @click="deleteMap(index, 'source')" v-show="formState.remark.length > 1\r
                                                                    "></iconpark-icon>\r
                                                            <iconpark-icon class="add-icon" name="tianjia" size="16"\r
                                                                @click="addMap('source')" v-show="index ==\r
                                                                    formState.remark.length - 1\r
                                                                    "></iconpark-icon>\r
                                                        </div>\r
\r
                                                        <div class="tip-title">说明：支持\r
                                                            JPG、PNG、doc、docx、pdf等，上限1个，上限50M</div>\r
                                                    </div>\r
                                                </template>\r
                                            </Upload>\r
                                        </div>\r
                                    </a-form-item>\r
                                </div>\r
                            </a-col>\r
                        </a-row> `)]),_:1})]),_:1}),a(n,{style:{"text-align":"center"},class:"footer-list"},{default:i(()=>[a(y,{class:"handle-button",onClick:e.resetForm},{default:i(()=>[...t[4]||(t[4]=[U(" 取消 ",-1)])]),_:1}),a(y,{class:"handle-button",type:"primary",onClick:e.saveData},{default:i(()=>[...t[5]||(t[5]=[U("保存",-1)])]),_:1})]),_:1})]),_:1},8,["model"])])])}const aa=te(Ca,[["render",Ia],["__scopeId","data-v-c7f50bdc"],["__file","D:/fcs/web/web-sx/web-sx/src/views/hucang/commonDataManage/climateDataBase/components/add/AddWindPressure.vue"]]),Ga={__name:"AddSnowPressure",props:{selectData:{type:Object}},setup(F,{expose:t}){t();const p=F,e=m({provice:""}),h=z(),k=O(),d=m(!!h.query.id),n=m(null),u=(l,r,M)=>{if(l.required){if(!r.fileName&&!r.data.length)return Promise.reject("请上传文件并且输入数据文件名称");if(!r.fileName)return Promise.reject("请输入数据文件名称");if(!r.data.length)return Promise.reject("请上传文件");if(r.fileName&&r.data.length)return Promise.resolve()}else{if(r.fileName&&r.data.length||!r.fileName&&!r.data.length)return Promise.resolve();if(r.fileName)return r.length?Promise.resolve():Promise.reject("请上传文件");if(r.data.length)return r.fileName?Promise.resolve():Promise.reject(l.selfMessage)}},s=m({dataType:0,n10:"",n50:"",n100:"",remark:""}),c=(l,r,M)=>{n.value.validateFields([["remark",r]])},y={dataType:[{required:!0,ElMessage:"请选择",trigger:"change"}],n10:[{required:!0,ElMessage:"请输入n=10",trigger:"blur"}],n50:[{required:!0,ElMessage:"请输入n=50",trigger:"blur"}],n100:[{required:!0,ElMessage:"请输入n=100",trigger:"blur"}]},x=l=>{s.value.remark.push({data:[],fileName:""})},o=(l,r)=>{s.value.remark.splice(l,1)},_=(l,r,M)=>{s.value.remark[r].data=l,n.value.validateFields([["remark",r]])},b=()=>{n.value.resetFields(),k.go(-1)};L(()=>{d.value&&R()});const S=()=>{n.value.validateFields().then(()=>{E()}).catch(l=>{console.log("err",l)})},E=async()=>{try{let{dataType:l,n10:r,n50:M,n100:P,remark:A}=s.value,q={areaCode:p.selectData.code[p.selectData.code.length-1],dataType:l,n10:r,n50:M,n100:P,remark:A};h.query.id&&(q.id=s.value.id,delete q.areaCode);let J=d.value?await qe(q):await Ie(q);J.code==200&&J.data?(W.success("提交成功"),n.value.resetFields(),k.go(-1)):W.error(J.msg)}catch{}},R=async()=>{try{let l=await je(h.query.id);if(l.code==200&&l.data){let{dataType:r,n10:M,n50:P,n100:A,remark:q,areaCode:J}=l.data;s.value={id:l.data.id,dataType:r,n10:M,n50:P,n100:A,areaCode:J,remark:q},e.value.provice=l.data.areaName}}catch{}},C={props:p,editSelectData:e,route:h,router:k,isAddOrEdit:d,windPressureRef:n,validateFileName:u,formState:s,saveIndex:c,rules:y,addMap:x,deleteMap:o,getUploadFile:_,resetForm:b,saveData:S,submitData:E,getSnowPressureDetailData:R,ref:m,reactive:K,toRefs:ne,onBeforeMount:Z,onMounted:L,watch:ie,computed:re,get useRoute(){return z},get useRouter(){return O},CommonAddDataHeader:oe,Upload:ue,get addSnow(){return Ie},get getSnowDetail(){return je},get updateSnow(){return qe},get ElMessage(){return W}};return Object.defineProperty(C,"__isScriptSetup",{enumerable:!1,value:!0}),C}},za={class:"add-power-right"},Oa={class:"add-power-right-content"};function La(F,t,p,e,h,k){const d=g("a-input-number"),n=g("a-form-item"),u=g("a-col"),s=g("a-input"),c=g("a-row"),y=g("a-button"),x=g("a-form");return j(),G("div",za,[a(e.CommonAddDataHeader,{selectData:p.selectData.provice?p.selectData:e.editSelectData},null,8,["selectData"]),D("div",Oa,[t[6]||(t[6]=D("h4",{class:"content-title"},[D("img",{src:se,alt:""}),U(" 项目基本信息 ")],-1)),a(x,{ref:"windPressureRef",name:"advanced_search",rules:e.rules,class:"ant-advanced-search-form",layout:"vertical",model:e.formState},{default:i(()=>[a(c,null,{default:i(()=>[I(` <a-col :span="12">\r
                        <a-form-item name="dataType" label="数据格式">\r
                            <a-radio-group v-model:value="formState.dataType" name="radioGroup">\r
                                <a-radio :value="0">标准数据</a-radio>\r
                            </a-radio-group>\r
                        </a-form-item>\r
                    </a-col> `),a(u,{span:12},{default:i(()=>[a(n,{label:"n=10",name:"n10"},{default:i(()=>[a(d,{style:{width:"424px"},controls:!1,placeholder:"请输入n=10",class:"right-input",value:e.formState.n10,"onUpdate:value":t[0]||(t[0]=o=>e.formState.n10=o),"addon-after":"kN/m²"},null,8,["value"])]),_:1})]),_:1}),a(u,{span:12},{default:i(()=>[a(n,{label:"n=50",name:"n50"},{default:i(()=>[a(d,{style:{width:"424px"},controls:!1,placeholder:"请输入n=50",class:"right-input",value:e.formState.n50,"onUpdate:value":t[1]||(t[1]=o=>e.formState.n50=o),"addon-after":"kN/m²"},null,8,["value"])]),_:1})]),_:1}),a(u,{span:12},{default:i(()=>[a(n,{label:"n=100",name:"n100"},{default:i(()=>[a(d,{style:{width:"424px"},controls:!1,placeholder:"请输入n=100",class:"right-input",value:e.formState.n100,"onUpdate:value":t[2]||(t[2]=o=>e.formState.n100=o),"addon-after":"kN/m²"},null,8,["value"])]),_:1})]),_:1}),a(u,{span:12},{default:i(()=>[a(n,{name:"remark",label:"来源"},{default:i(()=>[a(s,{style:{width:"424px"},value:e.formState.remark,"onUpdate:value":t[3]||(t[3]=o=>e.formState.remark=o),valueModifiers:{trim:!0},placeholder:"请输入来源"},null,8,["value"])]),_:1}),I(` <a-row>\r
                            <a-col :span="24">\r
                                <div v-for="(item, index) in formState.remark" :key="index">\r
                                    <a-form-item :name="['remark', index]" :label="index == 0 ? '数据来源' : ''" :rules="[\r
                                        {\r
                                            required: false,\r
                                            trigger: 'blur',\r
                                            index: index,\r
                                            selfMessage: '请输入数据来源的文档名称',\r
                                            validator: validateFileName,\r
                                        },\r
                                    ]">\r
                                        <div class="add-upload-file">\r
                                            <Upload v-model:defaultFiles="item.data" :fileTypes="DATA_SOURCE_FILE_TYPES"\r
                                                :fileSize="50" :maxCount="1" fileTypeMessage="目前支持 JPG、PNG、doc、docx、pdf格式"\r
                                                fileSizeMessage="文件最大50M" @upFileList="(val) => getUploadFile(val, index, 'source')\r
                                                    ">\r
                                                <template #tip>\r
                                                    <div class="tip-content">\r
                                                        <div class="tip-content-add">\r
                                                            <a-form-item :name="['remark', index]">\r
                                                                <a-input placeholder="请输入图片名称" @blur="(e) =>\r
                                                                        saveIndex(\r
                                                                            e,\r
                                                                            index,\r
                                                                            'source',\r
                                                                        )\r
                                                                    " v-model:value="item.fileName"\r
                                                                    style="width: 356px"></a-input>\r
                                                            </a-form-item>\r
                                                            <iconpark-icon class="add-icon" name="shanjian" size="16"\r
                                                                @click="deleteMap(index, 'source')" v-show="formState.remark.length > 1\r
                                                                    "></iconpark-icon>\r
                                                            <iconpark-icon class="add-icon" name="tianjia" size="16"\r
                                                                @click="addMap('source')" v-show="index ==\r
                                                                    formState.remark.length - 1\r
                                                                    "></iconpark-icon>\r
                                                        </div>\r
\r
                                                        <div class="tip-title">说明：支持\r
                                                            JPG、PNG、doc、docx、pdf等，上限1个，上限50M</div>\r
                                                    </div>\r
                                                </template>\r
                                            </Upload>\r
                                        </div>\r
                                    </a-form-item>\r
                                </div>\r
                            </a-col>\r
                        </a-row> `)]),_:1})]),_:1}),a(n,{style:{"text-align":"center"},class:"footer-list"},{default:i(()=>[a(y,{class:"handle-button",onClick:e.resetForm},{default:i(()=>[...t[4]||(t[4]=[U(" 取消 ",-1)])]),_:1}),a(y,{class:"handle-button",type:"primary",onClick:e.saveData},{default:i(()=>[...t[5]||(t[5]=[U("保存",-1)])]),_:1})]),_:1})]),_:1},8,["model"])])])}const ta=te(Ga,[["render",La],["__scopeId","data-v-fc577067"],["__file","D:/fcs/web/web-sx/web-sx/src/views/hucang/commonDataManage/climateDataBase/components/add/AddSnowPressure.vue"]]),Wa={__name:"AddRainFall",props:{selectData:{type:Object}},setup(F,{expose:t}){t();const p=F,e=m({provice:""}),h=z(),k=O(),d=m(!!h.query.id),n=m(null),u=(l,r,M)=>{if(l.required){if(!r.fileName&&!r.data.length)return Promise.reject("请上传文件并且输入数据文件名称");if(!r.fileName)return Promise.reject("请输入数据文件名称");if(!r.data.length)return Promise.reject("请上传文件");if(r.fileName&&r.data.length)return Promise.resolve()}else{if(r.fileName&&r.data.length||!r.fileName&&!r.data.length)return Promise.resolve();if(r.fileName)return r.length?Promise.resolve():Promise.reject("请上传文件");if(r.data.length)return r.fileName?Promise.resolve():Promise.reject(l.selfMessage)}},s=m({dataType:0,rainfall:"",remarks:""}),c=(l,r,M)=>{n.value.validateFields([["remarks",r]])},y={rainfall:[{required:!0,ElMessage:"请输入降水量mm",trigger:"blur"}],remarks:[{required:!1,ElMessage:"请输入来源",trigger:"blur"}]},x=l=>{s.value.remarks.push({data:[],fileName:""})},o=(l,r)=>{s.value.remarks.splice(l,1)},_=(l,r,M)=>{s.value.remarks[r].data=l,n.value.validateFields([["remarks",r]])},b=()=>{n.value.resetFields(),k.go(-1)};L(()=>{d.value&&R()});const S=()=>{n.value.validateFields().then(()=>{E()}).catch(l=>{console.log("err",l)})},E=async()=>{try{let{dataType:l,rainfall:r,remarks:M}=s.value,P={affiliationCode:p.selectData.code[p.selectData.code.length-1],dataType:l,rainfall:r,remarks:M};h.query.id&&(P.id=s.value.id,delete P.affiliationCode);let A=d.value?await ze(P):await Oe(P);A.code==200&&A.data&&(W.success("提交成功"),n.value.resetFields(),k.go(-1))}catch{}},R=async()=>{try{let l=await Ge(h.query.id);if(l.code==200&&l.data){let{dataType:r,rainfall:M,remarks:P}=l.data;s.value={id:l.data.id,dataType:r,rainfall:M,remarks:P},e.value.provice=l.data.areaNameStr}}catch{}},C={props:p,editSelectData:e,route:h,router:k,isAddOrEdit:d,rainFallRef:n,validateFileName:u,formState:s,saveIndex:c,rules:y,addMap:x,deleteMap:o,getUploadFile:_,resetForm:b,saveData:S,submitData:E,getRainFallDetailData:R,ref:m,reactive:K,toRefs:ne,onBeforeMount:Z,onMounted:L,watch:ie,computed:re,get useRoute(){return z},get useRouter(){return O},CommonAddDataHeader:oe,Upload:ue,get addRainFall(){return Oe},get getRainFallDetail(){return Ge},get updateRainFall(){return ze},get ElMessage(){return W}};return Object.defineProperty(C,"__isScriptSetup",{enumerable:!1,value:!0}),C}},Ja={class:"add-power-right"},Va={class:"add-power-right-content"};function Ba(F,t,p,e,h,k){const d=g("a-input-number"),n=g("a-form-item"),u=g("a-col"),s=g("a-input"),c=g("a-row"),y=g("a-button"),x=g("a-form");return j(),G("div",Ja,[a(e.CommonAddDataHeader,{selectData:p.selectData.provice?p.selectData:e.editSelectData},null,8,["selectData"]),D("div",Va,[t[4]||(t[4]=D("h4",{class:"content-title"},[D("img",{src:se,alt:""}),U(" 项目基本信息 ")],-1)),a(x,{ref:"rainFallRef",name:"advanced_search",rules:e.rules,class:"ant-advanced-search-form",layout:"vertical",model:e.formState},{default:i(()=>[a(c,null,{default:i(()=>[a(u,{span:12},{default:i(()=>[a(n,{label:"降水量mm",name:"rainfall"},{default:i(()=>[a(d,{style:{width:"424px"},controls:!1,placeholder:"请输入降水量mm",class:"right-input",value:e.formState.rainfall,"onUpdate:value":t[0]||(t[0]=o=>e.formState.rainfall=o),"addon-after":"mm"},null,8,["value"])]),_:1})]),_:1}),a(u,{span:12},{default:i(()=>[a(n,{name:"remarks",label:"来源"},{default:i(()=>[a(s,{style:{width:"424px"},value:e.formState.remarks,"onUpdate:value":t[1]||(t[1]=o=>e.formState.remarks=o),valueModifiers:{trim:!0},placeholder:"请输入来源"},null,8,["value"])]),_:1}),I(` <a-row>\r
                            <a-col :span="24">\r
                                <div v-for="(item, index) in formState.remarks" :key="index">\r
                                    <a-form-item :name="['remarks', index]" :label="index == 0 ? '数据来源' : ''" :rules="[\r
                                        {\r
                                            required: false,\r
                                            trigger: 'blur',\r
                                            index: index,\r
                                            selfMessage: '请输入数据来源的文档名称',\r
                                            validator: validateFileName,\r
                                        },\r
                                    ]">\r
                                        <div class="add-upload-file">\r
                                            <Upload v-model:defaultFiles="item.data" :fileTypes="DATA_SOURCE_FILE_TYPES"\r
                                                :fileSize="50" :maxCount="1" fileTypeMessage="目前支持 JPG、PNG、doc、docx、pdf格式"\r
                                                fileSizeMessage="文件最大50M" @upFileList="(val) => getUploadFile(val, index, 'source')\r
                                                    ">\r
                                                <template #tip>\r
                                                    <div class="tip-content">\r
                                                        <div class="tip-content-add">\r
                                                            <a-form-item :name="['remarks', index]">\r
                                                                <a-input placeholder="请输入图片名称" @blur="(e) =>\r
                                                                        saveIndex(\r
                                                                            e,\r
                                                                            index,\r
                                                                            'source',\r
                                                                        )\r
                                                                    " v-model:value="item.fileName"\r
                                                                    style="width: 356px"></a-input>\r
                                                            </a-form-item>\r
                                                            <iconpark-icon class="add-icon" name="shanjian" size="16"\r
                                                                @click="deleteMap(index, 'source')" v-show="formState.remarks.length > 1\r
                                                                    "></iconpark-icon>\r
                                                            <iconpark-icon class="add-icon" name="tianjia" size="16"\r
                                                                @click="addMap('source')" v-show="index ==\r
                                                                    formState.remarks.length - 1\r
                                                                    "></iconpark-icon>\r
                                                        </div>\r
\r
                                                        <div class="tip-title">说明：支持\r
                                                            JPG、PNG、doc、docx、pdf等，上限1个，上限50M</div>\r
                                                    </div>\r
                                                </template>\r
                                            </Upload>\r
                                        </div>\r
                                    </a-form-item>\r
                                </div>\r
                            </a-col>\r
                        </a-row> `)]),_:1})]),_:1}),a(n,{style:{"text-align":"center"},class:"footer-list"},{default:i(()=>[a(y,{class:"handle-button",onClick:e.resetForm},{default:i(()=>[...t[2]||(t[2]=[U(" 取消 ",-1)])]),_:1}),a(y,{class:"handle-button",type:"primary",onClick:e.saveData},{default:i(()=>[...t[3]||(t[3]=[U("保存",-1)])]),_:1})]),_:1})]),_:1},8,["model"])])])}const ra=te(Wa,[["render",Ba],["__scopeId","data-v-1ee869d2"],["__file","D:/fcs/web/web-sx/web-sx/src/views/hucang/commonDataManage/climateDataBase/components/add/AddRainFall.vue"]]),Ya={__name:"AddDustDay",props:{selectData:{type:Object}},setup(F,{expose:t}){t();const p=F,e=m({provice:""}),h=z(),k=O(),d=m(!!h.query.id),n=m(null),u=(l,r,M)=>{if(l.required){if(!r.fileName&&!r.data.length)return Promise.reject("请上传文件并且输入数据文件名称");if(!r.fileName)return Promise.reject("请输入数据文件名称");if(!r.data.length)return Promise.reject("请上传文件");if(r.fileName&&r.data.length)return Promise.resolve()}else{if(r.fileName&&r.data.length||!r.fileName&&!r.data.length)return Promise.resolve();if(r.fileName)return r.length?Promise.resolve():Promise.reject("请上传文件");if(r.data.length)return r.fileName?Promise.resolve():Promise.reject(l.selfMessage)}},s=m({dataType:0,day:"",remarks:""}),c=(l,r,M)=>{n.value.validateFields([["remarks",r]])},y={day:[{required:!0,ElMessage:"请输入沙尘暴日",trigger:"blur"}],remarks:[{required:!1,ElMessage:"请输入来源",trigger:"blur"}]},x=l=>{s.value.remarks.push({data:[],fileName:""})},o=(l,r)=>{s.value.remarks.splice(l,1)},_=(l,r,M)=>{s.value.remarks[r].data=l,n.value.validateFields([["remarks",r]])},b=()=>{n.value.resetFields(),k.go(-1)};L(()=>{d.value&&R()});const S=()=>{n.value.validateFields().then(()=>{E()}).catch(l=>{console.log("err",l)})},E=async()=>{try{let{dataType:l,day:r,remarks:M}=s.value,P={affiliationCode:p.selectData.code[p.selectData.code.length-1],dataType:l,day:r,remarks:M};h.query.id&&(P.id=s.value.id,delete P.affiliationCode);let A=d.value?await We(P):await Je(P);A.code==200&&A.data&&(W.success("提交成功"),n.value.resetFields(),k.go(-1))}catch{}},R=async()=>{try{let l=await Le(h.query.id);if(l.code==200&&l.data){let{dataType:r,day:M,remarks:P}=l.data;s.value={id:l.data.id,dataType:r,day:M,remarks:P},e.value.provice=l.data.areaNameStr}}catch{}},C={props:p,editSelectData:e,route:h,router:k,isAddOrEdit:d,dustDayRef:n,validateFileName:u,formState:s,saveIndex:c,rules:y,addMap:x,deleteMap:o,getUploadFile:_,resetForm:b,saveData:S,submitData:E,getWindPressureDetailData:R,ref:m,reactive:K,toRefs:ne,onBeforeMount:Z,onMounted:L,watch:ie,computed:re,get useRoute(){return z},get useRouter(){return O},CommonAddDataHeader:oe,Upload:ue,get addDustStorm(){return Je},get getDustDetail(){return Le},get updateDustStorm(){return We},get ElMessage(){return W}};return Object.defineProperty(C,"__isScriptSetup",{enumerable:!1,value:!0}),C}},Ha={class:"add-power-right"},Qa={class:"add-power-right-content"};function Za(F,t,p,e,h,k){const d=g("a-input-number"),n=g("a-form-item"),u=g("a-col"),s=g("a-input"),c=g("a-row"),y=g("a-button"),x=g("a-form");return j(),G("div",Ha,[a(e.CommonAddDataHeader,{selectData:p.selectData.provice?p.selectData:e.editSelectData},null,8,["selectData"]),D("div",Qa,[t[4]||(t[4]=D("h4",{class:"content-title"},[D("img",{src:se,alt:""}),U(" 项目基本信息 ")],-1)),a(x,{ref:"dustDayRef",name:"advanced_search",rules:e.rules,class:"ant-advanced-search-form",layout:"vertical",model:e.formState},{default:i(()=>[a(c,null,{default:i(()=>[a(u,{span:12},{default:i(()=>[a(n,{label:"沙尘暴日",name:"day"},{default:i(()=>[a(d,{style:{width:"424px"},controls:!1,placeholder:"请输入沙尘暴日",class:"right-input",value:e.formState.day,"onUpdate:value":t[0]||(t[0]=o=>e.formState.day=o),"addon-after":"日"},null,8,["value"])]),_:1})]),_:1}),a(u,{span:12},{default:i(()=>[a(n,{name:"remarks",label:"来源"},{default:i(()=>[a(s,{style:{width:"424px"},value:e.formState.remarks,"onUpdate:value":t[1]||(t[1]=o=>e.formState.remarks=o),valueModifiers:{trim:!0},placeholder:"请输入来源"},null,8,["value"])]),_:1}),I(` <a-row>\r
                            <a-col :span="24">\r
                                <div v-for="(item, index) in formState.remarks" :key="index">\r
                                    <a-form-item :name="['remarks', index]" :label="index == 0 ? '数据来源' : ''" :rules="[\r
                                        {\r
                                            required: false,\r
                                            trigger: 'blur',\r
                                            index: index,\r
                                            selfMessage: '请输入数据来源的文档名称',\r
                                            validator: validateFileName,\r
                                        },\r
                                    ]">\r
                                        <div class="add-upload-file">\r
                                            <Upload v-model:defaultFiles="item.data" :fileTypes="DATA_SOURCE_FILE_TYPES"\r
                                                :fileSize="50" :maxCount="1" fileTypeMessage="目前支持 JPG、PNG、doc、docx、pdf格式"\r
                                                fileSizeMessage="文件最大50M" @upFileList="(val) => getUploadFile(val, index, 'source')\r
                                                    ">\r
                                                <template #tip>\r
                                                    <div class="tip-content">\r
                                                        <div class="tip-content-add">\r
                                                            <a-form-item :name="['remarks', index]">\r
                                                                <a-input placeholder="请输入图片名称" @blur="(e) =>\r
                                                                        saveIndex(\r
                                                                            e,\r
                                                                            index,\r
                                                                            'source',\r
                                                                        )\r
                                                                    " v-model:value="item.fileName"\r
                                                                    style="width: 356px"></a-input>\r
                                                            </a-form-item>\r
                                                            <iconpark-icon class="add-icon" name="shanjian" size="16"\r
                                                                @click="deleteMap(index, 'source')" v-show="formState.remarks.length > 1\r
                                                                    "></iconpark-icon>\r
                                                            <iconpark-icon class="add-icon" name="tianjia" size="16"\r
                                                                @click="addMap('source')" v-show="index ==\r
                                                                    formState.remarks.length - 1\r
                                                                    "></iconpark-icon>\r
                                                        </div>\r
\r
                                                        <div class="tip-title">说明：支持\r
                                                            JPG、PNG、doc、docx、pdf等，上限1个，上限50M</div>\r
                                                    </div>\r
                                                </template>\r
                                            </Upload>\r
                                        </div>\r
                                    </a-form-item>\r
                                </div>\r
                            </a-col>\r
                        </a-row> `)]),_:1})]),_:1}),a(n,{style:{"text-align":"center"},class:"footer-list"},{default:i(()=>[a(y,{class:"handle-button",onClick:e.resetForm},{default:i(()=>[...t[2]||(t[2]=[U(" 取消 ",-1)])]),_:1}),a(y,{class:"handle-button",type:"primary",onClick:e.saveData},{default:i(()=>[...t[3]||(t[3]=[U("保存",-1)])]),_:1})]),_:1})]),_:1},8,["model"])])])}const na=te(Ya,[["render",Za],["__scopeId","data-v-aa3d25ae"],["__file","D:/fcs/web/web-sx/web-sx/src/views/hucang/commonDataManage/climateDataBase/components/add/AddDustDay.vue"]]),Ka={__name:"AddWindSpeed",props:{selectData:{type:Object}},setup(F,{expose:t}){t();const p=F,e=m({provice:""}),h=z(),k=O(),d=m(!!h.query.id),n=m(null),u=(l,r,M)=>{if(l.required){if(!r.fileName&&!r.data.length)return Promise.reject("请上传文件并且输入数据文件名称");if(!r.fileName)return Promise.reject("请输入数据文件名称");if(!r.data.length)return Promise.reject("请上传文件");if(r.fileName&&r.data.length)return Promise.resolve()}else{if(r.fileName&&r.data.length||!r.fileName&&!r.data.length)return Promise.resolve();if(r.fileName)return r.length?Promise.resolve():Promise.reject("请上传文件");if(r.data.length)return r.fileName?Promise.resolve():Promise.reject(l.selfMessage)}},s=m({dataType:0,avgWindSpeed:"",maxWindSpeed:"",remarks:""}),c=(l,r,M)=>{n.value.validateFields([["remarks",r]])},y={avgWindSpeed:[{required:!0,ElMessage:"请输入平均风速",trigger:"blur"}],maxWindSpeed:[{required:!0,ElMessage:"请输入最大风速",trigger:"blur"}],remarks:[{required:!1,ElMessage:"请输入来源",trigger:"blur"}]},x=l=>{s.value.remarks.push({data:[],fileName:""})},o=(l,r)=>{s.value.remarks.splice(l,1)},_=(l,r,M)=>{s.value.remarks[r].data=l,n.value.validateFields([["remarks",r]])},b=()=>{n.value.resetFields(),k.go(-1)};L(()=>{d.value&&R()});const S=()=>{n.value.validateFields().then(()=>{E()}).catch(l=>{console.log("err",l)})},E=async()=>{try{let{dataType:l,avgWindSpeed:r,maxWindSpeed:M,remarks:P}=s.value,A={affiliationCode:p.selectData.code[p.selectData.code.length-1],dataType:l,avgWindSpeed:r,maxWindSpeed:M,remarks:P};h.query.id&&(A.id=s.value.id,delete A.affiliationCode);let q=d.value?await Be(A):await Ye(A);q.code==200&&q.data&&(W.success("提交成功"),n.value.resetFields(),k.go(-1))}catch{}},R=async()=>{try{let l=await Ve(h.query.id);if(l.code==200&&l.data){let{dataType:r,avgWindSpeed:M,maxWindSpeed:P,remarks:A}=l.data;s.value={id:l.data.id,dataType:r,avgWindSpeed:M,maxWindSpeed:P,remarks:A},e.value.provice=l.data.areaNameStr}}catch{}},C={props:p,editSelectData:e,route:h,router:k,isAddOrEdit:d,rainFallRef:n,validateFileName:u,formState:s,saveIndex:c,rules:y,addMap:x,deleteMap:o,getUploadFile:_,resetForm:b,saveData:S,submitData:E,getWindPressureDetailData:R,ref:m,reactive:K,toRefs:ne,onBeforeMount:Z,onMounted:L,watch:ie,computed:re,get useRoute(){return z},get useRouter(){return O},CommonAddDataHeader:oe,Upload:ue,get addWindSpeed(){return Ye},get getWindSpeedDetail(){return Ve},get updateWindSpeed(){return Be},get ElMessage(){return W}};return Object.defineProperty(C,"__isScriptSetup",{enumerable:!1,value:!0}),C}},Xa={class:"add-power-right"},$a={class:"add-power-right-content"};function et(F,t,p,e,h,k){const d=g("a-input-number"),n=g("a-form-item"),u=g("a-col"),s=g("a-input"),c=g("a-row"),y=g("a-button"),x=g("a-form");return j(),G("div",Xa,[a(e.CommonAddDataHeader,{selectData:p.selectData.provice?p.selectData:e.editSelectData},null,8,["selectData"]),D("div",$a,[t[5]||(t[5]=D("h4",{class:"content-title"},[D("img",{src:se,alt:""}),U(" 项目基本信息 ")],-1)),a(x,{ref:"rainFallRef",name:"advanced_search",rules:e.rules,class:"ant-advanced-search-form",layout:"vertical",model:e.formState},{default:i(()=>[a(c,null,{default:i(()=>[a(u,{span:12},{default:i(()=>[a(n,{label:"平均风速m/s",name:"avgWindSpeed"},{default:i(()=>[a(d,{style:{width:"424px"},controls:!1,placeholder:"请输入平均风速",class:"right-input",value:e.formState.avgWindSpeed,"onUpdate:value":t[0]||(t[0]=o=>e.formState.avgWindSpeed=o),"addon-after":"m/s"},null,8,["value"])]),_:1})]),_:1}),a(u,{span:12},{default:i(()=>[a(n,{label:"最大风速m/s",name:"maxWindSpeed"},{default:i(()=>[a(d,{style:{width:"424px"},controls:!1,placeholder:"请输入最大风速",class:"right-input",value:e.formState.maxWindSpeed,"onUpdate:value":t[1]||(t[1]=o=>e.formState.maxWindSpeed=o),"addon-after":"m/s"},null,8,["value"])]),_:1})]),_:1}),a(u,{span:12},{default:i(()=>[a(n,{name:"remarks",label:"来源"},{default:i(()=>[a(s,{style:{width:"424px"},value:e.formState.remarks,"onUpdate:value":t[2]||(t[2]=o=>e.formState.remarks=o),valueModifiers:{trim:!0},placeholder:"请输入来源"},null,8,["value"])]),_:1}),I(` <a-row>\r
                            <a-col :span="24">\r
                                <div v-for="(item, index) in formState.remarks" :key="index">\r
                                    <a-form-item :name="['remarks', index]" :label="index == 0 ? '数据来源' : ''" :rules="[\r
                                        {\r
                                            required: false,\r
                                            trigger: 'blur',\r
                                            index: index,\r
                                            selfMessage: '请输入数据来源的文档名称',\r
                                            validator: validateFileName,\r
                                        },\r
                                    ]">\r
                                        <div class="add-upload-file">\r
                                            <Upload v-model:defaultFiles="item.data" :fileTypes="DATA_SOURCE_FILE_TYPES"\r
                                                :fileSize="50" :maxCount="1" fileTypeMessage="目前支持 JPG、PNG、doc、docx、pdf格式"\r
                                                fileSizeMessage="文件最大50M" @upFileList="(val) => getUploadFile(val, index, 'source')\r
                                                    ">\r
                                                <template #tip>\r
                                                    <div class="tip-content">\r
                                                        <div class="tip-content-add">\r
                                                            <a-form-item :name="['remarks', index]">\r
                                                                <a-input placeholder="请输入图片名称" @blur="(e) =>\r
                                                                        saveIndex(\r
                                                                            e,\r
                                                                            index,\r
                                                                            'source',\r
                                                                        )\r
                                                                    " v-model:value="item.fileName"\r
                                                                    style="width: 356px"></a-input>\r
                                                            </a-form-item>\r
                                                            <iconpark-icon class="add-icon" name="shanjian" size="16"\r
                                                                @click="deleteMap(index, 'source')" v-show="formState.remarks.length > 1\r
                                                                    "></iconpark-icon>\r
                                                            <iconpark-icon class="add-icon" name="tianjia" size="16"\r
                                                                @click="addMap('source')" v-show="index ==\r
                                                                    formState.remarks.length - 1\r
                                                                    "></iconpark-icon>\r
                                                        </div>\r
\r
                                                        <div class="tip-title">说明：支持\r
                                                            JPG、PNG、doc、docx、pdf等，上限1个，上限50M</div>\r
                                                    </div>\r
                                                </template>\r
                                            </Upload>\r
                                        </div>\r
                                    </a-form-item>\r
                                </div>\r
                            </a-col>\r
                        </a-row> `)]),_:1})]),_:1}),a(n,{style:{"text-align":"center"},class:"footer-list"},{default:i(()=>[a(y,{class:"handle-button",onClick:e.resetForm},{default:i(()=>[...t[3]||(t[3]=[U(" 取消 ",-1)])]),_:1}),a(y,{class:"handle-button",type:"primary",onClick:e.saveData},{default:i(()=>[...t[4]||(t[4]=[U("保存",-1)])]),_:1})]),_:1})]),_:1},8,["model"])])])}const la=te(Ka,[["render",et],["__scopeId","data-v-45280d09"],["__file","D:/fcs/web/web-sx/web-sx/src/views/hucang/commonDataManage/climateDataBase/components/add/AddWindSpeed.vue"]]),at={__name:"AddHailDay",props:{selectData:{type:Object}},setup(F,{expose:t}){t();const p=F,e=m({provice:""}),h=z(),k=O(),d=m(!!h.query.id),n=m(null),u=(l,r,M)=>{if(l.required){if(!r.fileName&&!r.data.length)return Promise.reject("请上传文件并且输入数据文件名称");if(!r.fileName)return Promise.reject("请输入数据文件名称");if(!r.data.length)return Promise.reject("请上传文件");if(r.fileName&&r.data.length)return Promise.resolve()}else{if(r.fileName&&r.data.length||!r.fileName&&!r.data.length)return Promise.resolve();if(r.fileName)return r.length?Promise.resolve():Promise.reject("请上传文件");if(r.data.length)return r.fileName?Promise.resolve():Promise.reject(l.selfMessage)}},s=m({dataType:0,day:"",remarks:""}),c=(l,r,M)=>{n.value.validateFields([["remarks",r]])},y={day:[{required:!0,ElMessage:"请输入冰雹日数",trigger:"blur"}],remarks:[{required:!1,ElMessage:"请输入来源",trigger:"blur"}]},x=l=>{s.value.remarks.push({data:[],fileName:""})},o=(l,r)=>{s.value.remarks.splice(l,1)},_=(l,r,M)=>{s.value.remarks[r].data=l,n.value.validateFields([["remarks",r]])},b=()=>{n.value.resetFields(),k.go(-1)};L(()=>{d.value&&R()});const S=()=>{n.value.validateFields().then(()=>{E()}).catch(l=>{console.log("err",l)})},E=async()=>{try{let{dataType:l,day:r,remarks:M}=s.value,P={affiliationCode:p.selectData.code[p.selectData.code.length-1],dataType:l,day:r,remarks:M};h.query.id&&(P.id=s.value.id,delete P.affiliationCode);let A=d.value?await Qe(P):await Ze(P);A.code==200&&A.data&&(W.success("提交成功"),n.value.resetFields(),k.go(-1))}catch{}},R=async()=>{try{let l=await He(h.query.id);if(l.code==200&&l.data){let{dataType:r,day:M,remarks:P}=l.data;s.value={id:l.data.id,dataType:r,day:M,remarks:P},e.value.provice=l.data.areaNameStr}}catch{}},C={props:p,editSelectData:e,route:h,router:k,isAddOrEdit:d,fogRef:n,validateFileName:u,formState:s,saveIndex:c,rules:y,addMap:x,deleteMap:o,getUploadFile:_,resetForm:b,saveData:S,submitData:E,getWindPressureDetailData:R,ref:m,reactive:K,toRefs:ne,onBeforeMount:Z,onMounted:L,watch:ie,computed:re,get useRoute(){return z},get useRouter(){return O},CommonAddDataHeader:oe,Upload:ue,get addHail(){return Ze},get getHailDetail(){return He},get updateHail(){return Qe},get ElMessage(){return W}};return Object.defineProperty(C,"__isScriptSetup",{enumerable:!1,value:!0}),C}},tt={class:"add-power-right"},rt={class:"add-power-right-content"};function nt(F,t,p,e,h,k){const d=g("a-input-number"),n=g("a-form-item"),u=g("a-col"),s=g("a-input"),c=g("a-row"),y=g("a-button"),x=g("a-form");return j(),G("div",tt,[a(e.CommonAddDataHeader,{selectData:p.selectData.provice?p.selectData:e.editSelectData},null,8,["selectData"]),D("div",rt,[t[4]||(t[4]=D("h4",{class:"content-title"},[D("img",{src:se,alt:""}),U(" 项目基本信息 ")],-1)),a(x,{ref:"fogRef",name:"advanced_search",rules:e.rules,class:"ant-advanced-search-form",layout:"vertical",model:e.formState},{default:i(()=>[a(c,null,{default:i(()=>[a(u,{span:12},{default:i(()=>[a(n,{label:"冰雹日",name:"day"},{default:i(()=>[a(d,{style:{width:"424px"},controls:!1,placeholder:"请输入冰雹日",class:"right-input",value:e.formState.day,"onUpdate:value":t[0]||(t[0]=o=>e.formState.day=o)},null,8,["value"])]),_:1})]),_:1}),a(u,{span:12},{default:i(()=>[a(n,{name:"remarks",label:"来源"},{default:i(()=>[a(s,{style:{width:"424px"},value:e.formState.remarks,"onUpdate:value":t[1]||(t[1]=o=>e.formState.remarks=o),valueModifiers:{trim:!0},placeholder:"请输入来源"},null,8,["value"])]),_:1}),I(` <a-row>\r
                            <a-col :span="24">\r
                                <div v-for="(item, index) in formState.remarks" :key="index">\r
                                    <a-form-item :name="['remarks', index]" :label="index == 0 ? '数据来源' : ''" :rules="[\r
                                        {\r
                                            required: false,\r
                                            trigger: 'blur',\r
                                            index: index,\r
                                            selfMessage: '请输入数据来源的文档名称',\r
                                            validator: validateFileName,\r
                                        },\r
                                    ]">\r
                                        <div class="add-upload-file">\r
                                            <Upload v-model:defaultFiles="item.data" :fileTypes="DATA_SOURCE_FILE_TYPES"\r
                                                :fileSize="50" :maxCount="1" fileTypeMessage="目前支持 JPG、PNG、doc、docx、pdf格式"\r
                                                fileSizeMessage="文件最大50M" @upFileList="(val) => getUploadFile(val, index, 'source')\r
                                                    ">\r
                                                <template #tip>\r
                                                    <div class="tip-content">\r
                                                        <div class="tip-content-add">\r
                                                            <a-form-item :name="['remarks', index]">\r
                                                                <a-input placeholder="请输入图片名称" @blur="(e) =>\r
                                                                        saveIndex(\r
                                                                            e,\r
                                                                            index,\r
                                                                            'source',\r
                                                                        )\r
                                                                    " v-model:value="item.fileName"\r
                                                                    style="width: 356px"></a-input>\r
                                                            </a-form-item>\r
                                                            <iconpark-icon class="add-icon" name="shanjian" size="16"\r
                                                                @click="deleteMap(index, 'source')" v-show="formState.remarks.length > 1\r
                                                                    "></iconpark-icon>\r
                                                            <iconpark-icon class="add-icon" name="tianjia" size="16"\r
                                                                @click="addMap('source')" v-show="index ==\r
                                                                    formState.remarks.length - 1\r
                                                                    "></iconpark-icon>\r
                                                        </div>\r
\r
                                                        <div class="tip-title">说明：支持\r
                                                            JPG、PNG、doc、docx、pdf等，上限1个，上限50M</div>\r
                                                    </div>\r
                                                </template>\r
                                            </Upload>\r
                                        </div>\r
                                    </a-form-item>\r
                                </div>\r
                            </a-col>\r
                        </a-row> `)]),_:1})]),_:1}),a(n,{style:{"text-align":"center"},class:"footer-list"},{default:i(()=>[a(y,{class:"handle-button",onClick:e.resetForm},{default:i(()=>[...t[2]||(t[2]=[U(" 取消 ",-1)])]),_:1}),a(y,{class:"handle-button",type:"primary",onClick:e.saveData},{default:i(()=>[...t[3]||(t[3]=[U("保存",-1)])]),_:1})]),_:1})]),_:1},8,["model"])])])}const ia=te(at,[["render",nt],["__scopeId","data-v-e6cf143d"],["__file","D:/fcs/web/web-sx/web-sx/src/views/hucang/commonDataManage/climateDataBase/components/add/AddHailDay.vue"]]),lt={__name:"addClimate",setup(F,{expose:t}){t();const p=z(),e=O(),h=m(1),k=K({1:ee(Xe),2:ee($e),3:ee(ea),4:ee(aa),5:ee(ta),6:ee(ra),7:ee(na),8:ee(la),9:ee(ia)}),d=Number(p.query.type)+2;Z(()=>{h.value=p.query.type});const n=m({provice:"",code:[],num:12,noNum:0}),u=c=>{const y=c.data;let x="";n.value.code=[];for(let o=0;o<=c.type;o++)x+=(o==0||!y[o].areaName?"":"/")+(y[o].areaName?y[o].areaName:""),n.value.code.push(y[o].areaCode);n.value.provice=x};L(()=>{});const s={route:p,router:e,addType:h,addComponents:k,interfaceType:d,selectData:n,getSelectAddress:u,ref:m,reactive:K,toRefs:ne,onBeforeMount:Z,onMounted:L,shallowRef:ee,watchEffect:ua,computed:re,get useRoute(){return z},get useRouter(){return O},linkage:he,AddThunder:Xe,AddAcidRain:$e,AddTemperature:ea,AddWindPressure:aa,AddSnowPressure:ta,AddRainFall:ra,AddDustDay:na,AddWindSpeed:la,AddHailDay:ia};return Object.defineProperty(s,"__isScriptSetup",{enumerable:!1,value:!0}),s}},it={class:"add-current-power"};function ot(F,t,p,e,h,k){return j(),G("div",it,[e.route.query.id?I("v-if",!0):(j(),Se(e.linkage,{key:0,interfaceType:e.interfaceType,onSelectAddress:e.getSelectAddress,class:"linkage",ref:"currentPowerLink"},null,512)),(j(),Se(da(e.addComponents[e.addType]),{class:"component-content",selectData:e.selectData},null,8,["selectData"]))])}const _t=te(lt,[["render",ot],["__scopeId","data-v-d4d28c74"],["__file","D:/fcs/web/web-sx/web-sx/src/views/hucang/commonDataManage/climateDataBase/addClimate.vue"]]);export{_t as default};
//# sourceMappingURL=addClimate-Dw4fDje6.js.map
