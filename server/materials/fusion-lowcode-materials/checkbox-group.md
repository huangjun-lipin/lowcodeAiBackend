# 复选按钮组

## 基本信息

- **组件名称**: CheckboxGroup
- **组件标题**: 复选按钮组
- **组件分组**: 原子组件
- **组件分类**: 信息输入
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Checkbox

## 组件描述

复选按钮组组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| prefix | string | next- |  |
| rtl | bool | - |  |
| className | string | - | 自定义类名 |
| style | object | - | 自定义内敛样式 |
| disabled | bool | - | 整体禁用 |
| value | oneOfType: [object Object] | string | number | - | 被选中的值列表 |
| defaultValue | oneOfType: [object Object] | string | number | - | 默认被选中的值列表 |
| onChange | func | - | 选中值改变时的事件
@param {Array} value 选中项列表
@param {Event} e Dom 事件对象 |
| itemDirection | oneOf: hoz | ver | hoz | 子项目的排列方式
- hoz: 水平排列 (default)
- ver: 垂直排列 |
| isPreview | bool | false | 是否为预览态 |
| renderPreview | func | - | 预览态模式下渲染的内容
@param {number} value 评分值 |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| disabled | 是否禁用 | MixedSetter |  |
| itemDirection | 排列方式 | RadioGroupSetter |  |
| isPreview | 预览态 | BoolSetter |  |
| defaultValue | 默认值 | MixedSetter |  |
| dataSource | 选项 | MixedSetter |  |
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

