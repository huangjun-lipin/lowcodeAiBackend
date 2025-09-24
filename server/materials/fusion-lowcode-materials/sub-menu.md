# 子菜单

## 基本信息

- **组件名称**: SubMenu
- **组件标题**: 子菜单
- **组件分组**: 原子组件
- **组件分类**: 信息输入
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Menu

## 组件描述

子菜单组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| key | string | - | 子菜单标识符 |
| label | node | - | 标签内容 |
| selectable | bool | false | 是否可选，该属性仅在设置 Menu 组件 selectMode 属性后生效 |
| mode | oneOf: inline | popup | - | 子菜单打开方式，如果设置会覆盖 Menu 上的同名属性
@default Menu 的 mode 属性值 |
| style | object | - |  |



## 容器配置

- ✅ 可作为容器组件
- 嵌套规则: {"parentWhitelist":["Menu","SubMenu","Menu.Group","MenuButton"]}
