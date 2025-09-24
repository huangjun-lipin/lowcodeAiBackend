# Tooltip

## 基本信息

- **组件名称**: Tooltip
- **组件标题**: Tooltip
- **组件分组**: 原子组件
- **组件分类**: 基础
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Balloon

## 组件描述

Tooltip组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| prefix | string | next- | 样式类名的品牌前缀 |
| className | string | - | 自定义类名 |
| style | object | - | 自定义内联样式 |
| children | node | - | tooltip的内容 |
| align | oneOf: t | r | b | l | tl | tr | bl | br | lt | lb | rt | rb | b | 弹出层位置
@enumdesc 上, 右, 下, 左, 上左, 上右, 下左, 下右, 左上, 左下, 右上, 右下 及其 两两组合 |
| trigger | node | - | 触发元素 |
| triggerType | oneOf: hover | click | hover | 触发行为
鼠标悬浮,  鼠标点击('hover', 'click')或者它们组成的数组，如 ['hover', 'click'], 强烈不建议使用'focus'，若有复杂交互，推荐使用triggerType为click的Balloon组件 |
| popupStyle | object | - | 弹层组件style，透传给Popup |
| popupClassName | string | - | 弹层组件className，透传给Popup |
| popupProps | object | - | 弹层组件属性，透传给Popup |
| pure | bool | - | 是否pure render |
| popupContainer | string | - | 指定浮层渲染的父节点, 可以为节点id的字符串，也可以返回节点的函数。 |
| followTrigger | bool | - | 是否跟随滚动 |
| id | string | - | 弹层id, 传入值才会支持无障碍 |
| delay | number | 0 | 如果需要让 Tooltip 内容可被点击，可以设置这个参数，例如 100 |


