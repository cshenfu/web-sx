<!-- components/report-wizard/shared/ReferenceBox.vue -->
<!-- “引用项目数据”选中后展示的只读信息框：一组 label/value，value 可以是普通文本或蓝色链接。
     TODO：接口就绪后，rows 直接传接口返回的真实引用数据即可，结构不用变。 -->
     <template>
        <div class="reference-box">
          <div v-for="(row, idx) in rows" :key="idx" class="reference-row">
            <span v-if="row.label" class="reference-label">{{ row.label }}：</span>
            <a v-if="row.link" class="reference-link" href="javascript:void(0)">{{ row.value }}</a>
            <span v-else class="reference-value">{{ row.value }}</span>
          </div>
          <div v-if="!rows.length" class="reference-empty">暂无引用数据</div>
        </div>
      </template>
      
      <script setup>
      defineProps({
        rows: { type: Array, default: () => [] }, // [{label, value, link}]
      })
      </script>
      
      <style scoped>
      .reference-box {
        padding: 10px 12px;
        border-radius: 4px;
        background: #f5f6f8;
      }
      
      .reference-row {
        padding: 3px 0;
        font-size: 12.5px;
        line-height: 1.6;
      }
      
      .reference-label {
        color: #6b7280;
      }
      
      .reference-value {
        color: #374151;
      }
      
      .reference-link {
        color: #2f8dff;
        text-decoration: none;
      }
      
      .reference-empty {
        color: #9ca3af;
        font-size: 12.5px;
      }
      </style>