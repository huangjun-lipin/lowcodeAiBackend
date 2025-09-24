# 密码框

## 基本信息

- **组件名称**: Input.Password
- **组件标题**: 密码框
- **组件分组**: 原子组件
- **组件分类**: 基础
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Input

## 组件描述

密码框组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| name | string | - |  |
| showToggle | bool | true | 是否展示切换按钮 |
| label | string | - | label |
| hasClear | bool | - | 是否出现清除按钮 |
| state | oneOf: error | loading | success | warning | - | 状态
@enumdesc 错误, 校验中, 成功, 警告 |
| size | oneOf: small | medium | large | medium | 尺寸
@enumdesc 小, 中, 大 |
| disabled | bool | - | 是否禁用 |
| maxLength | number | - | 最大长度 |
| hasLimitHint | bool | - | 是否展现最大长度样式 |
| cutString | bool | - | 是否截断超出字符串 |
| readOnly | bool | - | 是否只读 |
| trim | bool | - | onChange返回会自动去除头尾空字符 |
| placeholder | string | - | 输入提示 |
| hasBorder | bool | - | 是否有边框 |
| onPressEnter | func | - | 按下回车的回调 |
| onClear | func | - |  |
| onChange | func | - |  |
| onKeyDown | func | - |  |
| onFocus | func | - |  |
| onBlur | func | - |  |
| hint | string | - | 水印 (Icon的type类型，和hasClear占用一个地方) |
| innerBefore | string | - | 文字前附加内容 |
| innerAfter | string | - | 文字后附加内容 |
| addonBefore | string | - | 输入框前附加内容 |
| addonAfter | string | - | 输入框后附加内容 |
| addonTextBefore | string | - | 输入框前附加文字 |
| addonTextAfter | string | - | 输入框后附加文字 |
| autoFocus | bool | - | 自动聚焦 |
| style | object | - |  |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| label | 标签文本 | StringSetter | label |
| maxLength | 最大长度 | NumberSetter | 最大长度 |
| placeholder | 输入提示 | StringSetter |  |
| state | 状态 | RadioGroupSetter |  |
| size | 尺寸 | RadioGroupSetter |  |
| showToggle | 显示切换 | BoolSetter |  |
| hasClear | 显示清除 | BoolSetter | 是否出现清除按钮 |
| disabled | 是否禁用 | BoolSetter | 是否禁用 |
| hasLimitHint | 展示限制 | BoolSetter | 是否展现最大长度样式 |
| cutString | 是否截断 | BoolSetter | 是否截断超出字符串 |
| readOnly | 是否只读 | BoolSetter | 是否只读 |
| trim | 是否 Trim | BoolSetter |  |
| hasBorder | 显示边框 | BoolSetter |  |
| autoFocus | 自动聚焦 | BoolSetter | 自动聚焦 |
| hint | Icon 水印 | IconSetter |  |
| innerBefore | 文字前附加内容 | StringSetter |  |
| innerAfter | 文字后附加内容 | StringSetter |  |
| addonBefore | 输入框前附加内容 | StringSetter |  |
| addonAfter | 输入框后附加内容 | StringSetter |  |
| addonTextBefore | 输入框前附加文字 | StringSetter |  |
| addonTextAfter | 输入框后附加文字 | StringSetter |  |
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

