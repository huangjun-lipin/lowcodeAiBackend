# 视频

## 基本信息

- **组件名称**: Video
- **组件标题**: 视频
- **组件分组**: 原子组件
- **组件分类**: 信息展示
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Video

## 组件描述

视频组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| src | string | https://fusion.alicdn.com/fusion-site-2.0/fusion.mp4 | [object Object] |
| autoPlay | bool | - | [object Object] |
| loop | bool | - | [object Object] |
| muted | bool | - | [object Object] |
| controls | bool | - | [object Object] |
| poster | string | - | [object Object] |
| style | object | - |  |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| autoPlay | 自动播放 | BoolSetter |  |
| muted | 静音 | BoolSetter |  |




## 事件回调

| 事件名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| ondition | event | - | dition 事件处理函数 |


## 核心接口定义

### Props

```typescript
interface Props {
  src?: string;
  autoPlay?: boolean; // 自动播放必须设置 muted=true
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  poster?: string;
  style?: object;
}
```


## 属性配置

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| src | string | 否 | - | - |
| autoPlay | boolean | 否 | - | 自动播放必须设置 muted=true |
| loop | boolean | 否 | - | - |
| muted | boolean | 否 | - | - |
| controls | boolean | 否 | - | - |
| poster | string | 否 | - | - |
| style | object | 否 | - | - |

## 使用示例

该组件提供了预设的代码片段，可以快速插入到页面中使用。

