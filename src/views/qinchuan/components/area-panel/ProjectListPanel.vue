<!-- components/area-panel/ProjectListPanel.vue -->
<!-- 放大层级后，右侧默认收起；展开后是项目卡片列表。
     数据由父组件通过 getPageList 拉取，本组件只负责展示 + 抛事件。
     点击列表项对外抛出 select 事件，由父组件负责 flyTo + 切换到详情面板。 -->
     <template>
        <div class="area-list-wrap">
          <!-- 收起态：只有一个展开箭头 -->
          <button
            v-if="!expanded"
            type="button"
            class="expand-toggle collapsed"
            title="展开项目列表"
            @click="expanded = true"
          >
            <svg viewBox="0 0 16 16" class="chevron"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
      
          <section v-else class="area-list-panel">
            <button
              type="button"
              class="expand-toggle attached"
              title="收起"
              @click="expanded = false"
            >
              <svg viewBox="0 0 16 16" class="chevron rotated"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
      
            <header class="list-header">
              <div class="header-top">
                <div class="title-block">
                  <div class="title">{{ title }}</div>
                  <div class="subtitle">共{{ total }}条{{ subtitleExtra }}</div>
                </div>
                <div class="header-actions">
                  <button type="button" class="header-btn primary" @click="$emit('add')">
                    <svg viewBox="0 0 16 16" class="btn-icon"><path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
                    添加项目
                  </button>
                </div>
              </div>
      
              <div class="filter-row">
                <select
                  :value="stageFilter"
                  class="filter-select"
                  @change="onStageChange"
                >
                  <option value="">全部阶段</option>
                  <option
                    v-for="opt in stageOptions"
                    :key="opt.code"
                    :value="opt.code"
                  >
                    {{ opt.desc }}
                  </option>
                </select>
                <div class="search-box">
                  <svg viewBox="0 0 16 16" class="search-icon"><circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
                  <input
                    v-model="keyword"
                    class="search-input"
                    placeholder="项目名称"
                  />
                </div>
              </div>
            </header>
      
            <div class="list-body">
              <div
                v-for="item in displayList"
                :key="item.id"
                class="area-card"
                :class="{ active: item.id === activeId }"
                @click="$emit('select', item)"
              >
                <div class="card-top">
                  <span
                    class="tag"
                    :class="item.itemType === 'FD' ? 'tag-wind' : 'tag-solar'"
                  >
                    {{ ITEM_TYPE_MAP[item.itemType] || '-' }}
                  </span>
                  <span class="card-name" :title="item.projectName">
                    {{ item.projectName || '-' }}
                  </span>
                </div>
                <div class="card-bottom">
                  <span class="card-meta">
                    <svg viewBox="0 0 16 16" class="meta-icon"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M8 4.6V8l2.4 1.4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
                    {{ item.projectCode || '-' }}
                  </span>
                  <span class="card-meta">
                    <svg viewBox="0 0 16 16" class="meta-icon"><circle cx="8" cy="5.6" r="2.4" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M3.2 13c0-2.4 2.1-4 4.8-4s4.8 1.6 4.8 4" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
                    {{ item.managerName || '-' }}
                  </span>
                  <span class="card-meta">
                    {{ item.currentProjectCapacity ?? '-' }}MW
                  </span>
                </div>
              </div>
      
              <div v-if="!displayList.length && !loading" class="empty-state">暂无数据~</div>
              <div v-if="loading" class="empty-state">加载中…</div>
            </div>
      
            <footer v-if="total" class="list-footer">
              <span class="footer-total">共 {{ total }} 条</span>
              <span class="pager">
                <button
                  type="button"
                  class="pager-btn"
                  :disabled="page <= 1"
                  @click="$emit('update:page', page - 1)"
                >‹</button>
                <button
                  v-for="p in pageNumbers"
                  :key="p"
                  type="button"
                  class="pager-btn"
                  :class="{ active: p === page }"
                  @click="$emit('update:page', p)"
                >{{ p }}</button>
                <button
                  type="button"
                  class="pager-btn"
                  :disabled="page >= pageCount"
                  @click="$emit('update:page', page + 1)"
                >›</button>
              </span>
            </footer>
          </section>
        </div>
      </template>
      
      <script setup>
      import { computed, ref } from 'vue'
      
      const props = defineProps({
        title: { type: String, default: '项目列表' },
        subtitleExtra: { type: String, default: '' },
        list: { type: Array, default: () => [] },
        total: { type: Number, default: 0 },
        page: { type: Number, default: 1 },
        pageSize: { type: Number, default: 10 },
        activeId: { type: [String, Number], default: null },
        loading: { type: Boolean, default: false },
        stageOptions: { type: Array, default: () => [] },
        stageFilter: { type: String, default: '' },
        modelValueExpanded: { type: Boolean, default: false },
      })
      
      const emit = defineEmits([
        'select', 'add',
        'update:page',
        'update:stageFilter',
        'update:modelValueExpanded',
      ])
      
      const ITEM_TYPE_MAP = { FD: '风电', GF: '光伏' }
      
      const expanded = computed({
        get: () => props.modelValueExpanded,
        set: (val) => emit('update:modelValueExpanded', val),
      })
      
      const keyword = ref('')
      
      // 本页内按名称做一次前端过滤，避免关键字筛选还得打一次接口
      const displayList = computed(() => {
        if (!keyword.value) return props.list
        const kw = keyword.value.trim()
        return props.list.filter((item) =>
          (item.projectName || '').includes(kw)
        )
      })
      
      const pageCount = computed(() =>
        Math.max(1, Math.ceil(props.total / props.pageSize))
      )
      
      const pageNumbers = computed(() => {
        const total = pageCount.value
        const current = props.page
        const maxVisible = 5
        if (total <= maxVisible) {
          return Array.from({ length: total }, (_, i) => i + 1)
        }
        let start = Math.max(1, current - 2)
        let end = start + maxVisible - 1
        if (end > total) {
          end = total
          start = end - maxVisible + 1
        }
        return Array.from({ length: end - start + 1 }, (_, i) => start + i)
      })
      
      function onStageChange(e) {
        emit('update:stageFilter', e.target.value)
        emit('update:page', 1)
      }
      </script>
      
      <style scoped>
      .area-list-wrap {
        position: relative;
        height: 100%;
      }
      
      .expand-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 44px;
        border: 1px solid rgba(90, 201, 255, 0.7);
        border-radius: 4px;
        cursor: pointer;
        color: #9bdfff;
        background: rgba(3, 22, 48, 0.9);
      }
      
      .expand-toggle.collapsed {
        margin-top: 4px;
      }
      
      .expand-toggle.attached {
        position: absolute;
        top: 50%;
        left: -14px;
        z-index: 5;
        transform: translateY(-50%);
      }
      
      .chevron {
        width: 14px;
        height: 14px;
      }
      
      .chevron.rotated {
        transform: rotate(180deg);
      }
      
      .area-list-panel {
        position: relative;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        width: clamp(300px, 24vw, 380px);
        max-height: 100%;
        border: 1px solid rgba(90, 201, 255, 0.7);
        border-radius: 6px;
        color: #d9f5ff;
        background:
          linear-gradient(180deg, rgba(7, 44, 78, 0.96), rgba(3, 22, 48, 0.97)),
          rgba(3, 22, 48, 0.95);
        box-shadow:
          0 0 0 1px rgba(42, 159, 255, 0.15) inset,
          0 10px 28px rgba(0, 0, 0, 0.35);
      }
      
      .list-header {
        padding: 16px 16px 12px;
        border-bottom: 1px solid rgba(118, 213, 255, 0.18);
      }
      
      .header-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 10px;
      }
      
      .title {
        color: #fff;
        font-size: 17px;
        font-weight: 600;
      }
      
      .subtitle {
        margin-top: 4px;
        color: #8fb9cc;
        font-size: 12px;
      }
      
      .header-actions {
        display: flex;
        flex-shrink: 0;
        gap: 8px;
      }
      
      .header-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 5px 10px;
        border: 1px solid rgba(125, 213, 255, 0.55);
        border-radius: 3px;
        cursor: pointer;
        color: #c8efff;
        background: rgba(8, 66, 104, 0.6);
        font-size: 12px;
        white-space: nowrap;
      }
      
      .header-btn.primary {
        border-color: #49d5ff;
        color: #fff;
        background: rgba(12, 130, 178, 0.85);
      }
      
      .btn-icon {
        width: 12px;
        height: 12px;
      }
      
      .filter-row {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }
      
      .filter-select {
        flex: 1;
        min-width: 0;
        height: 30px;
        padding: 0 8px;
        border: 1px solid rgba(101, 195, 238, 0.4);
        border-radius: 3px;
        color: #d9f5ff;
        background: rgba(0, 18, 39, 0.6);
        font-size: 12px;
      }
      
      .filter-select option {
        color: #042238;
      }
      
      .search-box {
        display: flex;
        flex: 1.4;
        align-items: center;
        min-width: 0;
        height: 30px;
        padding: 0 8px;
        border: 1px solid rgba(101, 195, 238, 0.4);
        border-radius: 3px;
        background: rgba(0, 18, 39, 0.6);
      }
      
      .search-icon {
        width: 12px;
        height: 12px;
        margin-right: 4px;
        color: #7fa8bb;
        flex-shrink: 0;
      }
      
      .search-input {
        flex: 1;
        min-width: 0;
        border: none;
        outline: none;
        color: #d9f5ff;
        background: transparent;
        font-size: 12px;
      }
      
      .list-body {
        flex: 1;
        min-height: 0;
        padding: 8px 12px;
        overflow-y: auto;
      }
      
      .area-card {
        padding: 10px 12px;
        margin-bottom: 8px;
        border: 1px solid transparent;
        border-radius: 5px;
        cursor: pointer;
        background: rgba(255, 255, 255, 0.03);
        transition: background 0.15s, border-color 0.15s;
      }
      
      .area-card:hover {
        background: rgba(82, 190, 245, 0.1);
      }
      
      .area-card.active {
        border-color: #49d5ff;
        background: rgba(82, 190, 245, 0.16);
      }
      
      .card-top {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .tag {
        padding: 1px 6px;
        border-radius: 3px;
        font-size: 11px;
        white-space: nowrap;
      }
      
      .tag-wind {
        color: #7fc3ff;
        background: rgba(43, 130, 179, 0.35);
      }
      
      .tag-solar {
        color: #f0c83e;
        background: rgba(240, 200, 62, 0.25);
      }
      
      .card-name {
        overflow: hidden;
        color: #effbff;
        font-size: 13px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      
      .card-bottom {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 6px;
      }
      
      .card-meta {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: #7fa8bb;
        font-size: 11px;
      }
      
      .meta-icon {
        width: 11px;
        height: 11px;
      }
      
      .empty-state {
        padding: 30px 0;
        color: #6f93a6;
        font-size: 12px;
        text-align: center;
      }
      
      .list-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 14px;
        border-top: 1px solid rgba(118, 213, 255, 0.18);
      }
      
      .footer-total {
        color: #7fa8bb;
        font-size: 12px;
      }
      
      .pager {
        display: flex;
        gap: 4px;
      }
      
      .pager-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 22px;
        height: 22px;
        padding: 0 4px;
        border: 1px solid rgba(101, 195, 238, 0.35);
        border-radius: 3px;
        cursor: pointer;
        color: #c8efff;
        background: transparent;
        font-size: 11px;
      }
      
      .pager-btn.active {
        border-color: #49d5ff;
        color: #fff;
        background: rgba(12, 130, 178, 0.85);
      }
      
      .pager-btn:disabled {
        cursor: not-allowed;
        opacity: 0.4;
      }
      </style>