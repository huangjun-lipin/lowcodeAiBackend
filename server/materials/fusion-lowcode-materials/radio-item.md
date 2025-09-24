# 单选菜单项

## 基本信息

- **组件名称**: RadioItem
- **组件标题**: 单选菜单项
- **组件分组**: 原子组件
- **组件分类**: 信息输入
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Menu

## 组件描述

单选菜单项组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| checked | bool | false | 是否选中 |
| disabled | bool | false | 是否禁用 |
| onChange | func | - | 选中或取消选中触发的回调函数
@param {Boolean} checked 是否选中
@param {Object} event 选中事件对象 |
| helper | node | - | 帮助文本 |
| style | object | - |  |



## 容器配置

- ✅ 可作为容器组件
- 嵌套规则: {"parentWhitelist":["Menu","SubMenu","Menu.Group","MenuButton"]}
