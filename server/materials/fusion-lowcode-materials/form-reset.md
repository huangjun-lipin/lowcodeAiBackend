# 重置按钮

## 基本信息

- **组件名称**: Form.Reset
- **组件标题**: 重置按钮
- **组件分组**: 原子组件
- **组件分类**: 基础
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Form

## 组件描述

重置按钮组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| onClick | func | - | 点击提交后触发 |
| style | object | - |  |
| children | string | - | 内容 |
| icon | string | - | 自定义内联样式 |
| type | oneOf: primary | secondary | normal | normal | 按钮的类型 |
| size | oneOf: small | medium | large | medium | 按钮的尺寸 |
| iconSize | oneOf: xxs | xs | small | medium | large | xl | xxl | xxxl | small | 按钮中 Icon 的尺寸，用于替代 Icon 的默认大小 |
| ghost | oneOf: true | false | light | dark | false | 是否为幽灵按钮 |
| toDefault | bool | - | 返回默认值 |
| loading | bool | false | 设置按钮的载入状态 |
| text | bool | false | 是否为文本按钮 |
| warning | bool | false | 是否为警告按钮 |
| disabled | bool | false | 是否禁用 |
| className | string | - |  |
| onMouseUp | func | - |  |
| style | object | - | 自定义内联样式 |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| icon |  | IconSetter |  |
| children | 文本内容 | MixedSetter |  |


