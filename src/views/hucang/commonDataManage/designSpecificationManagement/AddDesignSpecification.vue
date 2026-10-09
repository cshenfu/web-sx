<template>
  <div class="add-cad">
    <div class="add-power-right-content">
      <h4 class="content-title">
        <img src="@/assets/img/user/detail-title.png" alt="" />
        项目基本信息
      </h4>
      <a-form
          ref="addCadDrawingFormRef"
          name="addCadDrawingForm"
          :rules="rules"
          class="ant-advanced-search-form"
          layout="vertical"
          :model="formState"
      >
       <a-row>
          <a-col :span="12">
            <a-form-item name="value1" label="文档名称" >
              <a-input v-model:value="formState.value1"  style="width: 356px" placeholder="请输入文档名称"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="value2" label="文档版本" >
              <a-input v-model:value="formState.value2"  style="width: 356px" placeholder="请输入文档版本号，建议输入年份，如2018"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="3" label="标签" >
              <a-input  v-model:value="formState.value3"  style="width: 356px" placeholder="请输入标签"/>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="value4" label="使用项目" >
              <select-search
               style="width: 356px"
                :allowClear="false"
                placeholder="请选择使用项目"
                v-model:selectValue="formState.value4"
                :options="labelTypeOptions"
            ></select-search>
            </a-form-item>
          </a-col>
  
        </a-row>
        <a-row>
          <a-col :span="12">
            <div  v-for="(item, index) in formState.thunderMap" :key="index">
              <a-form-item :name="['thunderMap', index,'data']" :label="index == 0 ? '附件上传' : ''" 
                :rules="[
                    {
                        required: true,
                        trigger: 'change',
                        ElMessage: '请上传源文件',
                    },
                ]">
                <Upload v-model:defaultFiles="item.data" :fileTypes="fileTypes"
                        :fileSize="upFileSize" :maxCount="1" :fileTypeMessage="fileTypeMessage"
                        :fileSizeMessage="`文件最大100M`"
                        @upFileList="(val) => getUploadFile(val, index, 'thunder')">
                        <template #tip>
                          <div class="tip-title">说明：支持 JPG、PNG、doc、docx、pdf等，上限1个，上限50M</div>
                    </template>
                  </Upload>
              </a-form-item>
            </div>
          </a-col>
          <a-col :span="24">
            <a-form-item
              label="更新说明"
              name="des"
            >
              <a-textarea
                  style="width: 750px"
                  v-model:value="formState.des"
                  placeholder="请输入更新说明"
                  :rows="4"
              />
          </a-form-item>
          </a-col>
        </a-row>
        <a-form-item style="text-align: center" class="footer-list">
            <a-button class="handle-button" @click="resetForm"> 取消 </a-button>
            <a-button class="handle-button" type="primary" @click="saveData">保存</a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SelectSearch from '@/components/selectSearch/SelectSearch.vue';
import Upload from '@/components/upload/Upload.vue';
const route = useRoute();
const addCadDrawingFormRef = ref(null)
const labelTypeOptions = [
  {
    label:"使用项目",
    value:'1'
  }
]
const validateFileValue6 = (rule, value, callback) => {
    if(formState.value.value5 == 2){
      if(!value) {
        return Promise.reject('请输入套图总数量');
      }else {
        return Promise.resolve()
      }
    }else {
      return Promise.resolve()
    }
}
const rules = {
  value1: [{ required: true, ElMessage: '请输入文档名称', trigger: 'blur' }],
  value2: [{ required: true, ElMessage: '请输入文档版本号，建议输入年份，如2018', trigger: 'blur' }],
  value3: [{ required: false, ElMessage: '请选择标签', trigger: 'blur' }],
  value4: [{ required: true, ElMessage: '请选择使用项目', trigger: 'change' }],
  value5: [{ required: true, ElMessage: '请选择图类型', trigger: 'change'}],
  value6: [{ required: true, ElMessage: '请输入套图总数量', trigger: 'blur', validator: validateFileValue6, }],
  value7: [{ required: false, ElMessage: '请输入更新说明', trigger: 'blur' }],
};
const formState = ref({
  value1:'',
  value2:'',
  value3:'资源',
  value4: null,
  value5: 1,
  value6: 1,
  thunderMap:[ 
    {
      data: [],
      data2: [],
    }
  ],
  des: '',
})
const fileTypes = 'jpg,jpeg,png';
const fileTypeMessage = ref('目前支持 JPG、PNG 格式');
const upFileSize = 100
// 获取文件
const getUploadFile = (val, index, type) => {
    if (type == 'thunder') {
        formState.value.thunderMap[index]['data'] = [val];
        addCadDrawingFormRef.value.validateFields([['thunderMap', index,'data']]);
    }else {
      formState.value.thunderMap[index]['data2'] = [val];
        addCadDrawingFormRef.value.validateFields([['thunderMap', index,'data2']]);
    }
};
const resetForm = () => {
  addCadDrawingFormRef.value.resetFields();
        router.go(-1);

    };
const saveData = () => {
  addCadDrawingFormRef.value
      .validateFields()
      .then(() => {
          // console.log('保存数据', formState.value);
      })
      .catch((err) => {
          console.log('err', err);
      });
  };
/**
* 路由实例
*/
const router = useRouter();
const data = reactive({})
onBeforeMount(() => {
  //console.log('2.组件挂载页面之前执行----onBeforeMount')
})
onMounted(() => {
  //console.log('3.-组件挂载到页面之后执行-------onMounted')
})
watchEffect(() => {
})

</script>
<style scoped lang='scss'>
.add-cad {
  background-color: #fff;
  padding: 24px 0 24px 24px;
  // display: flex;

  .add-power-right-content {
    .content-title {
      color: #3d435d;
      display: flex;
      align-items: center;
      margin: 24px 0 20px 0;

      img {
        height: 14px;
        margin-right: 8px;
      }

      button {
        margin-left: auto;
        display: flex;
        align-items: center;

        iconpark-icon {
          margin-right: 5px;
        }
      }
    }
    .footer-list{
        margin-top: 200px;
    }
    .handle-button {
      margin: 0 16px;
      width: 80px;
    }
  }
  .tip-title {
    font-size: 12px;
    color: #A8ADBE;
  }
}
</style>