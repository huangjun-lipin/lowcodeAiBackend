# Upload.Selecter

## 基本信息

- **组件名称**: Upload.Selecter
- **组件标题**: Upload.Selecter
- **组件分组**: 原子组件
- **组件分类**: 基础
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Upload

## 组件描述

Upload.Selecter组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| id | string | - |  |
| style | object | - |  |
| className | string | - |  |
| disabled | bool | - | 是否禁用上传功能 |
| multiple | bool | false | 是否支持多选文件，`ie10+` 支持。开启后按住 ctrl 可选择多个文件 |
| dragable | bool | - | 是否支持拖拽上传，`ie10+` 支持。 |
| accept | string | - | 接受上传的文件类型 (image/png, image/jpg, .doc, .ppt) 详见 [input accept attribute](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/Input#attr-accept) |
| onSelect | func | - | 文件选择回调 |
| onDragOver | func | - | 拖拽经过回调 |
| onDragLeave | func | - | 拖拽离开回调 |
| onDrop | func | - | 拖拽完成回调 |
| children | instanceOf | - |  |
| name | string | file |  |


