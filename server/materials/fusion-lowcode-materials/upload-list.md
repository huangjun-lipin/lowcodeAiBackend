# Upload.List

## 基本信息

- **组件名称**: Upload.List
- **组件标题**: Upload.List
- **组件分组**: 原子组件
- **组件分类**: 基础
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Upload

## 组件描述

Upload.List组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| prefix | string | next- |  |
| locale | object | - | 多语言 |
| listType | oneOf: text | image | card | text | 文件列表，数据格式请参考 文件对象 |
| value | instanceOf |  | 文件列表 |
| closable | bool | false |  |
| onRemove | func | - | 删除文件回调(支持Promise) |
| onCancel | func | - | 取消上传回调(支持Promise) |
| onImageError | func | - | 头像加载出错回调 |
| onPreview | func | - | listType=card时点击图片回调 |
| extraRender | func | - | 自定义额外渲染 |
| progressProps | object | - | 透传给Progress props |
| children | node | - |  |
| uploader | any | - |  |
| useDataURL | bool | - | 可选参数，是否本地预览 |
| rtl | bool | - |  |
| isPreview | bool | - |  |
| style | object | - |  |


