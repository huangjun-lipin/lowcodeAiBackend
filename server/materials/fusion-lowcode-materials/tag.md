# 标签

## 基本信息

- **组件名称**: Tag
- **组件标题**: 标签
- **组件分组**: 原子组件
- **组件分类**: 信息展示
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Tag

## 组件描述

标签组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| type | oneOf: normal | primary | - | 标签的类型 |
| size | oneOf: small | medium | large | - | 标签的尺寸（large 尺寸为兼容表单场景 large = medium） |
| color | string | - | 标签颜色, 目前支持：blue、 green、 orange、red、 turquoise、 yellow 和 hex 颜色值 （`color keywords`作为 Tag 组件的保留字，请勿直接使用 ）, `1.19.0` 以上版本生效 |
| animation | bool | - | 是否开启动效 |
| afterAppear | func | - | 标签出现动画结束后执行的回调 |
| onClick | func | - | 点击回调 |
| children | string | - | 内容 |
| style | object | - |  |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| color | 标签颜色 | ColorSetter |  |



## 使用示例

该组件提供了预设的代码片段，可以快速插入到页面中使用。

