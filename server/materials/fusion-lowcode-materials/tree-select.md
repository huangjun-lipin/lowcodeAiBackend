# 树型选择控件

## 基本信息

- **组件名称**: TreeSelect
- **组件标题**: 树型选择控件
- **组件分组**: 原子组件
- **组件分类**: 信息输入
- **NPM包**: @alilc/lowcode-materials
- **导出名**: TreeSelect

## 组件描述

树型选择控件组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| className | string | - |  |
| dataSource | Json | - | 数据源 |
| size | oneOf: small | medium | large | medium | 选择框大小 |
| placeholder | string | - | 选择框占位符 |
| label | instanceOf | - | 自定义内联label |
| notFoundContent | instanceOf | Not Found | 无数据时显示内容 |
| disabled | bool | false | 是否禁用 |
| hasArrow | bool | true | 是否有下拉箭头 |
| hasBorder | bool | true | 是否有边框 |
| hasClear | bool | false | 是否有清空按钮 |
| readOnly | bool | - | 是否只读 |
| autoWidth | bool | true | 下拉框是否与选择器对齐 |
| onChange | func | - | 选中值改变时触发的回调函数
@param {String|Array} value 选中的值，单选时返回单个值，多选时返回数组
@param {Object|Array} data 选中的数据，包括 value, label, pos, key属性，单选时返回单个值，多选时返回数组，父子节点选中关联时，同时选中，只返回父节点 |
| showSearch | bool | false | 搜索框 |
| onSearch | func | - | 在搜索框中输入时触发的回调函数
@param {String} keyword 输入的关键字 |
| onSearchClear | func | - |  |
| multiple | bool | false | 支持多选 |
| treeCheckable | bool | false | 下拉框中的树是否支持勾选节点的复选框 |
| treeCheckStrictly | bool | false | 下拉框中的树勾选节点复选框是否完全受控（父子节点选中状态不再关联） |
| treeCheckedStrategy | oneOf: all | parent | child | parent | 定义选中时回填的方式
@enumdesc 返回所有选中的节点, 父子节点都选中时只返回父节点, 父子节点都选中时只返回子节点 |
| treeDefaultExpandAll | bool | false | 下拉框中的树是否默认展开所有节点 |
| treeLoadData | func | - | 下拉框中的树异步加载数据的函数，使用请参考[Tree的异步加载数据Demo](https://fusion.design/component/tree)
@param {ReactElement} node 被点击展开的节点 |
| treeProps | Json | - | 透传到 Tree 的属性对象 |
| defaultVisible | bool | false | 初始下拉框是否显示 |
| visible | bool | - | 当前下拉框是否显示 |
| onVisibleChange | func | - | 下拉框显示或关闭时触发事件的回调函数
@param {Boolean} visible 是否显示
@param {String} type 触发显示关闭的操作类型 |
| popupStyle | object | - | 下拉框自定义样式对象 |
| popupClassName | string | - | 下拉框样式自定义类名 |
| popupContainer | any | - | 下拉框挂载的容器节点 |
| popupProps | object | - | 透传到 Popup 的属性对象 |
| followTrigger | bool | - | 是否跟随滚动 |
| isPreview | bool | - | 预览态 |
| renderPreview | func | - | 预览态模式下渲染的内容
@param {Array<data>} value 选择值 { label: , value:} |
| useVirtual | bool | - | 是否开启虚拟滚动 |
| style | object | - |  |
|  | any | - | 高级 |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| visible |  | - |  |
| autoWidth |  | - |  |
| useVirtual |  | - |  |
| renderPreview |  | - |  |
| followTrigger |  | - |  |
| popupStyle |  | - |  |
| popupClassName |  | - |  |
| popupContainer |  | - |  |
| popupProps |  | - |  |
| treeCheckable |  | - |  |
| treeCheckStrictly |  | - |  |
| treeCheckedStrategy |  | - |  |
| treeDefaultExpandAll |  | - |  |
| treeLoadData |  | - |  |
| treeProps |  | - |  |
| label | 内联文案 | StringSetter |  |
| dataSource | 节点数据 | JsonSetter |  |




## 核心方法

| 方法名 | 类型 | 说明 |
|--------|------|------|
| createDataSource | function | - |

## 使用示例

该组件提供了预设的代码片段，可以快速插入到页面中使用。

