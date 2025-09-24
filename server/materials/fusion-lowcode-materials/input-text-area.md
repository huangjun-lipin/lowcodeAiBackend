# 多行文本框

## 基本信息

- **组件名称**: Input.TextArea
- **组件标题**: 多行文本框
- **组件分组**: 原子组件
- **组件分类**: 基础
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Input

## 组件描述

多行文本框组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| hasBorder | bool | true | 是否有边框 |
| state | oneOf: error | warning | - | 状态
@enumdesc 错误 |
| autoHeight | bool | false | 自动高度 true / {minRows: 2, maxRows: 4} |
| rows | number | 4 | 多行文本框高度 <br />(不要直接用height设置多行文本框的高度, ie9 10会有兼容性问题) |
| isPreview | bool | false | 是否为预览态 |
| style | object | - |  |
| onClear | func | - |  |
| onChange | func | - |  |
| onKeyDown | func | - |  |
| onFocus | func | - |  |
| onBlur | func | - |  |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| rows | 行数 | NumberSetter |  |
| maxLength | 最大长度 | NumberSetter | 最大长度 |
| placeholder | 输入提示 | StringSetter |  |
| state | 状态 | RadioGroupSetter |  |
| autoHeight | 自动高度 | BoolSetter |  |
| isPreview | 预览态 | BoolSetter |  |
| disabled | 是否禁用 | BoolSetter | 是否禁用 |
| hasLimitHint | 展示限制 | BoolSetter | 是否展现最大长度样式 |
| cutString | 是否截断 | BoolSetter | 是否截断超出字符串 |
| readOnly | 是否只读 | BoolSetter | 是否只读 |
| trim | 是否 Trim | BoolSetter |  |
| hasBorder | 显示边框 | BoolSetter |  |
| autoFocus | 自动聚焦 | BoolSetter | 自动聚焦 |
| **高级** | 分组 | - | 属性分组 |
| id | 唯一标识 | StringSetter |  |
| name | 表单标识 | StringSetter |  |


## 支持的功能

- ✅ 样式配置
- ✅ 事件配置

### 支持的事件

| 事件名 | 描述 |
|--------|------|
| onPressEnter | onPressEnter 事件 |
| onClear | onClear 事件 |
| onChange | onChange 事件 |
| onKeyDown | onKeyDown 事件 |
| onFocus | onFocus 事件 |
| onBlur | onBlur 事件 |

