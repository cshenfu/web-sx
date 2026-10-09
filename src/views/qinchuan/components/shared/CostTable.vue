<!-- components/report-wizard/shared/CostTable.vue -->
<!-- 按“类型”分组、支持调整值编辑的费用表格。type 相同的连续行会合并成一个纵向单元格。 -->
<template>
    <table class="cost-table">
      <thead>
        <tr>
          <th class="col-type">类型</th>
          <th class="col-name">费用项</th>
          <th class="col-unit">单位</th>
          <th class="col-default">默认值</th>
          <th class="col-price">调整值</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, idx) in rows" :key="row.dataIndex">
          <td v-if="rowSpans[idx]" class="col-type" :rowspan="rowSpans[idx]">{{ row.type }}</td>
          <td class="col-name">{{ row.name }}</td>
          <td class="col-unit">{{ row.unit }}</td>
          <td class="col-default">
            {{ row.default }}
            <div v-if="row.desc" class="default-desc">{{ row.desc }}</div>
          </td>
          <td class="col-price">
            <input
              class="price-input"
              type="text"
              :placeholder="String(row.default)"
              :value="row.price"
              @input="(e) => updatePrice(row, e.target.value)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    rows: { type: Array, required: true },
  })
  
  const emit = defineEmits(['update:rows'])
  
  // 计算“类型”列的合并行数：连续相同 type 只在第一行渲染，rowspan 覆盖后续行
  const rowSpans = computed(() => {
    const spans = new Array(props.rows.length).fill(0)
    let i = 0
    while (i < props.rows.length) {
      let count = 1
      while (i + count < props.rows.length && props.rows[i + count].type === props.rows[i].type) {
        count++
      }
      spans[i] = count
      i += count
    }
    return spans
  })
  
  function updatePrice(row, value) {
    const next = props.rows.map((r) => (r.dataIndex === row.dataIndex ? { ...r, price: value } : r))
    emit('update:rows', next)
  }
  </script>
  
  <style scoped>
  .cost-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12.5px;
  }
  
  .cost-table th {
    padding: 10px 8px;
    color: #6b7280;
    background: #f5f6f8;
    border: 1px solid #e5e7eb;
    font-weight: 500;
    text-align: center;
  }
  
  .cost-table td {
    padding: 8px;
    color: #374151;
    border: 1px solid #e5e7eb;
    text-align: center;
    vertical-align: middle;
  }
  
  .col-name {
    text-align: left;
  }
  
  .default-desc {
    margin-top: 4px;
    color: #9ca3af;
    font-size: 11px;
    line-height: 1.5;
  }
  
  .price-input {
    box-sizing: border-box;
    width: 100%;
    height: 30px;
    padding: 0 8px;
    border: 1px solid #d1d5db;
    border-radius: 3px;
    outline: none;
    text-align: center;
  }
  
  .price-input:focus {
    border-color: #2f8dff;
  }
  </style>