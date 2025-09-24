# 可关闭标签

## 基本信息

- **组件名称**: Tag.Closeable
- **组件标题**: 可关闭标签
- **组件分组**: 原子组件
- **组件分类**: 信息输入
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Tag

## 组件描述

可关闭标签组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| closeArea | oneOf: tag | tail | - | closeable 标签的 onClose 响应区域, tag: 标签体, tail(默认): 关闭按钮 |
| size | oneOf: small | medium | large | - | 标签的尺寸（large 尺寸为兼容表单场景 large = medium） |
| onClose | func | - | 点击关闭按钮时的回调，返回值 true 则关闭, false 阻止关闭 |
| onClick | func | - | 点击回调 |
| afterClose | func | - | 标签关闭后执行的回调 |
| children | string | - | 内容 |
| style | object | - |  |


