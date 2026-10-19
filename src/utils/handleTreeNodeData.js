 // 封装的树形数据操作方法
function treeDataOperator(treeData, targetSerial, operation, newNodeData = null) {
     // 深拷贝数据，避免修改原数据
     const data = JSON.parse(JSON.stringify(treeData));

     /**
      * 查找节点路径
      */
     function findNodePath(nodes, itemNumber, path = []) {
         for (let i = 0; i < nodes.length; i++) {
             const node = nodes[i];
             if (node.itemNumber === itemNumber) {
                 return [...path, i];
             }
             if (node.children && node.children.length > 0) {
                 const childPath = findNodePath(node.children, itemNumber, [...path, i, 'children']);
                 if (childPath) return childPath;
             }
         }
         return null;
     }

     /**
      * 根据路径获取节点和父节点数组
      */
     function getNodeAndParentArrayByPath(path) {
        let parentNode = null;
         let current = data;
         let parentArray = data;
         let index = path[path.length - 1];

         // 遍历路径找到目标节点和父数组
         for (let i = 0; i < path.length - 1; i++) {
             if (path[i] === 'children') {
                 // 当前节点有children，继续深入
                 parentNode = current;
                 parentArray = current.children;
                 current = current.children[path[i + 1]];
                 i++; // 跳过下一个索引
             } else {
                 current = current[path[i]];
             }
         }

         return {
             node: current,
             parentArray,
             index,
             parentNode
         };
     }

     const path = findNodePath(data, targetSerial);
     console.log(path, 'path');
     if (!path) {
         throw new Error(`未找到itemNumber为${targetSerial}的节点`);
     }

     const {
         node,
         parentArray,
         index,
         parentNode
     } = getNodeAndParentArrayByPath(path);
     const createNewSerial = (path) => {
         let str = '';
         if (path.length) {
             for (let i = 0; i < path.length; i++) {
                 const element = path[i];
                 if (element === 'children') {
                     str += '.'
                 } else {
                     str += Number(element) + 1
                 }
             }
             return str;
         } else {
             return '';
         }
     }
     switch (operation) {
         case 'addSibling':
             if (!newNodeData) {
                 throw new Error('添加同级节点需要提供新节点数据');
             }
             parentArray.splice(index + 1, 0, {
                 ...newNodeData,
                 itemNumber: createNewSerial(path)
             });
             break;

         case 'addChild':
             if (!newNodeData) {
                 throw new Error('添加子节点需要提供新节点数据');
             }
             if (Array.isArray(node)) {
                 // 针对第一级节点添加子节点
                 if (!data[index].children) {
                     data[index].children = [];
                 }
                 data[index].children.push({
                     ...newNodeData,
                     itemNumber: createNewSerial(path)
                 });
             } else {
                 if (!node.children) {
                     node.children = [];
                 }
                 node.children.push({
                     ...newNodeData,
                     itemNumber: createNewSerial(path)
                 });
             }
             break;

         case 'moveUp':
             if (index > 0) {
                 [parentArray[index - 1], parentArray[index]] = [parentArray[index], parentArray[index - 1]];
             }
             break;

         case 'moveDown':
             if (index < parentArray.length - 1) {
                 [parentArray[index], parentArray[index + 1]] = [parentArray[index + 1], parentArray[index]];
             }
             break;

         case 'delete':
            console.log(path, 'path');
             console.log(node, 'node');
             console.log(parentArray, 'parentArray');
             console.log(index, 'index');
             console.log(parentNode, 'parentNode');
             parentArray.splice(index, 1);
             if (parentArray.length === 0) {
                if (parentNode) {
                    delete parentNode.children;
                }
                console.log("代表子集已经被删干净了，需要node节点的父级里面的children属性进行删除")
             }
             break;

         default:
             throw new Error(`不支持的操作类型: ${operation}`);
     }

     return data;
}

 export {
     treeDataOperator
 }