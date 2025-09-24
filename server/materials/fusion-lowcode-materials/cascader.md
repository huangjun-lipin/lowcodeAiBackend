# 级联

## 基本信息

- **组件名称**: Cascader
- **组件标题**: 级联
- **组件分组**: 原子组件
- **组件分类**: 信息输入
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Cascader

## 组件描述

级联组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| prefix | string | next- |  |
| rtl | bool | false |  |
| className | string | - |  |
| onChange | func | - | 选中值改变时触发的回调函数
@param {String|Array} value 选中的值，单选时返回单个值，多选时返回数组
@param {Object|Array} data 选中的数据，包括 value 和 label，单选时返回单个值，多选时返回数组，父子节点选中关联时，同时选中，只返回父节点
@param {Object} extra 额外参数
@param {Array} extra.selectedPath 单选时选中的数据的路径
@param {Boolean} extra.checked 多选时当前的操作是选中还是取消选中
@param {Object} extra.currentData 多选时当前操作的数据
@param {Array} extra.checkedData 多选时所有被选中的数据
@param {Array} extra.indeterminateData 多选时半选的数据 |
| onSelect | func | - |  |
| dataSource | array | - |  |
| expandTriggerType | oneOf: click | hover | click | 展开触发的方式 |
| onExpand | func | - | 展开时触发的回调函数
@param {Array} expandedValue 各列展开值的数组 |
| useVirtual | bool | false | 是否开启虚拟滚动 |
| multiple | bool | false | 是否多选 |
| canOnlySelectLeaf | bool | false | 单选时是否只能选中叶子节点 |
| canOnlyCheckLeaf | bool | false | 多选时是否只能选中叶子节点 |
| checkStrictly | bool | false | 父子节点是否选中不关联 |
| listStyle | object | - | 每列列表样式对象 |
| loadData | func | - | 异步加载数据函数
@param {Object} data 当前点击异步加载的数据
@param {Object} source 当前点击数据，source是原始对象 |
| onBlur | func | - |  |
| style | object | - |  |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| rtl |  | - |  |
| prefix |  | - |  |
| loadData |  | - |  |
| listStyle |  | ObjectSetter |  |
| dataSource | 级联数据 | JsonSetter |  |
| canOnlySelectLeaf | 单选时是否只能选中叶子节点 | BoolSetter |  |
| canOnlyCheckLeaf | 多选时是否只能选中叶子节点 | BoolSetter |  |
| checkStrictly | 父子节点是否选中不关联 | BoolSetter |  |


