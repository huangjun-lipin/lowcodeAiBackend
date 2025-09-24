# 下拉菜单

## 基本信息

- **组件名称**: Dropdown
- **组件标题**: 下拉菜单
- **组件分组**: 原子组件
- **组件分类**: 信息输入
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Dropdown

## 组件描述

下拉菜单组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| id | string | - |  |
| prefix | string | next- |  |
| pure | bool | false |  |
| rtl | bool | - |  |
| className | string | - |  |
| visible | bool | - | 弹层当前是否显示 |
| defaultVisible | bool | false | 弹层默认是否显示 |
| onVisibleChange | func | - | 弹层显示或隐藏时触发的回调函数
@param {Boolean} visible 弹层是否显示
@param {String} type 触发弹层显示或隐藏的来源 fromContent 表示由Dropdown内容触发； fromTrigger 表示由trigger的点击触发； docClick 表示由document的点击触发 |
| triggerType | oneOfType: string | [object Object] | hover | 触发弹层显示或隐藏的操作类型，可以是 'click'，'hover'，或者它们组成的数组，如 ['hover', 'click'] |
| disabled | bool | false | 设置此属性，弹层无法显示或隐藏 |
| align | string | tl bl | 弹层相对于触发元素的定位, 详见 Overlay 的定位部分 |
| offset | instanceOf | 0,0 | 弹层相对于trigger的定位的微调, 接收数组[hoz, ver], 表示弹层在 left / top 上的增量
e.g. [100, 100] 表示往右(RTL 模式下是往左) 、下分布偏移100px |
| delay | number | 200 | 弹层显示或隐藏的延时时间（以毫秒为单位），在 triggerType 被设置为 hover 时生效 |
| autoFocus | bool | - | 弹层打开时是否让其中的元素自动获取焦点 |
| hasMask | bool | false | 是否显示遮罩 |
| cache | bool | false | 隐藏时是否保留子节点 |
| animation | oneOfType: object | bool | - | 配置动画的播放方式，支持 { in: 'enter-class', out: 'leave-class' } 的对象参数，如果设置为 false，则不播放动画
@default { in: 'expandInDown', out: 'expandOutUp' } |
| style | object | - |  |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| trigger | 触发元素 | SlotSetter |  |
| animation | animation | MixedSetter |  |



## 容器配置

- ✅ 可作为容器组件
