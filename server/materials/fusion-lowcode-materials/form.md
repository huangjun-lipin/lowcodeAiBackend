# 表单容器

## 基本信息

- **组件名称**: Form
- **组件标题**: 表单容器
- **组件分组**: 原子组件
- **组件分类**: 信息输入
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Form

## 组件描述

表单容器组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| inline | bool | - | 内联表单 |
| size | oneOf: large | medium | small | medium | 单个 Item 的 size 自定义，优先级高于 Form 的 size, 并且当组件与 Item 一起使用时，组件自身设置 size 属性无效。
@enumdesc 大, 中, 小 |
| fullWidth | bool | - | 单个 Item 中表单类组件宽度是否是100% |
| labelAlign | oneOf: top | left | inset | left | 标签的位置
@enumdesc 上, 左, 内 |
| labelTextAlign | oneOf: left | right | - | 标签的左右对齐方式
@enumdesc 左, 右 |
| onSubmit | func | - | form内有 `htmlType="submit"` 的元素的时候会触发 |
| className | string | - | 扩展class |
| style | object | - | 自定义内联样式 |
| value | oneOfType: Json | JSExpression | - | 表单数值 |
| onChange | func | - | 表单变化回调
@param {Object} values 表单数据
@param {Object} item 详细
@param {String} item.name 变化的组件名
@param {String} item.value 变化的数据
@param {Object} item.field field 实例 |
| rtl | bool | - |  |
| device | oneOf: phone | tablet | desktop | desktop | 预设屏幕宽度 |
| responsive | bool | - | 是否开启内置的响应式布局 （使用ResponsiveGrid） |
| isPreview | bool | - | 是否开启预览态 |
| field | any | - | field 实例 |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| inline | 内联表单 | MixedSetter |  |
| fullWidth | 宽度占满 | BoolSetter |  |
| isPreview | 预览态 | BoolSetter | 是否开启预览态 |
| field | Field 实例 | ExpressionSetter |  |
| value | 表单值 | MixedSetter |  |
| size | 尺寸 | RadioGroupSetter | 单个 Item 的 size 自定义，优先级高于 Form 的 size, 并且当组件与 Item 一起使用时，组件自身设置 size 属性无效。
@enumdesc 大, 中, 小 |
| labelAlign | 标签位置 | RadioGroupSetter |  |
| labelTextAlign | 标签对齐 | RadioGroupSetter |  |
| device | 设备 | RadioGroupSetter |  |
| **布局** | 分组 | - | 属性分组 |
| labelCol |  | ObjectSetter | label 标签布局，通 `<Col>` 组件，设置 span offset 值，如 {span: 8, offset: 16}，该项仅在垂直表单有效 |
| wrapperCol |  | ObjectSetter | 需要为输入控件设置布局样式时，使用该属性，用法同 labelCol |


## 支持的功能

- ✅ 样式配置
- ✅ 事件配置

### 支持的事件

| 事件名 | 描述 |
|--------|------|
| saveField | saveField 事件 |
| onSubmit | onSubmit 事件 |
| onChange | onChange 事件 |


## 容器配置

- ✅ 可作为容器组件


## 事件回调

| 事件名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| onNodeAdd | event | - | NodeAdd 事件处理函数 |

## 使用示例

该组件提供了预设的代码片段，可以快速插入到页面中使用。

