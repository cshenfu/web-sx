<template>
    <a-table
      :columns="columns"
      :data-source="treeData"
      :tree-data="true"
      :row-key="record => record.key"
      bordered
      style="width: 100%;"
    >
      <!-- 自定义展开/折叠图标 -->
      <template #expandIcon="{ expanded, onExpand, record }">
        <span
          v-if="record.children && record.children.length > 0"
          @click.stop="onExpand(record)"
          class="custom-expand-icon"
        >
          {{ expanded ? '▼' : '▶' }}
        </span>
        <span v-else class="custom-expand-icon-empty"></span>
      </template>
      
      <!-- 操作列右键菜单 -->
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === '编号'">
          <a-dropdown
            trigger="contextmenu"
            @visible-change="(visible) => handleMenuVisible(visible, record)"
          >
            <div class="dropdown-trigger">{{ record.编号 }}</div>
            <template #overlay>
              <a-menu>
                <a-menu-item v-if="canAddChild(record)" @click="() => addChild(record)">
                  添加子项
                </a-menu-item>
                <a-menu-item v-if="canMoveUp(record)" @click="() => moveUp(record)">
                  上移
                </a-menu-item>
                <a-menu-item v-if="canMoveDown(record)" @click="() => moveDown(record)">
                  下移
                </a-menu-item>
                <a-menu-item v-if="canDelete(record)" @click="() => deleteNode(record)">
                  删除
                </a-menu-item>
                <a-menu-item v-if="canAddSibling(record)" @click="() => addSibling(record)">
                  添加平级项
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
      </template>
      
      <!-- 名称列：使用模板语法实现层级连接线 -->
      <template #nameCell="{ record }">
        <div class="tree-node-wrapper">
          <!-- 层级连接线 -->
          <div class="tree-indent-container">
            <div
              v-for="(levelInfo, index) in getLevelInfo(record)"
              :key="index"
              :class="levelInfo.className"
            ></div>
          </div>
          
          <!-- 节点文本 -->
          <span class="tree-node-text">{{ record.名称 }}</span>
        </div>
      </template>
    </a-table>
  </template>
  
  <script setup>
  import { ref, reactive, onMounted, computed } from 'vue';
  import { Table, Dropdown, Menu } from 'ant-design-vue';
  
  // --------------------- 1. 初始化树形数据 ---------------------
  const treeData = reactive([
    {
      key: '1',
      编号: '1',
      名称: '施工辅助工程',
      children: [
        {
          key: '1.1',
          编号: '1.1',
          名称: '施工供电工程',
          children: [
            {
              key: '1.1.1',
              编号: '1.1.1',
              名称: '供电线路工程',
              单位: '项',
              数量: 1.00,
              单价: 450000,
              单价编号: 'JG0076',
              定额编号: '陆建1001',
              children: [],
            },
            {
              key: '1.1.2',
              编号: '1.1.2',
              名称: '供电设施工程',
              单位: '项',
              数量: 1.00,
              单价: 150000,
              children: [
                {
                  key: '1.1.2.1',
                  编号: '1.1.2.1',
                  名称: '供电设施子工程',
                  单位: '项',
                  数量: 1.00,
                  单价: 150000,
                  children: [],
                },
              ],
            },
          ],
        },
        {
          key: '2',
          编号: '2',
          名称: '风电机组安装平台工程',
          children: [
            {
              key: '2.1',
              编号: '2.1',
              名称: '一般场地平整',
              单位: 'm²',
              数量: 9000.00,
              单价: 0.7944,
              单价编号: 'JG0076',
              定额编号: '陆建1001',
              children: [],
            },
            {
              key: '2.2',
              编号: '2.2',
              名称: '土方开挖',
              单位: 'm²',
              数量: 2648.00,
              单价: 22.5369,
              单价编号: 'JG0001',
              定额编号: '陆建1029',
              children: [],
            },
          ],
        },
      ],
    },
  ]);
  
  // 递归设置 parent/index
  const buildTree = (data, parent = null) => {
    data.forEach((item, index) => {
      item.parent = parent;
      item.index = index;
      if (item.children && item.children.length > 0) {
        buildTree(item.children, item);
      }
    });
  };
  onMounted(() => buildTree(treeData));
  
  // --------------------- 2. 表格列配置 ---------------------
  const columns = [
    { title: '编号', dataIndex: '编号', key: '编号',slots: { customRender: 'nameCell' }}, // 指定使用自定义插槽 },
    {
      title: '名称',
      dataIndex: '名称',
      key: '名称',
     
    },
    { title: '单位', dataIndex: '单位', key: '单位' },
    { title: '数量', dataIndex: '数量', key: '数量' },
    { title: '单价/元', dataIndex: '单价', key: '单价' },
    {
      title: '合计/万元',
      dataIndex: '合计',
      key: '合计',
      render: (_, record) => ((record.数量 * record.单价) / 10000).toFixed(4),
    },
    { title: '单价编号', dataIndex: '单价编号', key: '单价编号' },
    { title: '定额编号', dataIndex: '定额编号', key: '定额编号' },
    { title: '备注', dataIndex: '备注', key: '备注' },
    { title: '标记', dataIndex: '标记', key: '标记' },
    { title: '操作', dataIndex: 'actions', key: 'actions', width: 120 },
  ];
  
  // --------------------- 3. 生成层级信息 ---------------------
  const getLevelInfo = (record) => {
    const levelInfo = [];
    
    // 计算层级深度
    let level = 0;
    let parent = record.parent;
    while (parent) {
      level++;
      parent = parent.parent;
    }
    
    // 获取父节点路径信息
    parent = record.parent;
    const parentPath = [];
    while (parent) {
      parentPath.unshift(parent);
      parent = parent.parent;
    }
    
    // 生成每一层的连接线信息
    for (let i = 0; i < level; i++) {
      const currentParent = parentPath[i];
      const hasNextSibling = 
        currentParent && 
        currentParent.children && 
        currentParent.children.length > currentParent.index + 1;
      
      levelInfo.push({
        className: hasNextSibling 
          ? 'tree-indent tree-indent-line' 
          : 'tree-indent tree-indent-empty'
      });
    }
    
    // 最后一级的连接线信息
    const isLeaf = !(record.children && record.children.length > 0);
    if (!isLeaf) {
      levelInfo.push({ className: 'tree-indent tree-indent-last' });
    } else {
      levelInfo.push({ className: 'tree-indent tree-indent-empty' });
    }
    
    return levelInfo;
  };
  
  // --------------------- 4. 右键菜单逻辑 ---------------------
  let currentRecord = null;
  
  const handleMenuVisible = (visible, record) => {
    currentRecord = visible ? record : null;
  };
  
  // --------------------- 5. 操作权限判断 ---------------------
  const canAddChild = (record) => 
    record && Array.isArray(record.children);
  
  const canMoveUp = (record) => 
    record && record.parent && record.index > 0;
  
  const canMoveDown = (record) => 
    record && record.parent && record.index < record.parent.children.length - 1;
  
  const canDelete = (record) => 
    record && record.parent;
  
  const canAddSibling = (record) => 
    record && record.parent;
  
  // --------------------- 6. 数据操作方法 ---------------------
  const addChild = (record) => {
    const newChild = {
      key: `${record.key}.${record.children.length + 1}`,
      编号: `${record.编号}.${record.children.length + 1}`,
      名称: '新子项',
      单位: '',
      数量: 0,
      单价: 0,
      单价编号: '',
      定额编号: '',
      备注: '',
      标记: '',
      children: [],
      parent: record,
      index: record.children.length,
    };
    record.children.push(newChild);
    buildTree([newChild], record);
  };
  
  const moveUp = (record) => {
    if (!record.parent) return;
    const { parent, index } = record;
    if (index > 0) {
      [parent.children[index], parent.children[index - 1]] = [
        parent.children[index - 1],
        parent.children[index],
      ];
      parent.children[index].index = index;
      parent.children[index - 1].index = index - 1;
      buildTree(parent.children, parent);
    }
  };
  
  const moveDown = (record) => {
    if (!record.parent) return;
    const { parent, index } = record;
    if (index < parent.children.length - 1) {
      [parent.children[index], parent.children[index + 1]] = [
        parent.children[index + 1],
        parent.children[index],
      ];
      parent.children[index].index = index;
      parent.children[index + 1].index = index + 1;
      buildTree(parent.children, parent);
    }
  };
  
  const deleteNode = (record) => {
    if (!record.parent) return;
    const { parent, index } = record;
    parent.children.splice(index, 1);
    parent.children.forEach((child, i) => (child.index = i));
    buildTree(parent.children, parent);
  };
  
  const addSibling = (record) => {
    if (!record.parent) return;
    const { parent } = record;
    const newSibling = {
      key: `${parent.key}.${parent.children.length + 1}`,
      编号: `${parent.编号}.${parent.children.length + 1}`,
      名称: '新平级项',
      单位: '',
      数量: 0,
      单价: 0,
      单价编号: '',
      定额编号: '',
      备注: '',
      标记: '',
      children: [],
      parent: parent,
      index: parent.children.length,
    };
    parent.children.push(newSibling);
    buildTree([newSibling], parent);
  };
  </script>
  
  <style scoped>
  /* 操作列触发区域样式 */
  .dropdown-trigger {
    display: flex;
    align-items: center;
    height: 100%;
    cursor: pointer;
  }
  
  /* 鼠标悬停高亮 */
  .ant-table-tbody > tr:hover > td {
    background-color: #f5f7fa;
  }
  
  /* 自定义展开/折叠图标样式 */
  .custom-expand-icon {
    margin-right: 8px;
    cursor: pointer;
    color: #1890ff;
    display: inline-block;
    width: 16px;
    text-align: center;
  }
  
  .custom-expand-icon-empty {
    display: inline-block;
    width: 16px;
  }
  
  /* 树形层级连接线样式 */
  .tree-node-wrapper {
    display: flex;
    align-items: center;
  }
  
  .tree-indent-container {
    display: flex;
  }
  
  .tree-indent {
    width: 20px;
    height: 24px;
    position: relative;
  }
  
  .tree-indent-line::before {
    content: '';
    position: absolute;
    left: 9px;
    top: 0;
    bottom: 0;
    width: 1px;
    background-color: #e5e5e5;
  }
  
  .tree-indent-last::before {
    content: '';
    position: absolute;
    left: 9px;
    top: 0;
    height: 12px;
    width: 1px;
    background-color: #e5e5e5;
  }
  
  .tree-indent-last::after {
    content: '';
    position: absolute;
    left: 0;
    top: 11px;
    width: 9px;
    height: 1px;
    background-color: #e5e5e5;
  }
  
  .tree-indent-empty::after {
    content: '';
    position: absolute;
    left: 0;
    top: 11px;
    width: 9px;
    height: 1px;
    background-color: #e5e5e5;
  }
  
  .tree-node-text {
    display: inline-block;
  }
  </style>