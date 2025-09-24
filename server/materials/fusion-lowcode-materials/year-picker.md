# YearPicker

## 基本信息

- **组件名称**: YearPicker
- **组件标题**: YearPicker
- **组件分组**: 原子组件
- **组件分类**: 基础
- **NPM包**: @alilc/lowcode-materials
- **导出名**: DatePicker

## 组件描述

YearPicker组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| prefix | string | next- |  |
| rtl | bool | false |  |
| label | instanceOf | - | 输入框内置标签 |
| state | oneOf: success | loading | error | - | 输入框状态 |
| placeholder | string | - | 输入提示 |
| value | instanceOf | - | 日期值（受控）moment 对象 |
| defaultValue | instanceOf | - | 初始日期值，moment 对象 |
| format | string | YYYY | 日期值的格式（用于限定用户输入和展示） |
| disabledDate | func | - | 禁用日期函数
@param {MomentObject} 日期值
@param {String} view 当前视图类型，year: 年， month: 月, date: 日
@return {Boolean} 是否禁用 |
| footerRender | func | - | 自定义面板页脚
@return {Node} 自定义的面板页脚组件 |
| onChange | func | - | 日期值改变时的回调
@param {MomentObject|String} value 日期值 |
| size | oneOf: small | medium | large | medium | 输入框尺寸 |
| disabled | bool | - | 是否禁用 |
| hasClear | bool | true | 是否显示清空按钮 |
| visible | bool | - | 弹层显示状态 |
| defaultVisible | bool | - | 弹层默认是否显示 |
| onVisibleChange | func | - | 弹层展示状态变化时的回调
@param {Boolean} visible 弹层是否显示
@param {String} reason 触发弹层显示和隐藏的来源 calendarSelect 表示由日期表盘的选择触发； fromTrigger 表示由trigger的点击触发； docClick 表示由document的点击触发 |
| popupTriggerType | oneOf: click | hover | click | 弹层触发方式 |
| popupAlign | string | tl tl | 弹层对齐方式, 具体含义见 OverLay文档 |
| popupContainer | any | - | 弹层容器
@param {Element} target 目标元素
@return {Element} 弹层的容器元素 |
| popupStyle | object | - | 弹层自定义样式 |
| popupClassName | string | - | 弹层自定义样式类 |
| popupProps | object | - | 弹层其他属性 |
| followTrigger | bool | - | 是否跟随滚动 |
| inputProps | object | - | 输入框其他属性 |
| yearCellRender | func | - |  |
| dateInputAriaLabel | string | - | 日期输入框的 aria-label 属性 |
| isPreview | bool | - | 是否为预览态 |
| renderPreview | func | - | 预览态模式下渲染的内容
@param {MomentObject} value 年份 |
| locale | object | - |  |
| className | string | - |  |
| name | string | - |  |
| popupComponent | instanceOf | - |  |
| popupContent | instanceOf | - |  |
| style | object | - |  |


