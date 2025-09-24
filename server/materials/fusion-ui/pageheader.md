# 页头

## 基本信息

- **组件名称**: PageHeader
- **组件标题**: 页头
- **组件分类**: 布局容器类
- **组件分组**: 精选组件
- **NPM包**: @alifd/fusion-ui
- **版本**: 1.0.0
- **导出名称**: PageHeader

## 组件描述

页头是一个布局容器类组件，属于精选组件。

## 属性配置

### 主要属性

#### backIcon
- **描述**: 页头
- **类型**: 根据配置确定

#### prefixCls
- **描述**: 页头
- **类型**: 根据配置确定

#### title
- **描述**: 页头
- **类型**: 根据配置确定

#### subTitle
- **描述**: This is a designer title
- **类型**: 根据配置确定

#### style
- **描述**: style
- **类型**: 根据配置确定

#### breadcrumb
- **描述**: breadcrumb
- **类型**: 根据配置确定

#### breadcrumbRender
- **描述**: breadcrumbRender
- **类型**: 根据配置确定

#### props
- **描述**: props
- **类型**: 根据配置确定

#### backIcon
- **描述**: backIcon
- **类型**: 根据配置确定

#### prefixCls
- **描述**: prefixCls
- **类型**: 根据配置确定




## 核心接口定义

### PageHeaderProps

```typescript
interface PageHeaderProps {
  backIcon?: string | React.ReactNode;
  prefixCls?: string;
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  style?: React.CSSProperties;
  showBreadcrumb?: boolean;
  breadcrumb?: any[] | React.ReactElement<typeof Breadcrumb>;
  breadcrumbRender?: (props: PageHeaderProps, defaultDom: React.ReactNode) => React.ReactNode;
  tags?: React.ReactElement | React.ReactElement[];
  footer?: React.ReactNode;
  extra?: React.ReactNode;
  showAvatar?: boolean;
  showActions?: boolean;
  avatar?: object;
  onBack?: (e?: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
  ghost?: boolean;
  direction?: string;
  pageHeader?: any;
  operations?: any[];
  operationConfig?: Record<string, any>;
}
```


## 属性配置

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| backIcon | string \| React.ReactNode | 否 | - | - |
| prefixCls | string | 否 | - | - |
| title | React.ReactNode | 否 | - | - |
| subTitle | React.ReactNode | 否 | - | - |
| style | React.CSSProperties | 否 | - | - |
| showBreadcrumb | boolean | 否 | - | - |
| breadcrumb | any[] \| React.ReactElement<typeof Breadcrumb> | 否 | - | - |
| breadcrumbRender | (props: PageHeaderProps, defaultDom: React.ReactNode) => React.ReactNode | 否 | - | - |
| tags | React.ReactElement \| React.ReactElement[] | 否 | - | - |
| footer | React.ReactNode | 否 | - | - |
| extra | React.ReactNode | 否 | - | - |
| showAvatar | boolean | 否 | - | - |
| showActions | boolean | 否 | - | - |
| avatar | object | 否 | - | - |
| onBack | (e?: React.MouseEvent<HTMLDivElement>) => void | 否 | - | - |
| className | string | 否 | - | - |
| ghost | boolean | 否 | - | - |
| direction | string | 否 | - | - |
| pageHeader | any | 否 | - | - |
| operations | any[] | 否 | - | - |
| operationConfig | Record<string, any> | 否 | - | - |


## 核心方法

| 方法名 | 类型 | 说明 |
|--------|------|------|
| renderBack | function | - |
| renderBreadcrumb | function | - |
| getBackIcon | function | - |
| renderOperations | function | - |
| renderTitle | function | - |
| renderFooter | function | - |
| renderChildren | function | - |
| onResize | function | - |
| getDefaultBreadcrumbDom | function | - |


## 事件回调

| 事件名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| ons | event | - | s 事件处理函数 |
| onResize | event | - | Resize 事件处理函数 |
| onBack | callback | e?: React.MouseEvent<HTMLDivElement> | onBack 回调函数 |

## 使用示例

暂无使用示例

## 注意事项

1. 请确保正确引入组件依赖
2. 注意组件的属性类型和默认值
3. 根据实际业务需求配置相关属性

---
*此文档由脚本自动生成，基于组件meta配置文件*
