# 单选框

## 基本信息

- **组件名称**: Radio
- **组件标题**: 单选框
- **组件分组**: 原子组件
- **组件分类**: 信息输入
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Radio

## 组件描述

单选框组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| className | string | - | 自定义类名 |
| style | object | - | 自定义内敛样式 |
| id | string | - | input元素id |
| name | string | - | name |
| checked | bool | - | 是否选中 |
| defaultChecked | bool | - | 是否默认选中 |
| label | string | - | 通过属性配置label |
| disabled | bool | - | 是否被禁用 |
| value | oneOfType: string | number | bool | - | value |
| isPreview | bool | false | 是否为预览态 |
| renderPreview | func | - | 预览态模式下渲染的内容 |
| onChange | func | - | 状态变化时触发的事件
@param {Boolean} checked 是否选中
@param {Event} e Dom 事件对象 |
| onMouseEnter | func | - | 鼠标进入enter事件
@param {Event} e Dom 事件对象 |
| onMouseLeave | func | - | 鼠标离开事件
@param {Event} e Dom 事件对象 |



## 使用示例

该组件提供了预设的代码片段，可以快速插入到页面中使用。

