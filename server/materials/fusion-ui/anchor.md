# 电梯容器

## 基本信息

- **组件名称**: Anchor
- **组件标题**: 电梯容器
- **组件分类**: 布局容器类
- **组件分组**: 精选组件
- **NPM包**: @alifd/fusion-ui
- **版本**: 1.0.24-5
- **导出名称**: Anchor

## 组件描述

电梯容器是一个布局容器类组件，属于精选组件。

## 属性配置

### 主要属性

#### dataSource
- **描述**: 电梯容器
- **类型**: 根据配置确定

#### htmlId
- **描述**: htmlId
- **类型**: 根据配置确定

#### label
- **描述**: label
- **类型**: 根据配置确定

#### children
- **描述**: children
- **类型**: 根据配置确定

#### container
- **描述**: container
- **类型**: 根据配置确定

#### direction
- **描述**: direction
- **类型**: 根据配置确定

#### hasAffix
- **描述**: hasAffix
- **类型**: 根据配置确定

#### affixProps
- **描述**: affixProps
- **类型**: 根据配置确定

#### container
- **描述**: container
- **类型**: 根据配置确定

#### offsetTop
- **描述**: offsetTop
- **类型**: 根据配置确定




## 核心接口定义

### AnchorLinkProps

```typescript
interface AnchorLinkProps {
  isFocus: boolean;
  label: string;
  htmlId: string;
  level: number;
  onSelect: (htmlId: string) => void;
}
```

### AnchorListProps

```typescript
interface AnchorListProps {
  value: string;
  dataSource: LinkItemData[];
  onSelect: (htmlId) => void;
}
```

### AnchorTocState

```typescript
interface AnchorTocState {
  menuList: AnchorLinkProps[];
}
```

### LinkItemData

```typescript
interface LinkItemData {
  htmlId: string;
  label: string;
  children?: LinkItemData[];
}
```

### AnchorProps

继承自: Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>

```typescript
interface AnchorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  className?: string;
  style?: React.CSSProperties;
  direction?: 'ver' | 'hoz';
  dataSource: LinkItemData[];
  isWhalePageAnchor?: boolean;
  container?: () => React.ReactElement<any, string | React.JSXElementConstructor<any>> | Element;
  hasAffix?: boolean;
}
```


## 属性配置

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| isFocus | boolean | 是 | - | - |
| label | string | 是 | - | - |
| htmlId | string | 是 | - | - |
| level | number | 是 | - | - |
| onSelect | (htmlId: string) => void | 是 | - | - |
| value | string | 是 | - | - |
| dataSource | LinkItemData[] | 是 | - | - |
| className | string | 否 | - | - |
| style | React.CSSProperties | 否 | - | - |
| direction | 'ver' \| 'hoz' | 否 | - | - |
| isWhalePageAnchor | boolean | 否 | - | - |
| container | () => React.ReactElement<any, string \| React.JSXElementConstructor<any>> \| Element | 否 | - | - |
| hasAffix | boolean | 否 | - | - |


## 核心方法

| 方法名 | 类型 | 说明 |
|--------|------|------|
| anchorEl | function | - |
| renderMenu | function | - |
| getScrollElement | function | - |
| elementCanScroll | function | - |
| startListen | function | - |
| setEventHandlerForContainer | function | - |
| removeListen | function | - |
| removeEventHandlerForContainer | function | - |
| getScroll | function | - |
| predicateItem | function | - |
| jumpToNode | function | - |


## 事件回调

| 事件名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| onChange | event | - | Change 事件处理函数 |
| onSelect | event | - | Select 事件处理函数 |
| ontainer | event | - | tainer 事件处理函数 |

## 使用示例

暂无使用示例

## 注意事项

1. 请确保正确引入组件依赖
2. 注意组件的属性类型和默认值
3. 根据实际业务需求配置相关属性

---
*此文档由脚本自动生成，基于组件meta配置文件*
