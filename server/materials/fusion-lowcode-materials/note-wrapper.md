# 备注容器

## 基本信息

- **组件名称**: Wrapper
- **组件标题**: 备注容器
- **组件分组**: 原子组件
- **组件分类**: Others
- **NPM包**: @alilc/lowcode-materials
- **导出名**: NoteWrapper

## 组件描述

备注容器组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| style | object | - |  |
| note | string | 这是一个备注 |  |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| style |  | StyleSetter |  |
| note |  | StringSetter |  |



## 容器配置

- ✅ 可作为容器组件

## 核心接口定义

### NoteProps

```typescript
interface NoteProps {
  note?: string;
  id?: string;
}
```


## 属性配置

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| note | string | 否 | - | - |
| id | string | 否 | - | - |


## 核心方法

| 方法名 | 类型 | 说明 |
|--------|------|------|
| getStyle | function | 获取DOM真实style的方法 |
| node | function | - |

