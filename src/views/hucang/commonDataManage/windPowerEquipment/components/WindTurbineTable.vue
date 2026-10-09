<!-- WindTurbineTable.vue 子组件 -->
<template>
    <div class="add-wind-table">
      <ul class="add-wind-table-ul">
        <li>
          <span>轮毂高度 </span>
          <a-select
            @change="(e) => $emit('change-height', e, parentIndex)"
            style="width: 250px"
            v-model:value="item.hubHeight"
            placeholder="请选择"
            :options="heightOptions"
            :getPopupContainer="(trigger) => trigger.parentNode"
          />
        </li>
        <li v-if="windType == 'weight'">
          <span>塔筒节数 </span>
          <a-select
            @change="(e) => $emit('change-tower-num', e, parentIndex)"
            style="width: 250px"
            v-model:value="item.num"
            placeholder="请选择"
            :options="towerNumOptions"
            :getPopupContainer="(trigger) => trigger.parentNode"
          />
        </li>
      </ul>
      
      <iconpark-icon
        name="shanjian"
        class="shanjian-icon"
        @click="$emit('delete', parentIndex)"
      ></iconpark-icon>
      
      <div class="virtual-table-container" ref="tableContainer">
        <div class="virtual-table-scroller" :style="{ height: totalHeight + 'px' }">
          <div class="virtual-table" :style="{ transform: `translateY(${offsetY}px)` }">
            <!-- 表头 -->
            <div class="virtual-table-header" :style="{ width: tableWidth + 'px' }">
              <div v-for="(column, colIndex) in item.columns" :key="colIndex" class="virtual-table-cell">
                <p class="self_table_title">{{ column.title }} <span v-if="column.required">*</span></p>
              </div>
            </div>
            
            <!-- 表体（虚拟滚动） -->
            <div 
              v-for="(record, rowIndex) in visibleRows" 
              :key="rowIndex" 
              class="virtual-table-row"
            >
              <div 
                v-for="(column, colIndex) in item.columns" 
                :key="colIndex" 
                class="virtual-table-cell"
              >
                <div class="cell-wrapper">
                  <a-input
                    v-if="column.formTypes === 'input'"
                    :disabled="isCellDisabled(column, record, rowIndex)"
                    :placeholder="getPlaceholder(column, rowIndex)"
                    v-model:value="record[column.dataIndex]"
                    @paste="(e) => $emit('handle-paste', e, parentIndex, rowIndex, column.dataIndex)"
                    :class="{ 'error-input': hasError(rowIndex, column.dataIndex) }"
                  />
                  
                  <a-select
                    v-if="column.formTypes === 'select'"
                    :disabled="isCellDisabled(column, record, rowIndex)"
                    style="width: 130px"
                    :placeholder="column.placeholder"
                    :status="hasError(rowIndex, column.dataIndex) ? 'error' : ''"
                    :options="column.options"
                    v-model:value="record[column.dataIndex]"
                  />
                  
                  <span v-if="column.formTypes === 'fixedName'">{{ record[column.dataIndex] }}</span>
                  
                  <div v-if="hasError(rowIndex, column.dataIndex)" class="error-tip">
                    {{ getFieldErrorMessage(rowIndex, column.dataIndex) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  
  const props = defineProps({
    item: Object,
    parentIndex: Number,
    windType: String,
    heightOptions: Array,
    errorState: Object,
    columns: Array,
    filedsData: Array,
  });
  
  const emit = defineEmits(['delete', 'change-height', 'change-tower-num', 'handle-paste']);
  
  // 虚拟滚动相关变量
  const tableContainer = ref(null);
  const rowHeight = 50; // 每行高度
  const headerHeight = 40; // 表头高度
  const visibleCount = 20; // 可见行数
  const offsetY = ref(0);
  const totalHeight = computed(() => props.item.dataInfo.length * rowHeight + headerHeight);
  const tableWidth = ref(1200); // 初始宽度，根据实际情况调整
  
  // 计算可见行
  const visibleRows = computed(() => {
    const startIndex = Math.max(0, Math.floor(offsetY.value / rowHeight) - 5);
    return props.item.dataInfo.slice(startIndex, startIndex + visibleCount + 10);
  });
  
  // 初始化虚拟滚动
  const initVirtualScroll = () => {
    if (!tableContainer.value) return;
    
    const handleScroll = () => {
      const scrollTop = tableContainer.value.scrollTop;
      offsetY.value = scrollTop;
    };
    
    tableContainer.value.addEventListener('scroll', handleScroll);
  };
  
  onMounted(() => {
    initVirtualScroll();
    // 初始化表格宽度
    if (tableContainer.value) {
      tableWidth.value = tableContainer.value.clientWidth;
    }
  });
  
  // 计算塔筒节数选项
  const towerNumOptions = computed(() => {
    if (!props.item.hubHeight) return [];
    const towerNum = props.item.hubHeight <= 140 ? 10 : 60;
    const arr = [];
    for (let i = 5; i <= towerNum; i++) {
      arr.push({ label: `${i}节`, value: i });
    }
    return arr;
  });
  
  // 单元格禁用状态
  const isCellDisabled = (column, record, index) => {
    if (column.dataIndex == 'weight' && index !== 0) return true;
    if (props.item.hubHeight > 140) {
      if (
        (column.dataIndex == 'tmm' && index == 0) ||
        (column.dataIndex == 'material' && index == 0)
      ) {
        return true;
      }
    }
    if (props.item.hubHeight <= 140) {
      if (column.dataIndex == 'tmm' || column.dataIndex == 'material') {
        return true;
      }
    }
    return false;
  };
  
  // 错误状态
  const hasError = (rowIndex, field) => {
    const sectionName = `风机${props.parentIndex + 1} - 第${rowIndex + 1}节`;
    return props.errorState.errors.some(
      err => err.location === sectionName && err.field === field
    );
  };
  
  const getFieldErrorMessage = (rowIndex, field) => {
    const sectionName = `风机${props.parentIndex + 1} - 第${rowIndex + 1}节`;
    const err = props.errorState.errors.find(
      e => e.location === sectionName && e.field === field
    );
    return err?.expected || '该字段有误';
  };
  
  const getPlaceholder = (column, rowIndex) => {
    return column.placeholderRequired && rowIndex == 0
      ? column.placeholderRequired
      : column.placeholder;
  };
  </script>
  
  <style scoped lang="scss">
  .add-wind-table {
    width: calc(80% - 30px);
    margin-top: 20px;
    position: relative;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    padding: 15px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.3s;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .add-wind-table-ul {
      display: flex;
      background: #f2f7f7;
      height: 60px;
      border-radius: 4px;
      padding: 0 15px;
      margin-bottom: 15px;
  
      li {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 20px;
        
        span {
          margin-right: 15px;
          font-weight: 500;
        }
      }
    }
    
    .shanjian-icon {
      position: absolute;
      top: 30px;
      right: -30px;
      font-size: 18px;
      color: #ff4d4f;
      cursor: pointer;
      transition: transform 0.2s;
      
      &:hover {
        transform: scale(1.1);
      }
    }
    
    .virtual-table-container {
      height: 600px;
      overflow-y: auto;
      border: 1px solid #e8e8e8;
      border-radius: 4px;
      
      .virtual-table-scroller {
        position: relative;
        overflow: hidden;
        
        .virtual-table {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
        }
        
        .virtual-table-header {
          display: flex;
          height: 40px;
          background: #fafafa;
          border-bottom: 1px solid #e8e8e8;
          position: sticky;
          top: 0;
          z-index: 1;
          
          .virtual-table-cell {
            flex: 1;
            padding: 8px 16px;
            font-weight: 500;
            min-width: 120px;
            
            .self_table_title {
              margin: 0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              
              span {
                color: red;
              }
            }
          }
        }
        
        .virtual-table-row {
          display: flex;
          height: 50px;
          border-bottom: 1px solid #f0f0f0;
          
          &:nth-child(even) {
            background-color: #fafafa;
          }
          
          &:hover {
            background-color: #e6f7ff;
          }
          
          .virtual-table-cell {
            flex: 1;
            padding: 8px 16px;
            min-width: 120px;
            display: flex;
            align-items: center;
            
            .cell-wrapper {
              width: 100%;
              position: relative;
            }
            
            .error-input {
              border-color: #ff4d4f !important;
            }
            
            .error-tip {
              position: absolute;
              bottom: -18px;
              left: 0;
              color: #ff4d4f;
              font-size: 12px;
              line-height: 1;
            }
          }
        }
      }
    }
  }
  </style>