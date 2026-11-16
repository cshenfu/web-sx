<script>
import { Comment, Fragment, Text, h, isVNode } from 'vue'
import { ElIcon, ElPopover } from 'element-plus'
import { MoreFilled } from '@element-plus/icons-vue'

function flattenActionNodes(nodes, result = []) {
  for (const node of nodes || []) {
    if (!isVNode(node) || node.type === Comment || node.type === Text) continue
    if (
      (node.type === Fragment || node.type === 'div') &&
      Array.isArray(node.children)
    ) {
      // 操作列通常会用 .operation-btn 之类的 div 包住多个按钮；
      // 展开这类容器，按真实按钮数量计算，而不是把整个 div 当成一个操作。
      flattenActionNodes(node.children, result)
    } else {
      result.push(node)
    }
  }
  return result
}

export default {
  name: 'ActionOverflow',
  inheritAttrs: false,
  props: {
    maxVisible: { type: Number, default: 4 },
  },
  setup(props, { slots, attrs }) {
    return () => {
      const actions = flattenActionNodes(slots.default?.() || [])
      const visibleActions = actions.slice(0, Math.max(0, props.maxVisible))
      const overflowActions = actions.slice(Math.max(0, props.maxVisible))

      return h('div', {
        class: ['action-overflow', attrs.class],
        style: { minWidth: overflowActions.length ? '260px' : '0' },
      }, [
        ...visibleActions,
        ...(overflowActions.length
          ? [
              h(
                ElPopover,
                {
                  trigger: 'hover',
                  placement: 'top',
                  width: 'auto',
                  showArrow: false,
                  popperClass: 'action-overflow-popper',
                  teleported: true,
                },
                {
                  reference: () =>
                    h(
                      'button',
                      {
                        type: 'button',
                        class: 'action-overflow-trigger',
                        'aria-label': '更多操作',
                        title: '更多操作',
                        onClick: (event) => event.stopPropagation(),
                      },
                      [h(ElIcon, null, { default: () => h(MoreFilled) })],
                    ),
                  default: () =>
                    h('div', { class: 'action-overflow-menu' }, overflowActions),
                },
              ),
            ]
          : []),
      ])
    }
  },
}
</script>

<style lang="scss">
.action-overflow {
  display: inline-flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 6px;
  min-width: 260px;
}

.action-overflow-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  color: #718092;
  background: transparent;
  border: 0;
  border-radius: 5px;
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease;
}

.action-overflow-trigger:hover {
  color: #087fe5;
  background: #edf5ff;
}

.action-overflow-popper {
  padding: 8px 10px !important;
  border: 1px solid #e1e7ef !important;
  border-radius: 7px !important;
  box-shadow: 0 6px 20px rgba(35, 65, 95, 0.14) !important;
}

.action-overflow-menu {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
  max-width: 360px;
}

.action-overflow-menu > * {
  flex: 0 0 auto;
}
</style>
