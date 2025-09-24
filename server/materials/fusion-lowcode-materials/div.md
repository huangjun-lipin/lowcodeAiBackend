# Div

## 基本信息

- **组件名称**: Div
- **组件标题**: Div
- **组件分组**: 原子组件
- **组件分类**: 基础

## 组件描述

Div组件

## 属性配置

### 基础属性

暂无属性配置


## 核心接口定义

### DivProps

```typescript
interface DivProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent) => void;
  onMouseEnter?: (event: React.MouseEvent) => void;
  onMouseLeave?: (event: React.MouseEvent) => void;
}
```

## 属性配置

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| className | string | 否 | - | CSS 类名 |
| style | React.CSSProperties | 否 | - | 内联样式 |
| children | React.ReactNode | 否 | - | 子元素 |
| onClick | function | 否 | - | 点击事件处理函数 |
| onMouseEnter | function | 否 | - | 鼠标进入事件处理函数 |
| onMouseLeave | function | 否 | - | 鼠标离开事件处理函数 |

## 使用示例

```jsx
import { Div } from '@alilc/lowcode-materials';

function App() {
  return (
    <Div 
      className="container"
      style={{ padding: '20px', backgroundColor: '#f5f5f5' }}
      onClick={() => console.log('Div clicked')}
    >
      <h1>标题内容</h1>
      <p>这是一个 Div 容器组件的示例</p>
    </Div>
  );
}
```

### 作为布局容器

```jsx
<Div style={{ display: 'flex', justifyContent: 'space-between' }}>
  <Div style={{ flex: 1, marginRight: '10px' }}>
    左侧内容
  </Div>
  <Div style={{ flex: 1, marginLeft: '10px' }}>
    右侧内容
  </Div>
</Div>
```

## 容器配置

- ✅ 可作为容器组件
