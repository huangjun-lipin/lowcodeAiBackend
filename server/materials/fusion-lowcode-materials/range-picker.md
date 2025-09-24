# 日期区段选择

## 基本信息

- **组件名称**: RangePicker
- **组件标题**: 日期区段选择
- **组件分组**: 原子组件
- **组件分类**: 信息输入
- **NPM包**: @alilc/lowcode-materials
- **导出名**: DatePicker

## 组件描述

日期区段选择组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| prefix | string | next- |  |
| rtl | bool | false |  |
| type | oneOf: date | month | year | date | 日期范围类型 |
| defaultVisibleMonth | func | - | 默认展示的起始月份
@return {MomentObject} 返回包含指定月份的 moment 对象实例 |
| onVisibleMonthChange | func | - |  |
| value | array | - | 日期范围值数组 [moment, moment] |
| defaultValue | array | - | 初始的日期范围值数组 [moment, moment] |
| format | string | YYYY-MM-DD | 日期格式 |
| showTime | bool | false | 是否使用时间控件，支持传入 TimePicker 的属性 |
| resetTime | bool | false | 每次选择是否重置时间（仅在 showTime 开启时有效） |
| disabledDate | func | - | 禁用日期函数
@param {MomentObject} 日期值
@param {String} view 当前视图类型，year: 年， month: 月, date: 日
@return {Boolean} 是否禁用 |
| footerRender | func | - | 自定义面板页脚
@return {Node} 自定义的面板页脚组件 |
| onChange | func | - | 日期范围值改变时的回调 [ MomentObject|String, MomentObject|String ]
@param {Array<MomentObject|String>} value 日期值 |
| onOk | func | - | 点击确认按钮时的回调 返回开始时间和结束时间`[ MomentObject|String, MomentObject|String ]`
@return {Array} 日期范围 |
| label | string | - | 输入框内置标签 |
| state | oneOf: error | loading | success | - | 输入框状态 |
| size | oneOf: small | medium | large | medium | 输入框尺寸 |
| disabled | bool | - | 是否禁用 |
| hasClear | bool | true | 是否显示清空按钮 |
| visible | bool | - | 弹层显示状态 |
| defaultVisible | bool | false | 弹层默认是否显示 |
| onVisibleChange | func | - | 弹层展示状态变化时的回调
@param {Boolean} visible 弹层是否显示
@param {String} type 触发弹层显示和隐藏的来源 okBtnClick 表示由确认按钮触发； fromTrigger 表示由trigger的点击触发； docClick 表示由document的点击触发 |
| popupTriggerType | oneOf: click | hover | click | 弹层触发方式 |
| popupAlign | string | tl tl | 弹层对齐方式, 具体含义见 OverLay文档 |
| popupContainer | node | - | 弹层容器
@param {Element} target 目标元素
@return {Element} 弹层的容器元素 |
| popupClassName | string | - | 弹层自定义样式类 |
| followTrigger | bool | - | 是否跟随滚动 |
| startDateInputAriaLabel | string | - | 开始日期输入框的 aria-label 属性 |
| startTimeInputAriaLabel | string | - | 开始时间输入框的 aria-label 属性 |
| endDateInputAriaLabel | string | - | 结束日期输入框的 aria-label 属性 |
| endTimeInputAriaLabel | string | - | 结束时间输入框的 aria-label 属性 |
| isPreview | bool | - | 是否为预览态 |
| locale | object | - |  |
| className | string | - |  |
| name | string | - |  |
| popupComponent | string | - |  |
| popupContent | node | - |  |
| style | object | - |  |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| defaultValue | 默认值 | ObjectSetter |  |
| type | 日期类型 | - | 日期范围类型 |
| label | 内置标签 | StringSetter | 输入框内置标签 |
| state | 输入状态 | - | 输入框状态 |
| size | 尺寸 | - | 输入框尺寸 |
| disabled | 是否禁用 | BoolSetter |  |
| hasClear | 清空按钮 | BoolSetter |  |
| defaultVisible | 显示弹层 | BoolSetter |  |
| **高级** | 分组 | - | 属性分组 |
| id | 唯一标识 | StringSetter |  |
| name | 表单标识 | StringSetter |  |


## 支持的功能

- ✅ 样式配置
- ✅ 事件配置

### 支持的事件

| 事件名 | 描述 |
|--------|------|
| onVisibleMonthChange | onVisibleMonthChange 事件 |
| onChange | onChange 事件 |
| onOk | onOk 事件 |
| onVisibleChange | onVisibleChange 事件 |

