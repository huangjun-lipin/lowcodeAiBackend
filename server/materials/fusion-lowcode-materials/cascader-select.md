# 级联选择器

## 基本信息

- **组件名称**: CascaderSelect
- **组件标题**: 级联选择器
- **组件分组**: 原子组件
- **组件分类**: 信息输入
- **NPM包**: @alilc/lowcode-materials
- **导出名**: CascaderSelect

## 组件描述

级联选择器组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| prefix | string | next- |  |
| label | string | - | 自定义内联 label |
| className | string | - |  |
| size | oneOf: small | medium | large | medium | 大小 |
| placeholder | string | - | 占位符 |
| dataSource | arrayOf | - |  |
| disabled | bool | false | 是否禁用 |
| hasArrow | bool | true | 下拉箭头 |
| hasBorder | bool | true | 边框 |
| hasClear | bool | false | 清除按钮 |
| notFoundContent | oneOfType: node | string | Not Found | 无数据时显示内容 |
| loadData | func | - | 异步加载数据函数
@param {Object} data 当前点击异步加载的数据 |
| header | node | - | 自定义下拉框头部 |
| footer | node | - | 自定义下拉框底部 |
| defaultVisible | bool | false | 初始下拉框是否显示 |
| visible | bool | - | 当前下拉框是否显示 |
| readOnly | bool | - | 是否只读 |
| onChange | func | - | 选中值改变时触发的回调函数
@param {String|Array} value 选中的值，单选时返回单个值，多选时返回数组
@param {Object|Array} data 选中的数据，包括 value 和 label，单选时返回单个值，多选时返回数组，父子节点选中关联时，同时选中，只返回父节点
@param {Object} extra 额外参数
@param {Array} extra.selectedPath 单选时选中的数据的路径
@param {Boolean} extra.checked 多选时当前的操作是选中还是取消选中
@param {Object} extra.currentData 多选时当前操作的数据
@param {Array} extra.checkedData 多选时所有被选中的数据
@param {Array} extra.indeterminateData 多选时半选的数据 |
| expandTriggerType | oneOf: click | hover | click | 展开触发方式 |
| onExpand | func | - |  |
| useVirtual | bool | false | 虚拟滚动 |
| multiple | bool | false | 是否多选 |
| changeOnSelect | bool | false | 是否选中即发生改变, 该属性仅在单选模式下有效 |
| canOnlyCheckLeaf | bool | false | 是否只能勾选叶子项的checkbox，该属性仅在多选模式下有效 |
| checkStrictly | bool | false | 父子节点是否选中不关联 |
| listStyle | object | - | 每列列表样式对象 |
| resultAutoWidth | bool | true | 搜索结果列表是否和选择框等宽 |
| showSearch | bool | false | 搜索框 |
| filter | func | - | 自定义搜索函数
@param {String} searchValue 搜索的关键字
@param {Array} path 节点路径
@return {Boolean} 是否匹配
@default 根据路径所有节点的文本值模糊匹配 |
| onVisibleChange | func | - | 下拉框显示或关闭时触发事件的回调函数
@param {Boolean} visible 是否显示
@param {String} type 触发显示关闭的操作类型, fromTrigger 表示由trigger的点击触发； docClick 表示由document的点击触发 |
| popupStyle | object | - | 下拉框自定义样式对象 |
| popupProps | object | - | 透传到 Popup 的属性对象 |
| followTrigger | bool | - | 是否跟随滚动 |
| isPreview | bool | - | 是否为预览态 |
| style | object | - |  |
| popupContainer | any | - | 弹层容器
@param {Element} target 目标元素
@return {Element} 弹层的容器元素 |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| label | 内联文案 | StringSetter |  |
| size | 尺寸 | RadioGroupSetter |  |
| placeholder | 占位提示 | StringSetter |  |
| dataSource | 级联数据 | JsonSetter |  |
| disabled | 是否禁用 | BoolSetter |  |
| hasArrow | 下拉箭头 | BoolSetter |  |
| hasBorder | 边框 | BoolSetter |  |
| hasClear | 清除按钮 | BoolSetter |  |
| readOnly | 是否只读 | BoolSetter |  |
| multiple | 是否多选 | BoolSetter |  |
| showSearch | 搜索框 | BoolSetter |  |
| followTrigger | 跟随滚动 | BoolSetter | 是否跟随滚动 |
| isPreview | 预览态 | BoolSetter | 是否为预览态 |
| expandTriggerType | 展开触发方式 | RadioGroupSetter |  |
| notFoundContent | 无数据时显示内容 | MixedSetter |  |
| **高级** | 分组 | - | 属性分组 |
| id | 唯一标识 | StringSetter |  |
| name | 表单标识 | StringSetter |  |


## 支持的功能

- ✅ 样式配置
- ✅ 事件配置

### 支持的事件

| 事件名 | 描述 |
|--------|------|
| onChange | onChange 事件 |
| onExpand | onExpand 事件 |
| onVisibleChange | onVisibleChange 事件 |



## 核心方法

| 方法名 | 类型 | 说明 |
|--------|------|------|
| createDataSource | function | - |

## 使用示例

该组件提供了预设的代码片段，可以快速插入到页面中使用。

