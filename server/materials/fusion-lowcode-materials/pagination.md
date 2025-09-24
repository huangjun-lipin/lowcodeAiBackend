# 翻页器

## 基本信息

- **组件名称**: Pagination
- **组件标题**: 翻页器
- **组件分组**: 原子组件
- **组件分类**: 引导
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Pagination

## 组件描述

翻页器组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| rtl | bool | false |  |
| className | string | - |  |
| type | oneOf: normal | simple | mini | normal | 分页组件类型 |
| shape | oneOf: normal | arrow-only | arrow-prev-only | no-border | normal | 前进后退按钮样式 |
| size | oneOf: small | medium | large | medium | 分页组件大小 |
| current | number | - | （受控）当前页码 |
| defaultCurrent | number | 1 | （非受控）初始页码 |
| onChange | func | - | 页码发生改变时的回调函数
@param {Number} current 改变后的页码数
@param {Object} e 点击事件对象 |
| total | number | 100 | 总记录数 |
| totalRender | func | - | [object Object] |
| pageShowCount | number | 5 | [object Object] |
| pageSize | number | 10 | 一页中的记录数 |
| pageSizeSelector | oneOf: false | filter | dropdown | false | 每页显示选择器类型 |
| pageNumberRender | func | - | [object Object] |
| pageSizePosition | oneOf: start | end | start | 每页显示选择器在组件中的位置 |
| onPageSizeChange | func | - | 每页显示记录数量改变时的回调函数
@param {Number} pageSize 改变后的每页显示记录数 |
| hideOnlyOnePage | bool | false | [object Object] |
| showJump | bool | true | [object Object] |
| link | string | - | 设置页码按钮的跳转链接，它的值为一个包含 {page} 的模版字符串 |
| style | object | - |  |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| rtl |  | - |  |
| current | 当前页面 | MixedSetter |  |
| total | 总记录数 | MixedSetter |  |



## 使用示例

该组件提供了预设的代码片段，可以快速插入到页面中使用。

