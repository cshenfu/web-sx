const flattenTree = (treeData, childrenKey = 'children') => {
    const result = [];

    const traverse = (nodes) => {
        if (!Array.isArray(nodes) || nodes.length === 0) return;

        nodes.forEach(node => {
            // 将当前节点加入结果数组
            result.push({
                ...node
            });

            // 如果存在子节点，递归处理
            if (node[childrenKey] && Array.isArray(node[childrenKey])) {
                traverse(node[childrenKey]);
                // 可选：是否保留children属性，如不需要可删除
                delete result[result.length - 1][childrenKey];
            }
        });
    };

    traverse(treeData);
    return result;
};


const arrayToTree = (data, parentIdKey = 'parentId', childrenKey = 'children', rootParentId = null) => {
    // 创建id到节点的映射
    const nodeMap = new Map();
    data.forEach(node => {
        nodeMap.set(node.id, { ...node, [childrenKey]: [] });
    });
    
    // 构建树形结构
    const tree = [];
    nodeMap.forEach(node => {
        const parentId = node[parentIdKey];
        
        if (parentId === rootParentId || parentId === undefined) {
            // 根节点，直接添加到树中
            tree.push(node);
        } else {
            // 找到父节点，将当前节点添加到父节点的children中
            const parent = nodeMap.get(parentId);
            if (parent) {
                parent[childrenKey].push(node);
            } else {
                // 如果父节点不存在，将其作为根节点
                tree.push(node);
            }
        }
    });
    
    return tree;
}

export {
    flattenTree,
    arrayToTree
};