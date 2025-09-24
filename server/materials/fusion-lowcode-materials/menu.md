# 菜单

## 基本信息

- **组件名称**: Menu
- **组件标题**: 菜单
- **组件分组**: 原子组件
- **组件分类**: 信息输入
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Menu

## 组件描述

菜单组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| onItemClick | func | - | 点击菜单项触发的回调函数
@param {String} key 点击的菜单项的 key 值
@param {Object} item 点击的菜单项对象
@param {Object} event 点击的事件对象 |
| defaultOpenAll | bool | false | 初始展开所有的子菜单，只在 mode 设置为 'inline' 以及 openMode 设置为 'multiple' 下生效，优先级高于 defaultOpenKeys |
| onOpen | func | - | 打开或关闭子菜单触发的回调函数
@param {String} key 打开的所有子菜单的 key 值
@param {Object} extra 额外参数
@param {String} extra.key 当前操作子菜单的 key 值
@param {Boolean} extra.open 是否是打开 |
| mode | oneOf: inline | popup | inline | 子菜单打开的模式 |
| triggerType | oneOf: click | hover | click | 子菜单打开的触发行为 |
| openMode | oneOf: single | multiple | multiple | 展开内连子菜单的模式，同时可以展开一个子菜单还是多个子菜单，该属性仅在 mode 为 inline 时生效 |
| inlineIndent | number | 20 | 内连子菜单缩进距离 |
| inlineArrowDirection | oneOf: down | right | down |  |
| popupAutoWidth | bool | false | 是否自动让弹层的宽度和菜单项保持一致，如果弹层的宽度比菜单项小则和菜单项保持一致，如果宽度大于菜单项则不做处理 |
| popupAlign | oneOf: follow | outside | follow | 弹层的对齐方式 |
| popupClassName | string | - | 弹出子菜单自定义 className |
| onSelect | func | - | 选中或取消选中菜单项触发的回调函数
@param {Array} selectedKeys 选中的所有菜单项的值
@param {Object} item 选中或取消选中的菜单项
@param {Object} extra 额外参数
@param {Boolean} extra.select 是否是选中
@param {Array} extra.key 菜单项的 key
@param {Object} extra.label 菜单项的文本
@param {Array} extra.keyPath 菜单项 key 的路径 |
| selectMode | oneOf: single | multiple | - | 选中模式，单选还是多选，默认无值，不可选 |
| shallowSelect | bool | false | 是否只能选择第一层菜单项（不能选择子菜单中的菜单项） |
| hasSelectedIcon | bool | true | 是否显示选中图标，如果设置为 false 需配合配置平台设置选中时的背景色以示区分 |
| labelToggleChecked | bool | true |  |
| isSelectIconRight | bool | false | 是否将选中图标居右，仅当 hasSelectedIcon 为true 时生效。
注意：SubMenu 上的选中图标一直居左，不受此API控制 |
| direction | oneOf: ver | hoz | ver | 菜单第一层展示方向 |
| hozAlign | oneOf: left | right | left | 横向菜单条 item 和 footer 的对齐方向，在 direction 设置为 'hoz' 并且 header 存在时生效 |
| hozInLine | bool | false | 横向菜单模式下，是否维持在一行，即超出一行折叠成 SubMenu 显示， 仅在 direction='hoz' mode='popup' 时生效 |
| header | node | - | 自定义菜单头部 |
| footer | node | - | 自定义菜单尾部 |
| autoFocus | bool | false | 是否自动获得焦点 |
| focusedKey | string | - | 当前获得焦点的子菜单或菜单项 key 值 |
| focusable | bool | true |  |
| onItemFocus | func | - |  |
| onBlur | func | - |  |
| embeddable | bool | false | 是否开启嵌入式模式，一般用于Layout的布局中，开启后没有默认背景、外层border、box-shadow，可以配合`<Menu style={{lineHeight: '100px'}}>` 自定义高度 |
| onItemKeyDown | func | - |  |
| expandAnimation | bool | true |  |
| itemClassName | string | - |  |
| style | object | - |  |
| openKeys | oneOfType: string | [object Object] | - | 当前打开的子菜单的 key 值 |
| defaultOpenKeys | oneOfType: string | [object Object] |  | 初始打开的子菜单的 key 值 |
| selectedKeys | oneOfType: string | [object Object] | - | 当前选中菜单项的 key 值 |
| defaultSelectedKeys | oneOfType: string | [object Object] |  | 初始选中菜单项的 key 值 |



## 容器配置

- ✅ 可作为容器组件

## 核心方法

| 方法名 | 类型 | 说明 |
|--------|------|------|
| createDataSource | function | - |
| createMenuItem | function | - |
| createContents | function | - |
| getDataFromPlainText | function | - |
| _propsValue | function | - |


## 事件回调

| 事件名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| onItemClick | event | - | ItemClick 事件处理函数 |
| ontents | event | - | tents 事件处理函数 |
| ons | event | - | s 事件处理函数 |

