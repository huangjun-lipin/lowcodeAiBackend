# 分隔按钮

## 基本信息

- **组件名称**: SplitButton
- **组件标题**: 分隔按钮
- **组件分组**: 原子组件
- **组件分类**: 常用
- **NPM包**: @alilc/lowcode-materials
- **导出名**: SplitButton

## 组件描述

分隔按钮组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| prefix | string | next- |  |
| style | object | - |  |
| label | instanceOf | - | 主按钮的文案 |
| type | oneOf: normal | primary | secondary | normal | 按钮的类型 |
| size | oneOf: small | medium | large | medium | 按钮组的尺寸 |
| component | oneOf: button | a | button | 设置标签类型 |
| ghost | oneOf: light | dark | false | true | - | 是否为幽灵按钮 |
| defaultSelectedKeys | instanceOf |  | 默认激活的菜单项（用法同 Menu 非受控） |
| selectedKeys | instanceOf | - | 激活的菜单项（用法同 Menu 受控） |
| selectMode | oneOf: single | multiple | single | 菜单的选择模式 |
| onSelect | func | - | 选择菜单项时的回调，参考 Menu |
| onItemClick | func | - | 点击菜单项时的回调，参考 Menu |
| triggerProps | object | - | 触发按钮的属性（支持 Button 的所有属性透传） |
| onVisibleChange | func | - | 弹层显示状态变化时的回调函数
@param {Boolean} visible 弹层显示状态
@param {String} type 触发弹层显示或隐藏的来源 menuSelect 表示由menu触发； fromTrigger 表示由trigger的点击触发； docClick 表示由document的点击触发 |
| popupTriggerType | oneOf: click | hover | click | 弹层的触发方式 |
| popupAlign | string | - | 弹层对齐方式, 详情见Overlay align |
| popupStyle | object | - | 弹层自定义样式 |
| popupClassName | string | - | 弹层自定义样式类 |
| popupProps | object | - | 透传给弹层的属性 |
| autoWidth | bool | true | 弹层菜单的宽度是否与按钮组一致 |
| visible | bool | - | 弹层是否显示 |
| defaultVisible | bool | true | 弹层默认是否显示 |
| followTrigger | bool | - | 是否跟随滚动 |
| menuProps | object | - | 透传给 Menu 的属性 |
| leftButtonProps | object | - | 透传给 左侧按钮 的属性 |
| className | string | - |  |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| !type |  | RadioGroupSetter |  |
| ghost | 形式 | RadioGroupSetter |  |
| type | 形式 | RadioGroupSetter |  |
| size | 尺寸 | RadioGroupSetter |  |
| plainData | 选项 | MagicEditorSetter |  |



## 容器配置

- ✅ 可作为容器组件

## 核心方法

| 方法名 | 类型 | 说明 |
|--------|------|------|
| createDataSource | function | - |
| createMenuItem | function | - |
| createContents | function | - |
| getButtonLabel | function | - |
| getDataFromPlainText | function | - |
| _propsValue | function | - |


## 事件回调

| 事件名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| ontents | event | - | tents 事件处理函数 |
| ons | event | - | s 事件处理函数 |

