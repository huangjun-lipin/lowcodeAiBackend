# 表格

## 基本信息

- **组件名称**: NextTable
- **组件标题**: 表格
- **组件分组**: 原子组件
- **组件分类**: 信息输入
- **NPM包**: @alilc/lowcode-materials
- **导出名**: NextTable

## 组件描述

表格组件

## 属性配置

### 基础属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| columns | arrayOf | - | 数据列 |
| data | oneOfType: Json | JSExpression | - | 数据源 |
| actionTitle | string | - | 操作列标题 |
| actionColumn | arrayOf | - | 操作列 |
| customBarItem | any | - | 自定义工具栏渲染 |


### 配置属性

| 属性名 | 标题 | 设置器 | 描述 |
|--------|------|--------|------|
| customBarItem | 自定义工具栏渲染 | ObjectSetter |  |
| **风格和样式** | 分组 | - | 属性分组 |
| theme | 主题 | RadioGroupSetter |  |
| hasHeader | 是否显示表头 | BoolSetter |  |
| fixedHeader | 是否固定表头 | BoolSetter |  |
| stickyHeader | 表头是否是sticky | BoolSetter |  |
| setEmptyContent | 开启自定义空提示 | BoolSetter |  |
| maxBodyHeight |  | StringSetter | 最大高度 |
| **行选择器** | 分组 | - | 属性分组 |
| rowSelector | 选择器模式 | RadioGroupSetter |  |
| showRowSelector | 是否启用选择模式 | BoolSetter |  |
| **分页设置** | 分组 | - | 属性分组 |
| isPagination | 是否显示分页 | BoolSetter |  |
| pagination | 分页设置 | ObjectSetter |  |
| **可折叠/树形表格** | 分组 | - | 属性分组 |
| hasExpandedRowCtrl | 启用折叠 | BoolSetter |  |
| isTree | 启用树形 | BoolSetter |  |
| **顶部操作选项** | 分组 | - | 属性分组 |
| showMiniPager | 顶部迷你分页器 | BoolSetter |  |
| showActionBar | 显示操作条 | BoolSetter |  |
| showLinkBar | 显示外链条 | BoolSetter |  |
| showSearch | 显示搜索 | BoolSetter |  |
| searchBarPlaceholder | 搜索 placeholder | StringSetter |  |
| showCustomColumn | 显示筛选器 | BoolSetter |  |
| actionBar | 操作条 | ArraySetter |  |
| linkBar | 外链操作条 | ArraySetter |  |
| columns | 数据列 | MixedSetter |  |
| data | 数据源 | MixedSetter |  |
| **操作列选项** | 分组 | - | 属性分组 |
| actionTitle | 操作列标题 | StringSetter |  |
| actionWidth | 操作列宽度 | NumberSetter |  |
| actionType |  | RadioGroupSetter |  |
| actionFixed |  | RadioGroupSetter |  |
| actionHidden |  | BoolSetter |  |
| actionColumn | 操作列 | ArraySetter |  |


## 支持的功能

- ✅ 样式配置
- ✅ 事件配置

### 支持的事件

| 事件名 | 描述 |
|--------|------|
| onFetchData | onFetchData 事件 |
| onSelect | onSelect 事件 |
| onRowClick | onRowClick 事件 |
| onRowMouseEnter | onRowMouseEnter 事件 |
| onRowMouseLeave | onRowMouseLeave 事件 |
| onResizeChange | onResizeChange 事件 |
| onColumnsChange | onColumnsChange 事件 |
| onRowOpen | onRowOpen 事件 |
| onShowSearch | onShowSearch 事件 |



## 核心接口定义

### IBaseTableFieldProps

```typescript
interface IBaseTableFieldProps {
  name: string;
  value?: any;
  onChange: (value: any) => void;
  nextTablePrefix: string;
  rules?: Rule;
}
```

### ICustomFieldProps

```typescript
interface ICustomFieldProps {
  rowData: any;
  renderField: (props: InitResult<any>, value: any, rowData: any) => ReactNode;
}
```

### IRadioFieldProps

```typescript
interface IRadioFieldProps {
}
```

### ISelectFieldProps

```typescript
interface ISelectFieldProps {
}
```

### IWebCustomColumnDrawerProps

```typescript
interface IWebCustomColumnDrawerProps {
  columns?: any[];
  onOk?: (columns: IWebCustomColumnDrawerProps['columns']) => void;
  onClose?: () => void;
  locale?: {;
  propKey: string]: string;
}
```

### IWebCustomColumnDrawerState

```typescript
interface IWebCustomColumnDrawerState {
  defaultColumns: IWebCustomColumnDrawerProps['columns'];
  currentColumns: IWebCustomColumnDrawerProps['columns'];
}
```

### IWebLinkBarProps

```typescript
interface IWebLinkBarProps {
  nextTablePrefix?: string;
  onActionClick?: (item: IAction, index: number) => void;
  linkBar?: IAction[];
}
```

### IActionColumnItem

```typescript
interface IActionColumnItem {
  title: string;
  callback?: (rowData: any, action: IActionColumnItem, index?: number) => void;
  device?: string[];
  mode?: string;
  render?: (title: IActionColumnItem['title'], rowData: any) => ReactNode;
}
```

### IWebNextTableActionCellProps

```typescript
interface IWebNextTableActionCellProps {
  actionColumn?: IActionColumnItem[];
  actionType?: string;
  maxWebShownActionCount?: number;
  nextTablePrefix?: string;
  rowData?: any;
  device?: string;
  index?: number;
  locale?: {;
  prop: string]: string;
}
```

### IWebNextTableCellProps

```typescript
interface IWebNextTableCellProps {
  rowData: any;
  column: {;
  editType?: keyof typeof fieldsMap;
  dataKey: string;
  prop: string]: any;
}
```

### IWebNextTableCellState

```typescript
interface IWebNextTableCellState {
  editable: boolean;
  currentValue: any;
}
```

### IWebPaginationProps

继承自: Pick<PaginationProps, 'pageSize' | 'onChange' | 'onPageSizeChange' | 'pageSizeList'>

```typescript
interface IWebPaginationProps extends Pick<PaginationProps, 'pageSize' | 'onChange' | 'onPageSizeChange' | 'pageSizeList'> {
  nextTablePrefix?: string;
  currentPage?: PaginationProps['current'];
  totalCount?: PaginationProps['total'];
  locale?: {;
  prop: string]: string;
}
```

### IWebRowOrderProps

```typescript
interface IWebRowOrderProps {
  items: {;
  value: string;
  text: ReactNode;
}
```

### IAction

```typescript
interface IAction {
  render?: (title: IAction['title']) => ReactNode;
  isDisabled?: () => boolean;
  title?: ReactNode;
  type: ButtonProps['type'];
  disabled: boolean;
  callback?: (action: IAction) => void;
}
```

### IWebToolbarProps

```typescript
interface IWebToolbarProps {
  nextTablePrefix?: string;
  onSearch?: SearchProps['onSearch'];
  onActionClick?: (action: IAction, index: number) => void;
  locale?: { [prop: string]: string;
}
```

### ITableProps

继承自: IWebTableProps

```typescript
interface ITableProps extends IWebTableProps {
}
```

### NextTable

继承自: React.Component<ITableProps>, Omit<IEditableMethods, 'init'>, Pick<ICommonMethods, 'getDataSource'>

```typescript
interface NextTable extends React.Component<ITableProps>, Omit<IEditableMethods, 'init'>, Pick<ICommonMethods, 'getDataSource'> {
}
```

### IColumnMethods

```typescript
interface IColumnMethods {
  this: WebTable): void;
  this: WebTable): void;
  this: WebTable): void;
  this: WebTable, columns: IWebTableProps['columns']): void;
  this: WebTable, columns: IWebTableProps['columns']): void;
  this: WebTable): ReactNode;
}
```

### ICommonMethods

```typescript
interface ICommonMethods {
  this: WebTable): void;
  this: WebTable, from: string): void;
  this: WebTable): any;
  this: WebTable, value: any): any;
  this: WebTable, dataIndex: string, order: string): void;
  this: WebTable, searchKey: string): void;
  this: WebTable): ReactNode | null;
  this: WebTable, pageSize: number): void;
  this: WebTable, current: number): void;
  this: WebTable): any;
}
```

### IEditableMethodsProps

```typescript
interface IEditableMethodsProps {
  rowItem: any): void;
  rowItem: any): void;
  rowItem: any): void;
}
```

### IEditableMethods

```typescript
interface IEditableMethods {
  this: WebTable): void;
  this: WebTable, rowData: any): any;
  this: WebTable, rowData: any): any;
  this: WebTable, rowData: any): any;
  this: WebTable, rowData: any): any;
}
```

### IWebTableProps

继承自: IWebToolbarProps, IEditableMethodsProps, Omit<IWebNextTableActionCellProps, 'index'>, Omit<TableProps, 'locale' | 'onSelect'>

```typescript
interface IWebTableProps extends IWebToolbarProps, IEditableMethodsProps, Omit<IWebNextTableActionCellProps, 'index'>, Omit<TableProps, 'locale' | 'onSelect'> {
  data?: any;
  columns?: any[];
  nextTablePrefix?: string;
  isPagination?: boolean;
  actionTitle?: string;
  actionFixed?: string;
  actionWidth?: number | string;
  pagination?: any;
  primaryKey?: string;
  onFetchData?: (options: Pick<IWebTableState, "currentPage" | "pageSize" | "searchKey" | "orderColumn" | "orderType"> & { from: string;
}
```

### IWebTableState

```typescript
interface IWebTableState {
  originalColumns?: any[];
  currentColumns?: any[];
  currentPage: number;
  pageSize: number;
  searchKey: string;
  orderColumn: string;
  orderType: string;
  dataSource: any;
  totalCount: number;
  isCustomColumnDrawerShown: boolean;
}
```

### WebTable

继承自: React.Component<IWebTableProps, IWebTableState>, Omit<ICommonMethods, 'init'>, Omit<IColumnMethods, 'init'>, Omit<IEditableMethods, 'init'>

```typescript
interface WebTable extends React.Component<IWebTableProps, IWebTableState>, Omit<ICommonMethods, 'init'>, Omit<IColumnMethods, 'init'>, Omit<IEditableMethods, 'init'> {
}
```

### IImageRenderColumn

```typescript
interface IImageRenderColumn {
  imageProps?: React.CSSProperties & { onClick?(e: MouseEvent<HTMLImageElement>, column: IImageRenderColumn, rowData: any): void;
}
```


## 属性配置

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| name | string | 是 | - | - |
| value | any | 否 | - | - |
| onChange | (value: any) => void | 是 | - | - |
| nextTablePrefix | string | 是 | - | - |
| rules | Rule | 否 | - | - |
| rowData | any | 是 | - | - |
| renderField | (props: InitResult<any>, value: any, rowData: any) => ReactNode | 是 | - | - |
| columns | any[] | 否 | - | - |
| onOk | (columns: IWebCustomColumnDrawerProps['columns']) => void | 否 | - | - |
| onClose | () => void | 否 | - | - |
| locale | { | 否 | - | - |
| propKey | string]: string | 是 | - | - |
| onActionClick | (item: IAction, index: number) => void | 否 | - | - |
| linkBar | IAction[] | 否 | - | - |
| actionColumn | IActionColumnItem[] | 否 | - | - |
| actionType | string | 否 | - | - |
| maxWebShownActionCount | number | 否 | - | - |
| device | string | 否 | - | - |
| index | number | 否 | - | - |
| prop | string]: string | 是 | - | - |
| column | { | 是 | - | - |
| editType | keyof typeof fieldsMap | 否 | - | - |
| dataKey | string | 是 | - | - |
| currentPage | PaginationProps['current'] | 否 | - | - |
| totalCount | PaginationProps['total'] | 否 | - | - |
| items | { | 是 | - | - |
| text | ReactNode | 是 | - | - |
| onSearch | SearchProps['onSearch'] | 否 | - | - |
| rowItem | any): void | 是 | - | - |
| data | any | 否 | - | - |
| isPagination | boolean | 否 | - | - |
| actionTitle | string | 否 | - | - |
| actionFixed | string | 否 | - | - |
| actionWidth | number \| string | 否 | - | - |
| pagination | any | 否 | - | - |
| primaryKey | string | 否 | - | - |
| onFetchData | (options: Pick<IWebTableState, "currentPage" \| "pageSize" \| "searchKey" \| "orderColumn" \| "orderType"> & { from: string | 否 | - | - |


## 核心方法

| 方法名 | 类型 | 说明 |
|--------|------|------|
| getSelectedRowKeys | function | - |
| canEditCell | function | - |
| getDataItemByValue | function | - |
| getAndCloneDataItem | function | - |
| callTableCell | function | - |
| loadMethods | function | - |
| buildNextTableMethod | function | - |
| buildTableProps | function | - |
| safeAccess | function | - |
| safeWrite | function | - |
| convertData | function | - |
| delegateFunctions | function | - |
| dispatchResizeEvent | function | - |
| filterActionColumn | function | - |
| filterActionColumnByDevice | function | - |
| filterColumn | function | - |
| deepCopyExcept | function | - |
| getCleanRowData | function | - |
| getColumns | function | - |
| getCols | function | - |
| getDataSource | function | - |
| hasRowAction | function | - |
| actionTitleRender | function | - |
| cascadeTimestampRender | function | - |
| commonTableCellRender | function | - |
| defaultRender | function | - |
| enumRender | function | - |
| errorRender | function | - |
| fileRender | function | - |
| ImageRender | function | - |
| linkRender | function | - |
| moneyRangeRender | function | - |
| moneyRender | function | - |
| timestampRender | function | - |
| titleMessageRender | function | - |
| runColumnActionCallback | function | - |
| runToolbarActionCallback | function | - |


## 事件回调

| 事件名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| onChange | event | - | Change 事件处理函数 |
| onSelectAll | event | - | SelectAll 事件处理函数 |
| onSelect | event | - | Select 事件处理函数 |
| onOk | callback | columns: IWebCustomColumnDrawerProps['columns'] | onOk 回调函数 |
| onClose | callback |  | onClose 回调函数 |
| onClick | event | - | Click 事件处理函数 |
| onActionClick | callback | item: IAction, index: number | onActionClick 回调函数 |
| onent | event | - | ent 事件处理函数 |
| onColumnsChange | event | - | ColumnsChange 事件处理函数 |
| oney | event | - | ey 事件处理函数 |

## 使用示例

该组件提供了预设的代码片段，可以快速插入到页面中使用。

