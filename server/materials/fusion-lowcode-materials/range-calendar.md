# RangeCalendar

## 基本信息

- **组件名称**: RangeCalendar
- **组件标题**: RangeCalendar
- **组件分组**: 原子组件
- **组件分类**: 基础
- **NPM包**: @alilc/lowcode-materials
- **导出名**: Calendar

## 组件描述

RangeCalendar组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| prefix | string | next- | 样式前缀 |
| rtl | bool | false |  |
| defaultStartValue | instanceOf | - | 默认的开始日期 |
| defaultEndValue | instanceOf | - | 默认的结束日期 |
| startValue | instanceOf | - | 开始日期（moment 对象） |
| endValue | instanceOf | - | 结束日期（moment 对象） |
| disableChangeMode | bool | false |  |
| format | string | YYYY-MM-DD |  |
| showOtherMonth | bool | false | 是否显示非本月的日期 |
| defaultVisibleMonth | func | - | 模板展示的月份（起始月份） |
| onVisibleMonthChange | func | - | 展现的月份变化时的回调
@param {Object} value 显示的月份 (moment 对象)
@param {String} reason 触发月份改变原因 |
| disabledDate | func | - | 不可选择的日期
@param {Object} calendarDate 对应 Calendar 返回的自定义日期对象
@param {String} view 当前视图类型，year: 年， month: 月, date: 日
@returns {Boolean} |
| onSelect | func | - | 选择日期单元格时的回调
@param {Object} value 对应的日期值 (moment 对象) |
| dateCellRender | func | - | 自定义日期单元格渲染 |
| monthCellRender | func | - | 自定义月份渲染函数
@param {Object} calendarDate 对应 Calendar 返回的自定义日期对象
@returns {ReactNode} |
| yearCellRender | func | - |  |
| locale | object | - |  |
| className | string | - |  |
| style | object | - |  |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| startValue |  | DateSetter |  |
| defaultStartValue |  | DateSetter |  |
| defaultEndValue |  | DateSetter |  |
| endValue |  | DateSetter |  |


