<template>
    <div class="add-wind-device">
      <h4 class="content-title">
        <img src="@/assets/img/user/detail-title.png" alt="" />
        基本信息
      </h4>
  
      <el-form
        ref="windDeviceForm"
        :model="formState"
        class="wind-device-form"
        label-width="100px"
        autocomplete="off"
      >
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item
              label="风机名称"
              prop="deviceModel"
              :rules="requiredRule('请输入风机名称')"
            >
              <el-input
                v-model="formState.deviceModel"
                placeholder="请输入风机名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="制造商"
              prop="manufacturer"
              :rules="requiredRule('请输入制造商')"
            >
              <el-input
                v-model="formState.manufacturer"
                placeholder="请输入制造商"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="额定功率"
              prop="ratedPower"
              :rules="requiredRule('请输入额定功率')"
            >
              <div class="number-with-unit">
                <el-input-number
                  v-model="formState.ratedPower"
                  :controls="false"
                  :precision="0"
                  placeholder="请输入"
                />
                <span>kW</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
  
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item
              label="IEC等级"
              prop="authLevel"
              :rules="requiredRule('请选择IEC等级')"
            >
              <el-select
                v-model="formState.authLevel"
                placeholder="请选择"
                clearable
              >
                <el-option
                  v-for="option in ICEOPTIONS"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="叶轮直径"
              prop="wheelDiameter"
              :rules="requiredRule('请输入叶轮直径')"
            >
              <div class="number-with-unit">
                <el-input-number
                  v-model="formState.wheelDiameter"
                  :controls="false"
                  placeholder="请输入"
                />
                <span>m</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="风机类型"
              prop="deviceType"
              :rules="requiredRule('请选择风机类型')"
            >
              <el-select v-model="formState.deviceType" placeholder="请选择" clearable>
                <el-option
                  v-for="option in GENERATOR_TYPE"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="功率调节"
              prop="powerType"
              :rules="requiredRule('请选择功率调节')"
            >
              <el-select v-model="formState.powerType" placeholder="请选择" clearable>
                <el-option
                  v-for="option in POWER_REGULATION"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="额定电压"
              prop="ratedVoltage"
              :rules="requiredRule('请输入额定电压')"
            >
              <div class="number-with-unit">
                <el-input-number
                  v-model="formState.ratedVoltage"
                  :controls="false"
                  :min="100"
                  :max="10000"
                  placeholder="请输入"
                />
                <span>V</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="额定频率"
              prop="ratedFrequency"
              :rules="requiredRule('请输入额定频率')"
            >
              <div class="number-with-unit">
                <el-input-number
                  v-model="formState.ratedFrequency"
                  :controls="false"
                  placeholder="请输入"
                />
                <span>Hz</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
  
        <el-row v-show="showMoreKey" :gutter="24">
          <el-col :span="8">
            <el-form-item label="安全风速" prop="safeWindSpeed">
              <div class="number-with-unit">
                <el-input-number
                  v-model="formState.safeWindSpeed"
                  :controls="false"
                  placeholder="请输入安全风速"
                />
                <span>m/s</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="生存环境温度" class="temperature-item">
              <div
                class="range-number-cont"
                :class="
                  survivalTempState.isError
                    ? 'error'
                    : survivalTempState.isActive
                      ? 'active'
                      : 'unActive'
                "
              >
                <div class="range-number-input">
                  <el-input-number
                    v-model="formState.minLiveEnvTemperature"
                    :controls="false"
                    :min="0"
                    placeholder="最小值"
                    @mouseover="mouseover('survival')"
                    @mouseout="mouseout('survival')"
                    @focus="focus('survival')"
                    @blur="blur('survival')"
                  />
                </div>
                <span class="custom-icon">~</span>
                <div class="range-number-input range-number-input-last">
                  <el-input-number
                    v-model="formState.maxLiveEnvTemperature"
                    :controls="false"
                    placeholder="最大值"
                    @mouseover="mouseover('survival')"
                    @mouseout="mouseout('survival')"
                    @focus="focus('survival')"
                    @blur="blur('survival')"
                  />
                  <span class="custom-unit">°C</span>
                </div>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="运行环境温度" class="temperature-item">
              <div
                class="range-number-cont"
                :class="
                  operatingTempState.isError
                    ? 'error'
                    : operatingTempState.isActive
                      ? 'active'
                      : 'unActive'
                "
              >
                <div class="range-number-input">
                  <el-input-number
                    v-model="formState.minOperateTemperature"
                    :controls="false"
                    :min="0"
                    placeholder="最小值"
                    @mouseover="mouseover('operating')"
                    @mouseout="mouseout('operating')"
                    @focus="focus('operating')"
                    @blur="blur('operating')"
                  />
                </div>
                <span class="custom-icon">~</span>
                <div class="range-number-input range-number-input-last">
                  <el-input-number
                    v-model="formState.maxOperateTemperature"
                    :controls="false"
                    placeholder="最大值"
                    @mouseover="mouseover('operating')"
                    @mouseout="mouseout('operating')"
                    @focus="focus('operating')"
                    @blur="blur('operating')"
                  />
                  <span class="custom-unit">°C</span>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
  
        <el-row :gutter="24">
          <el-col :span="8">
            <el-form-item label="发电机额定功率" prop="ratedPowerOfGenerator">
              <div class="number-with-unit">
                <el-input-number
                  v-model="formState.ratedPowerOfGenerator"
                  :controls="false"
                  placeholder="请输入"
                />
                <span>kW</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item
              label="空气密度"
              prop="airDensity"
              :rules="[{ validator: validateAirDensity, trigger: 'blur' }]"
            >
              <div class="number-with-unit">
                <el-input-number
                  v-model="formState.airDensity"
                  :controls="false"
                  :min="0.5"
                  :max="1.3"
                  :precision="3"
                  placeholder="请输入"
                />
                <span>kg/m³</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
  
        <el-row>
          <el-col :span="6">
            <div class="show-more" @click="showMoreKey = !showMoreKey">
              <span>{{ !showMoreKey ? '高级参数设置' : '收起' }}</span>
              <el-icon :class="{ 'retract-icon': showMoreKey }">
                <ArrowUp v-if="showMoreKey" />
                <ArrowDown v-else />
              </el-icon>
            </div>
          </el-col>
        </el-row>
      </el-form>
  
      <h4 class="content-title content-title-self">
        <img src="@/assets/img/user/detail-title.png" alt="" />
        <span>功率曲线&推力系数</span>
        <p class="content-title-icon-content">
          <span
            class="icon-bg"
            :class="{ columnActive: isColumnOrVertical === 'vertical' }"
          >
            <el-icon
              class="content-title-icon"
              @click="changeColumn('vertical')"
            >
              <Switch />
            </el-icon>
          </span>
          <span
            class="icon-bg second-bg"
            :class="{ columnActive: isColumnOrVertical === 'column' }"
          >
            <el-icon
              class="content-title-icon"
              @click="changeColumn('column')"
            >
              <Sort />
            </el-icon>
          </span>
        </p>
      </h4>
  
      <power-curve
        ref="powerCurveRef"
        :isChangeColumn="isColumnOrVertical"
      />
  
      <div class="add-wind-weight">
        <h4 class="content-title">
          <img src="@/assets/img/user/detail-title.png" alt="" />
          风机相关重量
        </h4>
        <wind-weight
          ref="windWeightRef"
          :filedsData="REQUIRED_FIELDS"
          :columns="WIND_WEIGHT"
          windType="weight"
        />
      </div>
  
      <div class="add-wind-weight">
        <h4 class="content-title">
          <img src="@/assets/img/user/detail-title.png" alt="" />
          塔筒荷载
        </h4>
        <wind-weight
          ref="loadColumnRef"
          :columns="LOAD_COLUMN"
          windType="load"
        />
      </div>
  
      <el-row>
        <el-col :span="24" class="form-actions">
          <div class="action-buttons">
            <el-button @click="goBack">取消</el-button>
            <el-button type="primary" @click="onFinish">保存</el-button>
          </div>
        </el-col>
      </el-row>
    </div>
  </template>
  
  <script setup>
  import {
    ref,
    reactive,
    onMounted,
    onBeforeUnmount,
    defineAsyncComponent,
    watch,
    onBeforeMount,
    nextTick,
  } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import {
    ArrowDown,
    ArrowUp,
    Sort,
    Switch,
  } from '@element-plus/icons-vue';
  import { ElMessage } from 'element-plus';
  
  import LoadingComponent from './components/LoadingComponent.vue';
  import {
    WIND_WEIGHT,
    LOAD_COLUMN,
    POWER_REGULATION,
    GENERATOR_TYPE,
    LOAD_TYPE_MAP,
    ICEOPTIONS,
    REQUIRED_FIELDS,
  } from './windPowerEquipment';
  import PowerCurve from './components/PowerCurve.vue';
  import {
    createWindDevice,
    getwindPowerDetail,
    updateWindDevice,
  } from '@/api/modules/windPower.js';
  
  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`加载超时 (${ms}ms)`)), ms),
      ),
    ]);
  }
  
  const WindWeight = defineAsyncComponent({
    loader: () => withTimeout(import('./components/WindWeight.vue'), 10000),
    delay: 0,
    loadingComponent: LoadingComponent,
    suspensible: false,
    onError(error, retry, fail, attempts) {
      console.error('组件加载错误:', error);
      if (attempts <= 3) {
        retry();
      } else {
        fail();
      }
    },
  });
  
  const route = useRoute();
  const router = useRouter();
  
  const requiredRule = (message) => [
    {
      required: true,
      message,
      trigger: ['blur', 'change'],
    },
  ];
  
  const validateAirDensity = (rule, value, callback) => {
    if (value === null || value === undefined || value === '') {
      return Promise.reject('请输入空气密度');
    }
  
    const num = Number(value);
    if (Number.isNaN(num)) {
      return Promise.reject('必须为有效数字');
    }
  
    if (num < 0.5 || num > 1.3) {
      return Promise.reject('超出正常值0.5～1.3范围');
    }
  
    return Promise.resolve();
  };
  
  const survivalTempState = reactive({
    isActive: false,
    isError: false,
    isFocus: false,
  });
  
  const operatingTempState = reactive({
    isActive: false,
    isError: false,
    isFocus: false,
  });
  
  const mouseover = (type) => {
    if (type === 'survival') {
      survivalTempState.isActive = true;
    } else {
      operatingTempState.isActive = true;
    }
  };
  
  const mouseout = (type) => {
    if (type === 'survival') {
      survivalTempState.isActive = survivalTempState.isFocus;
    } else {
      operatingTempState.isActive = operatingTempState.isFocus;
    }
  };
  
  const focus = (type) => {
    if (type === 'survival') {
      survivalTempState.isActive = true;
      survivalTempState.isFocus = true;
    } else {
      operatingTempState.isActive = true;
      operatingTempState.isFocus = true;
    }
  };
  
  const blur = (type) => {
    if (type === 'survival') {
      survivalTempState.isActive = false;
      survivalTempState.isFocus = false;
    } else {
      operatingTempState.isActive = false;
      operatingTempState.isFocus = false;
    }
  };
  
  const showMoreKey = ref(false);
  const windDeviceForm = ref(null);
  const formState = ref({
    deviceModel: '',
    manufacturer: '',
    ratedPower: '',
    authLevel: undefined,
    wheelDiameter: undefined,
    deviceType: undefined,
    powerType: undefined,
    ratedVoltage: undefined,
    ratedFrequency: 50,
    safeWindSpeed: 50,
    minLiveEnvTemperature: -40,
    maxLiveEnvTemperature: 50,
    minOperateTemperature: -30,
    maxOperateTemperature: 40,
    ratedPowerOfGenerator: '',
    airDensity: '',
    deviceCode: '',
  });
  
  const powerCurveRef = ref(null);
  const windWeightRef = ref(null);
  const loadColumnRef = ref(null);
  const pendingWeightData = ref(null);
  const pendingLoadData = ref(null);
  const isColumnOrVertical = ref('vertical');
  
  const onFinish = async () => {
    const flag = await checkDataRequried();
  
    if (!flag) {
      return;
    }
  
    const powerThrustCurveList = powerCurveRef.value.dynamicColumns.map((item) => ({
      ...convertValuesToNumbers(item),
    }));
  
    const towerBarrelList = windWeightRef.value.formState.map((item) => ({
      hubHeight: item.hubHeight,
      dataInfo: item.dataInfo.map((data, index) => ({
        ...convertValuesToNumbers(data),
        barrelSeq: index,
      })),
    }));
  
    const towerBottomLoadList = loadColumnRef.value.formState.map((item) => ({
      hubHeight: item.hubHeight,
      dataInfo: item.dataInfo.map((data) => ({
        ...convertValuesToNumbers(data),
        towerLoadType: LOAD_TYPE_MAP[data.towerLoadType],
      })),
    }));
  
    try {
      const data = {
        ...formState.value,
        ...powerCurveRef.value.formStateSpeed,
        powerThrustCurveList,
        towerBarrelList:
          towerBarrelList && towerBarrelList[0]?.dataInfo.length > 0
            ? towerBarrelList
            : [],
        towerBottomLoadList:
          towerBottomLoadList && towerBottomLoadList[0]?.dataInfo.length > 0
            ? towerBottomLoadList
            : [],
      };
  
      if (!route.query.id) {
        delete data.deviceCode;
      }
  
      const res = route.query.id
        ? await updateWindDevice(data)
        : await createWindDevice(data);
      const msg = route.query.id ? '更新设备成功' : '新增设备成功';
  
      if (res.code === 200 && res.data) {
        ElMessage.success(msg);
        router.push({ path: '/windEquipment/list' });
      }
    } catch (error) {
      console.error('报错', error);
    }
  };
  
  const checkDataRequried = async () => {
    try {
      const formValid = await windDeviceForm.value
        .validate()
        .then(() => true)
        .catch(() => false);
      const [curveValid, windWeightValid, loadColumnValid] = await Promise.all([
        powerCurveRef.value.checkDataRequried(),
        windWeightRef.value.validateFormState(),
        loadColumnRef.value.validateFormState(),
      ]);
  
      return (
        formValid &&
        !curveValid.errors.length &&
        !curveValid.visible &&
        !windWeightValid.length &&
        !loadColumnValid.length
      );
    } catch (error) {
      console.error('全局验证异常:', error);
      return false;
    }
  };
  
  const convertValuesToNumbers = (obj, preservedKeys = []) => {
    const numericObj = {};
  
    Object.keys(obj).forEach((key) => {
      if (preservedKeys.includes(key)) {
        numericObj[key] = obj[key];
      } else {
        numericObj[key] = Number.isNaN(Number(obj[key]))
          ? obj[key]
          : Number(obj[key]);
      }
    });
  
    return numericObj;
  };
  
  const goBack = () => {
    router.back();
  };
  
  const changeColumn = (value) => {
    isColumnOrVertical.value = value;
  };
  
  const getDetailData = async () => {
    try {
      const res = await getwindPowerDetail(route.query.id);
  
      if (res.code !== 200 || !res.data) {
        return;
      }
  
      Object.keys(formState.value).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(res.data, key)) {
          formState.value[key] = res.data[key];
        }
      });
      formState.value.id = res.data.id;
  
      if (res.data.powerThrustCurveList) {
        powerCurveRef.value?.updateData({
          powerThrustCurveList: res.data.powerThrustCurveList,
          allData: res.data,
        });
      }
  
      if (res.data.towerBarrelList) {
        pendingWeightData.value = res.data.towerBarrelList.map((barrel) => ({
          num: barrel.dataInfo.length - 1,
          hubHeight: barrel.hubHeight,
          dataInfo: barrel.dataInfo.map((info) => ({
            ...info,
            barrelSeq:
              info.barrelSeq === 0 ? '风机机舱+叶轮' : `${info.barrelSeq}节`,
          })),
        }));
  
        if (windWeightRef.value) {
          nextTick(() => {
            windWeightRef.value.updateData(pendingWeightData.value);
            pendingWeightData.value = null;
          });
        }
      }
  
      if (res.data.towerBottomLoadList) {
        pendingLoadData.value = res.data.towerBottomLoadList.map((load) => ({
          ...load,
          dataInfo: load.dataInfo.map((info) => ({
            ...info,
            towerLoadType: convertLoadType(info.towerLoadType),
          })),
        }));
  
        if (loadColumnRef.value) {
          nextTick(() => {
            loadColumnRef.value.updateData(pendingLoadData.value);
            pendingLoadData.value = null;
          });
        }
      }
    } catch (error) {
      console.error('获取设备详情失败:', error);
    }
  };
  
  const getWtgFileData = (value) => {
    formState.value.deviceModel = value.description || value.Description;
    formState.value.airDensity =
      value.performance.airDensity || value.performance.AirDensity;
    formState.value.wheelDiameter =
      value.rotorDiameter || value.RotorDiameter;
    formState.value.manufacturer =
      value.manufacturerName || value.ManufacturerName;
  
    let maxPower = 0;
    if (value.performance?.dataTable?.length) {
      maxPower = Math.max(
        ...value.performance.dataTable.map((item) => item.powerOutput),
      );
    }
  
    const table = value.performance?.dataTable || value.performance?.DataTable || [];
    const speedData = table.map((item) => ({
      speed: item.windSpeed || item.WindSpeed,
      power:
        maxPower && maxPower > 100000
          ? item.powerOutput / 1000
          : item.powerOutput,
      thrust: item.thrustCoEfficient,
    }));
  
    const intervalSpeed =
      speedData.length > 1
        ? (speedData[1].speed * 100 - speedData[0].speed * 100) / 100
        : 0;
    const speedPara = {
      cutInWindSpeed:
        value.performance.startStopStrategy.lowSpeedCutIn ||
        value.performance.startStopStrategy.LowSpeedCutIn ||
        value.performance.StartStopStrategy?.LowSpeedCutIn ||
        value.performance.StartStopStrategy.lowSpeedCutIn,
      cutoutWindSpeed:
        value.performance.startStopStrategy.highSpeedCutIn ||
        value.performance.startStopStrategy.HighSpeedCutln ||
        value.performance.StartStopStrategy?.HighSpeedCutln ||
        value.performance.StartStopStrategy.highSpeedCutIn,
      wslnterval: intervalSpeed,
    };
  
    powerCurveRef.value?.updateData({
      powerThrustCurveList: speedData,
      allData: speedPara,
    });
  };
  
  const convertLoadType = (type) => {
    const typeMap = {
      1: '正常运行荷载工况',
      2: '极端荷载工况',
      5: '疲劳荷载工况（上限）',
      6: '疲劳荷载工况（下限）',
    };
  
    return typeMap[type] || type;
  };
  
  watch(windWeightRef, (newValue) => {
    if (newValue && pendingWeightData.value) {
      newValue.updateData(pendingWeightData.value);
      pendingWeightData.value = null;
    }
  });
  
  watch(loadColumnRef, (newValue) => {
    if (newValue && pendingLoadData.value) {
      newValue.updateData(pendingLoadData.value);
      pendingLoadData.value = null;
    }
  });
  
  onBeforeMount(() => {
    if (route.query.id) {
      getDetailData();
    }
  });
  
  onMounted(() => {
    if (
      route.query.type === 'wtg' &&
      sessionStorage.getItem('wtgFileResult')
    ) {
      getWtgFileData(JSON.parse(sessionStorage.getItem('wtgFileResult')));
    }
  });
  
  onBeforeUnmount(() => {
    sessionStorage.removeItem('wtgFileResult');
  });
  </script>
  
  <style scoped lang="scss">
@import './detail.scss';
@import './addWindDevice.scss';
  
  .wind-device-form {
    :deep(.el-select),
    :deep(.el-input),
    :deep(.el-input-number) {
      width: 100%;
    }
  }
  
  .number-with-unit {
    display: flex;
    align-items: center;
    width: 100%;
  
    .el-input-number {
      flex: 1;
    }
  
    > span {
      min-width: 42px;
      padding-left: 8px;
      color: #606266;
      text-align: left;
    }
  }
  
  .range-number-cont {
    display: flex;
    align-items: center;
    width: 100%;
  }
  
  .range-number-input {
    position: relative;
    flex: 1;
    min-width: 0;
  
    :deep(.el-input-number) {
      width: 100%;
    }
  }
  
  .range-number-input-last {
    display: flex;
    align-items: center;
  }
  
  .custom-icon {
    padding: 0 6px;
  }
  
  .custom-unit {
    padding-left: 6px;
    color: #606266;
  }
  
  .show-more {
    display: inline-flex;
    align-items: center;
    color: #036b64;
    cursor: pointer;
    gap: 4px;
  }
  
  .content-title-icon-content {
    display: inline-flex;
    align-items: center;
    margin-left: 12px;
  }
  
  .icon-bg {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    cursor: pointer;
  }
  
  .content-title-icon {
    color: #7c8294;
  }
  
  .columnActive {
    background: #e7f4f2;
    border-radius: 4px;
  
    .content-title-icon {
      color: #036b64;
    }
  }
  
  .form-actions {
    text-align: center;
  }
  
  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 12px;
  }
  </style>