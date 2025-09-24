# 树形控件节点

## 基本信息

- **组件名称**: TreeNode
- **组件标题**: 树形控件节点
- **组件分组**: 原子组件
- **组件分类**: 信息输入
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Tree

## 组件描述

树形控件节点组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| className | string | - |  |
| children | instanceOf | - | 树节点 |
| label | oneOfType: string | node | --- | 节点文本内容 |
| selectable | bool | - | 单独设置是否支持选中，覆盖 Tree 的 selectable |
| checkable | bool | - | 单独设置是否出现复选框，覆盖 Tree 的 checkable |
| editable | bool | - | 单独设置是否支持编辑，覆盖 Tree 的 editable |
| draggable | bool | - | 单独设置是否支持拖拽，覆盖 Tree 的 draggable |
| disabled | bool | false | 是否禁止节点响应 |
| checkboxDisabled | bool | false | 是否禁止勾选节点复选框 |
| isLeaf | bool | false | 是否是叶子节点 |


