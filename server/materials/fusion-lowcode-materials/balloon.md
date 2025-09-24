# 气泡框

## 基本信息

- **组件名称**: Balloon
- **组件标题**: 气泡框
- **组件分组**: 原子组件
- **组件分类**: 信息反馈
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Balloon

## 组件描述

气泡框组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| prefix | string | next- |  |
| pure | bool | false |  |
| rtl | bool | - |  |
| className | string | - | 自定义类名 |
| style | object | - | 自定义内敛样式 |
| type | oneOf: normal | primary | normal | 样式类型 |
| triggerType | oneOf: hover | click | hover | 触发行为
鼠标悬浮, 鼠标点击('hover','click')或者它们组成的数组，如 ['hover', 'click'], 强烈不建议使用'focus'，若弹窗内容有复杂交互请使用click |
| visible | bool | - | 弹层当前显示的状态 |
| onVisibleChange | func | - | 弹层在显示和隐藏触发的事件
@param {Boolean} visible 弹层是否隐藏和显示
@param {String} type 触发弹层显示或隐藏的来源， closeClick 表示由自带的关闭按钮触发； fromTrigger 表示由trigger的点击触发； docClick 表示由document的点击触发 |
| align | oneOf: t | r | b | l | tl | tr | bl | br | lt | lb | rt | rb | b | 弹出层位置
@enumdesc 上, 右, 下, 左, 上左, 上右, 下左, 下右, 左上, 左下, 右上, 右下 及其 两两组合 |
| offset | arrayOf | 0,0 | 弹层相对于trigger的定位的微调, 接收数组[hoz, ver], 表示弹层在 left / top 上的增量
e.g. [100, 100] 表示往右(RTL 模式下是往左) 、下分布偏移100px |
| popupContainer | any | - | 弹层容器
@param {Element} target 目标元素
@return {Element} 弹层的容器元素 |
| delay | number | - | 弹层在触发以后的延时显示, 单位毫秒 ms |
| trigger | node | - | 触发元素 |
| onClick | func | - |  |
| onClose | func | - | 任何visible为false时会触发的事件 |
| onHover | func | - |  |
| defaultVisible | bool | false | 弹层默认显示的状态 |
| alignEdge | bool | false | 弹出层对齐方式, 是否为边缘对齐 |
| closable | bool | true | 是否显示关闭按钮 |
| needAdjust | bool | false | 是否进行自动位置调整 |
| afterClose | func | - | 浮层关闭后触发的事件, 如果有动画，则在动画结束后触发 |
| shouldUpdatePosition | bool | - | 强制更新定位信息 |
| autoFocus | bool | true | 弹层出现后是否自动focus到内部第一个元素 |
| followTrigger | bool | - | 是否跟随滚动 |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| prefix |  | - |  |
| rtl |  | - |  |
| pure |  | - |  |
| visible |  | - |  |
| offset |  | - |  |
| shouldUpdatePosition |  | - |  |
| popupContainer | 弹层容器 | MixedSetter |  |



## 容器配置

- ✅ 可作为容器组件

## 使用示例

该组件提供了预设的代码片段，可以快速插入到页面中使用。

