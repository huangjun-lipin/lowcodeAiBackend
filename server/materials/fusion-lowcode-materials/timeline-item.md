# 时间轴项

## 基本信息

- **组件名称**: Timeline.Item
- **组件标题**: 时间轴项
- **组件分组**: 原子组件
- **组件分类**: null
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Timeline

## 组件描述

时间轴项组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| state | oneOf: done | process | error | success | done | 节点状态 |
| icon | string | - | 图标 |
| dot | node | - | 自定义时间轴节点 |
| time | string | - | 格式化后的时间 |
| title | oneOfType: string | node | - | 标题 |
| timeLeft | string | - | 左侧时间 |
| content | oneOfType: string | node | - | 右侧内容 |
| animation | bool | true | 动画 |
| style | object | - |  |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| title | 标题 | StringSetter |  |
| icon | 图标 | IconSetter | 图标 |
| state | 节点状态 | RadioGroupSetter |  |
| time | 右侧时间 | DateSetter |  |
| timeLeft | 左侧时间 | DateSetter |  |
| content | 右侧内容 | TextAreaSetter |  |
| animation | 启用动画 | BoolSetter |  |



## 容器配置

- 嵌套规则: {"parentWhitelist":["Timeline"]}
