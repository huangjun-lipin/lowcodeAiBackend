# 表单项

## 基本信息

- **组件名称**: Form.Item
- **组件标题**: 表单项
- **组件分组**: 原子组件
- **组件分类**: 信息输入
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Form

## 组件描述

表单项组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| id | string | - |  |
| rtl | bool | - |  |
| label | string | - | 标签 |
| labelCol | shape | - | label 标签布局，通 `<Col>` 组件，设置 span offset 值，如 {span: 8, offset: 16}，该项仅在垂直表单有效 |
| wrapperCol | shape | - | 需要为输入控件设置布局样式时，使用该属性，用法同 labelCol |
| help | string | - | 自定义提示信息，如不设置，则会根据校验规则自动生成. |
| extra | string | - | 额外的提示信息，和 help 类似，当需要错误信息和提示文案同时出现时，可以使用这个。 位于错误信息后面 |
| validateState | oneOf: error | success | loading | warning | - | 校验状态，如不设置，则会根据校验规则自动生成
@enumdesc 失败, 成功, 校验中, 警告 |
| style | object | - | 自定义内联样式 |
| size | oneOf: large | small | medium | - | 单个 Item 的 size 自定义，优先级高于 Form 的 size, 并且当组件与 Item 一起使用时，组件自身设置 size 属性无效。 |
| fullWidth | bool | - | 单个 Item 中表单类组件宽度是否是100% |
| labelAlign | oneOf: top | left | inset | - | 标签的位置
@enumdesc 上, 左, 内 |
| labelTextAlign | oneOf: left | right | - | 标签的左右对齐方式
@enumdesc 左, 右 |
| className | string | - | 扩展class |
| required | bool | - | [表单校验] 不能为空 |
| requiredMessage | string | - | required 自定义错误信息 |
| min | number | - | [表单校验] 最小值 |
| max | number | - | [表单校验] 最大值 |
| minmaxMessage | string | - | min/max 自定义错误信息 |
| minLength | number | - | [表单校验] 字符串最小长度 / 数组最小个数 |
| maxLength | number | - | [表单校验] 字符串最大长度 / 数组最大个数 |
| minmaxLengthMessage | string | - | minLength/maxLength 自定义错误信息 |
| length | number | - | [表单校验] 字符串精确长度 / 数组精确个数 |
| lengthMessage | string | - | length 自定义错误信息 |
| pattern | string | - | 正则校验 |
| patternMessage | string | - | pattern 自定义错误信息 |
| format | oneOf: number | email | url | tel | - | [表单校验] 四种常用的 pattern |
| formatMessage | string | - | format 自定义错误信息 |
| validator | func | - | [表单校验] 自定义校验函数 |
| autoValidate | bool | - | 是否修改数据时自动触发校验 |
| device | oneOf: phone | tablet | desktop | - | 预设屏幕宽度 |
| responsive | bool | - |  |
| colSpan | number | - | 在响应式布局模式下，表单项占多少列 |
| labelWidth | oneOfType: string | number | 100 | 在响应式布局下，且label在左边时，label的宽度是多少 |
| isPreview | bool | - | 是否开启预览态 |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| label | 标签文本 | StringSetter | 标签 |
| help | 错误提示 | StringSetter | 自定义提示信息，如不设置，则会根据校验规则自动生成. |
| extra | 帮助提示 | StringSetter |  |
| validateState | 校验状态 | RadioGroupSetter |  |
| size | 尺寸 | RadioGroupSetter |  |
| labelAlign | 标签位置 | RadioGroupSetter |  |
| labelTextAlign | 标签对齐 | RadioGroupSetter |  |
| device | 设备 | RadioGroupSetter |  |
| fullWidth | 宽度占满 | BoolSetter | 单个 Item 中表单类组件宽度是否是100% |
| isPreview | 预览态 | BoolSetter | 是否开启预览态 |
| autoValidate | 自动校验 | BoolSetter | 是否修改数据时自动触发校验 |
| **校验** | 分组 | - | 属性分组 |
|  | 非空校验 | - |  |
|  | 最大/最小值校验 | - |  |
|  | 最大/最小长度校验 | - |  |
|  | 长度校验 | - |  |
|  | 正则校验 | - |  |
|  | 格式化校验 | - |  |
| validator | 自定义校验函数 | FunctionSetter | [表单校验] 自定义校验函数 |
| **布局** | 分组 | - | 属性分组 |
| labelCol |  | ObjectSetter | label 标签布局，通 `<Col>` 组件，设置 span offset 值，如 {span: 8, offset: 16}，该项仅在垂直表单有效 |
| wrapperCol |  | ObjectSetter | 需要为输入控件设置布局样式时，使用该属性，用法同 labelCol |
| **高级** | 分组 | - | 属性分组 |
| id | 唯一标识 | StringSetter |  |
| name | 表单标识 | StringSetter |  |


## 支持的功能

- ✅ 样式配置

## 容器配置

- ✅ 可作为容器组件
- 嵌套规则: {"parentWhitelist":["Form"]}

## 事件回调

| 事件名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| onNodeRemove | event | - | NodeRemove 事件处理函数 |

