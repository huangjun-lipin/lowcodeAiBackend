# ProTable - 高级表格

## 基本信息

- **组件名称**: ProTable
- **组件标题**: 高级表格
- **组件分组**: 高级组件
- **组件分类**: 数据展示
- **NPM包**: @alilc/lowcode-materials
- **源码路径**: packages/fusion-ui/src/components/pro-table

## 描述

ProTable 是一个功能强大的高级表格组件，提供了丰富的数据展示和交互功能。它在基础 Table 组件的基础上，增加了排序、筛选、搜索、分页、行选择等高级特性，适用于复杂的数据管理场景。

## 主要特性

- 🔍 **智能搜索**: 支持列级别的关键字搜索
- 🎛️ **高级筛选**: 支持多种筛选条件和筛选面板
- 📊 **灵活排序**: 支持单列和多列排序
- 📄 **分页功能**: 内置分页组件，支持自定义分页配置
- ✅ **行选择**: 支持单选、多选和反选模式
- 🎨 **列格式化**: 内置多种数据格式化类型
- ⚙️ **列设置**: 支持列的显示/隐藏、排序、锁定等设置
- 📱 **响应式**: 支持紧凑模式、斑马纹、全屏等显示模式
- 🔧 **操作列**: 支持自定义操作按钮和操作列
- 📈 **总计行**: 支持显示统计数据的总计行
- 🎯 **插槽系统**: 支持多个位置的内容插槽
- 🔄 **上下文管理**: 内置多个 Context 管理不同功能状态

## 核心接口定义

### ProTableBaseProps

基础属性接口，继承自 `ProTableCellCommonProps` 和 `TableProps`：

```typescript
interface ProTableBaseProps extends ProTableCellCommonProps, TableProps {
  columnKey?: string;
  columns?: ProTableColumnProps[];
  resizable?: boolean;
  sortMode?: 'single' | 'multiple';
  sort?: SortValue;
  onSort?: (sort: SortValue) => void;
  searchParams?: SearchParam[];
  onSearch?: (searchParams: SearchParam[]) => void;
  filterParams?: FilterParam[];
  onFilter?: (filterParams: FilterParam[]) => void;
  columnFilters?: ProTableColumnsFilterValue;
  onColumnsFilterChange?: (columnFilters: ProTableColumnsFilterValue) => void;
  groupHeader?: boolean;
  groupFooter?: boolean;
  stickyLock?: boolean;
  indexColumn?: boolean;
  indexColumnProps?: ProTableColumnProps;
  actionColumnProps?: ProTableColumnProps;
  actionColumnButtons?: ProTableActionColumnButtons;
  actionColumn?: ProTableColumnProps; // deprecated
  actionButtonGroupProps?: ProTableButtonGroupProps;
  actionColumnPredication?: (record: ProTableRowRecord, index: number) => boolean;
  onActionColumnClick?: (record: ProTableRowRecord, index: number, button: ActionColumnButton) => void;
  totalDataSource?: ProTableRowRecord[];
  rowSelection?: ProTableRowSelectionInstance;
}
```

### ProTableColumnProps

列配置接口，继承自 `ColumnProps`：

```typescript
interface ProTableColumnProps extends ColumnProps {
  key?: string;
  group?: string;
  formatType?: string;
  formatOptions?: any;
  formatValue?: (value: any, index: number, record: any) => any;
  formatColor?: (value: any, index: number, record: any) => string;
  onCellClick?: (value: any, index: number, record: any, event: any) => void;
  dataSource?: any[];
  explanation?: string;
  children?: ProTableColumnProps[];
  searchable?: boolean;
  filters?: ProTableColumnFilterValue[];
  isImmediate?: boolean;
  cell?: React.ComponentType<any>;
}
```

### 行选择接口

```typescript
interface ProTableRowSelectionInstance {
  ref?: React.RefObject<any>;
  getProps?: (record: ProTableRowRecord, index: number) => any;
  onChange?: (selectedRowKeys: ProTableRowKey[], selectedRows: ProTableRowRecord[]) => void;
}

type ProTableRowSelectionType = 'checkbox' | 'radio';
```

## 主要属性

### 基础配置

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| dataSource | ProTableRowRecord[] | [] | 表格数据源 |
| columns | ProTableColumnProps[] | [] | 表格列配置 |
| loading | boolean | false | 是否显示加载状态 |
| size | 'small' \| 'medium' \| 'large' | 'medium' | 表格尺寸 |
| hasBorder | boolean | true | 是否显示边框 |
| isZebra | boolean | false | 是否显示斑马纹 |
| fixedHeader | boolean | false | 是否固定表头 |
| maxBodyHeight | number \| string | - | 表格最大高度 |
| resizable | boolean | false | 是否支持列宽调整 |

### 排序配置

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| sortMode | 'single' \| 'multiple' | 'single' | 排序模式 |
| sort | SortValue | - | 当前排序状态 |
| onSort | (sort: SortValue) => void | - | 排序变化回调 |

### 搜索配置

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| searchParams | SearchParam[] | - | 搜索参数 |
| onSearch | (searchParams: SearchParam[]) => void | - | 搜索回调 |

### 筛选配置

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| filterParams | FilterParam[] | - | 筛选参数 |
| onFilter | (filterParams: FilterParam[]) => void | - | 筛选回调 |
| columnFilters | ProTableColumnsFilterValue | - | 列筛选值 |
| onColumnsFilterChange | (columnFilters: ProTableColumnsFilterValue) => void | - | 列筛选变化回调 |

### 布局配置

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| groupHeader | boolean | false | 是否显示分组表头 |
| groupFooter | boolean | false | 是否显示分组表尾 |
| stickyLock | boolean | false | 是否启用粘性锁定 |

### 特殊列配置

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| indexColumn | boolean | false | 是否显示序号列 |
| indexColumnProps | ProTableColumnProps | - | 序号列配置 |
| actionColumnProps | ProTableColumnProps | - | 操作列配置 |
| actionColumnButtons | ProTableActionColumnButtons | - | 操作列按钮配置 |
| actionColumnPredication | (record, index) => boolean | - | 操作列显示条件 |
| onActionColumnClick | (record, index, button) => void | - | 操作列点击回调 |

### 行选择配置

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| rowSelection | ProTableRowSelectionInstance | - | 行选择配置 |

### 总计行配置

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| totalDataSource | ProTableRowRecord[] | - | 总计行数据源 |

## 核心方法和 Hooks

### useProTable Hook

主要的表格状态管理 Hook：

```typescript
function useProTable(params: UseProTableServiceParams): UseProTableResult {
  // 返回 tableProps 和 filterProps
}

interface UseProTableResult {
  tableProps: {
    dataSource: any[];
    loading: boolean;
    pagination: any;
    // ... 其他表格属性
  };
  filterProps: {
    searchParams: SearchParam[];
    filterParams: FilterParam[];
    onSearch: (params: SearchParam[]) => void;
    onFilter: (params: FilterParam[]) => void;
    // ... 其他筛选属性
  };
}
```

### 列设置管理

```typescript
// useProTableColumnsSetting Hook
const {
  columnsSetting,
  setColumnsSetting,
  updateColumnsSetting,
  getColumnSetting,
  updateColumnSetting
} = useProTableColumnsSetting();
```

### 表格操作方法

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| setTableParams | (params: TableParams) => void | void | 设置表格参数 |
| refresh | () => void | void | 刷新表格数据 |
| onFilter | (filterParams: FilterParams) => void | void | 执行筛选 |
| onSearch | (searchParams: SearchParam[]) => void | void | 执行搜索 |

## 事件回调

### 基础事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| onChange | (pagination, filters, sorter, extra) | 分页、排序、筛选变化时触发 |
| onRowClick | (record, index, event) | 行点击事件 |
| onRowDoubleClick | (record, index, event) | 行双击事件 |
| onRowMouseEnter | (record, index, event) | 鼠标进入行事件 |
| onRowMouseLeave | (record, index, event) | 鼠标离开行事件 |

### 高级事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| onSort | (sort: SortValue) => void | 排序变化事件 |
| onSearch | (searchParams: SearchParam[]) => void | 搜索事件 |
| onFilter | (filterParams: FilterParam[]) => void | 筛选事件 |
| onColumnsFilterChange | (columnFilters: ProTableColumnsFilterValue) => void | 列筛选变化事件 |
| onActionColumnClick | (record, index, button) => void | 操作列点击事件 |
| onCellClick | (value, index, record, event) => void | 单元格点击事件 |

### 列设置事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| onToggleShow | (columnKey: string, visible: boolean) => void | 切换列显示状态 |
| onSortEnd | (oldIndex: number, newIndex: number) => void | 列排序完成 |
| onLock | (columnKey: string, lock: string) => void | 列锁定状态变化 |
| onVisibleChange | (visible: boolean) => void | 筛选面板显示状态变化 |

## 子组件和插槽系统

### ProTableSlot 插槽组件

ProTable 支持多个位置的内容插槽：

```typescript
type ProTableSlotPosition = 
  | 'tableBarBefore'
  | 'tableBarAfter'
  | 'tableToolBarBefore'
  | 'tableToolBarAfter'
  | 'tableBefore'
  | 'tableAfter';

interface ProTableSlotProps {
  position: ProTableSlotPosition;
  children: React.ReactNode;
}
```

### 核心子组件

| 组件名 | 说明 | 主要功能 |
|--------|------|----------|
| ProTableCell | 表格单元格组件 | 数据格式化、编辑功能 |
| ProTableColumnTitleFilter | 列标题筛选组件 | 列级别筛选面板 |
| ProTableColumnFormatter | 列格式化组件 | 数据格式化显示 |
| ProTableTreeCell | 树形单元格组件 | 树状结构展示 |
| ProTableSettingButton | 设置按钮组件 | 列设置、表格配置 |
| EditTable | 可编辑表格 | 行内编辑功能 |
| GroupTable | 分组表格 | 数据分组展示 |

### 格式化类型

ProTable 内置多种数据格式化类型：

| 格式化类型 | 说明 | 示例 |
|------------|------|------|
| link | 链接格式 | 显示为可点击链接 |
| money | 金额格式 | ¥1,234.56 |
| currency | 货币格式 | $1,234.56 |
| progress | 进度条格式 | 进度条显示 |
| date | 日期格式 | 2023-12-01 |
| datetime | 日期时间格式 | 2023-12-01 10:30:00 |
| percent | 百分比格式 | 85.5% |
| digit | 数字格式 | 1,234 |
| text | 文本格式 | 普通文本 |
| tag | 标签格式 | 彩色标签 |
| image | 图片格式 | 图片预览 |
| switch | 开关格式 | 开关控件 |

## 上下文管理

### ProTableContext

提供表格全局状态管理：

```typescript
const ProTableContext = React.createContext({
  // 表格实例引用
  tableRef: React.RefObject<any>;
  // 表格配置
  tableProps: ProTableBaseProps;
  // 列配置
  columns: ProTableColumnProps[];
  // 数据源
  dataSource: ProTableRowRecord[];
  // 加载状态
  loading: boolean;
  // 其他上下文数据...
});

// 使用上下文
const tableContext = useProTableValue();
```

### ProTableColumnsSettingContext

管理列设置状态：

```typescript
const {
  columnsSetting,
  setColumnsSetting,
  updateColumnsSetting,
  getColumnSetting,
  updateColumnSetting
} = useProTableColumnsSetting();
```

## 高级功能详解

### 1. 智能搜索

支持列级别的关键字搜索：

```typescript
interface SearchParam {
  key: string;
  value: any;
  operator?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'nin';
}

// 搜索配置
const searchConfig = {
  searchParams: [
    { key: 'name', value: 'keyword', operator: 'like' },
    { key: 'status', value: ['active', 'pending'], operator: 'in' }
  ],
  onSearch: (params) => {
    // 处理搜索逻辑
  }
};
```

### 2. 高级筛选

支持多种筛选条件：

```typescript
interface FilterParam {
  key: string;
  value: any;
  operator?: string;
  type?: 'string' | 'number' | 'date' | 'boolean' | 'enum';
}

// 筛选配置
const filterConfig = {
  filterParams: [
    { key: 'createTime', value: ['2023-01-01', '2023-12-31'], type: 'date' },
    { key: 'amount', value: [100, 1000], type: 'number' }
  ],
  onFilter: (params) => {
    // 处理筛选逻辑
  }
};
```

### 3. 操作列配置

支持灵活的操作按钮配置：

```typescript
interface ActionColumnButton {
  key: string;
  text: string;
  type?: 'primary' | 'secondary' | 'normal';
  disabled?: boolean | ((record: any, index: number) => boolean);
  hidden?: boolean | ((record: any, index: number) => boolean);
  onClick?: (record: any, index: number) => void;
}

const actionButtons = [
  {
    key: 'edit',
    text: '编辑',
    type: 'primary',
    onClick: (record) => handleEdit(record)
  },
  {
    key: 'delete',
    text: '删除',
    type: 'secondary',
    disabled: (record) => record.status === 'locked',
    onClick: (record) => handleDelete(record)
  }
];
```

### 4. 行选择功能

支持单选、多选和条件选择：

```typescript
const rowSelectionConfig = {
  ref: tableRef,
  getProps: (record, index) => ({
    disabled: record.status === 'disabled'
  }),
  onChange: (selectedRowKeys, selectedRows) => {
    console.log('选中的行:', selectedRowKeys, selectedRows);
  }
};
```

### 5. 列设置功能

支持列的显示/隐藏、排序、锁定：

```typescript
// 列设置配置
const columnSettings = {
  // 显示/隐藏列
  visible: {
    name: true,
    age: false,
    email: true
  },
  // 列顺序
  order: ['name', 'email', 'age'],
  // 列锁定
  lock: {
    name: 'left',
    action: 'right'
  }
};
```

## 性能优化

### 1. 虚拟滚动

对于大数据量场景，ProTable 支持虚拟滚动：

```typescript
const virtualConfig = {
  useVirtual: true,
  itemHeight: 40,
  threshold: 100
};
```

### 2. 懒加载

支持数据懒加载和分页加载：

```typescript
const lazyLoadConfig = {
  lazy: true,
  loadData: async (params) => {
    const response = await fetchData(params);
    return {
      data: response.data,
      total: response.total
    };
  }
};
```

### 3. 缓存机制

内置数据缓存和状态缓存：

```typescript
const cacheConfig = {
  cache: true,
  cacheKey: 'table-data-key',
  cacheDuration: 5 * 60 * 1000 // 5分钟
};
```


## 核心接口定义

### EditTableProps

继承自: ProTableProps

```typescript
interface EditTableProps extends ProTableProps {
  addPosition?: 'end' | 'start';
  onSave?: (rowIndex: number, record: Record<string, any>, dataSource: any[]) => void;
  onRemove?: (rowIndex: number, record: Record<string, any>, dataSource: any[]) => void;
  onCancel?: (rowIndex: number, record: Record<string, any>, dataSource: any[]) => void;
}
```

### ActionColumnButtonGroupProps

```typescript
interface ActionColumnButtonGroupProps {
  rowIndex: number;
  rowRecord: ProTableRowRecord;
  actionColumnPredication?: ProTableProps['actionColumnPredication'];
  onActionColumnClick?: ProTableProps['onActionColumnClick'];
  primaryKey: ProTableProps['primaryKey'];
  buttonGroupProps: ProTableActionColumnButtons;
}
```

### CellLabelProps

继承自: React.HTMLProps<HTMLDivElement>

```typescript
interface CellLabelProps extends React.HTMLProps<HTMLDivElement> {
  toolTipMode?: 'always' | 'ellipsis' | 'none';
}
```

### CellToolTipProps

```typescript
interface CellToolTipProps {
  toolTipMode?: 'always' | 'ellipsis' | 'none';
  onClick?: () => void;
}
```

### ProTableCellProps

继承自: ProTableCellCommonProps, ProTableColumnProps

```typescript
interface ProTableCellProps extends ProTableCellCommonProps, ProTableColumnProps {
  record: any;
  value: any;
  isIconLeft: boolean;
  colIndex: number;
  rowIndex: number;
  __colIndex: number | string; // 经过锁列调整后的列索引，lock right的列会从非0开始
  context: any;
  component: 'td' | 'th' | 'div';
  innerStyle: object;
  type: 'header' | 'body';
  rowSpan?: number;
  getCellDomRef?: string;
  primaryKey: string;
  dataKey: string;
  __normalized: any;
  filterMenuProps: any;
  filterProps: any;
  expandedIndexSimulate: any;
  wordBreak: any;
  editCell: any;
}
```

### ProTableTreeCellProps

继承自: ProTableCellProps

```typescript
interface ProTableTreeCellProps extends ProTableCellProps {
  indent: number;
}
```

### ColumnWithSetting

```typescript
interface ColumnWithSetting {
  key: string;
  column: ProTableColumnProps;
  children: ColumnWithSetting[];
}
```

### CellFactoryCellOptions

```typescript
interface CellFactoryCellOptions {
  value: unknown;
  getLabel: (props?: DataSourceLabelProps) => ReactNode;
  rowIndex: number;
  record: unknown;
  getCellOptions: () => any[];
  getCellColor: () => string;
}
```

### ProTableColumnFormatterOptions

```typescript
interface ProTableColumnFormatterOptions {
  column: ProTableColumnProps;
  formatTypeParser: {;
  raw: string;
  type: string;
  rawOptions: string[];
}
```

### ProTableColumnFilterPanelProps

```typescript
interface ProTableColumnFilterPanelProps {
  sortable?: boolean;
  sortDirections?: SortValue[];
  searchable?: boolean;
  filters?: FilterMenuProps['dataSource'];
  filterMode?: FilterMenuProps['selectMode'];
  filterMenuProps?: FilterMenuProps;
  onClose?: () => void;
  lock?: boolean | string;
  dataIndex: string;
  columnFilters: ProTableColumnsFilterValue;
  isImmediate?: boolean;
  rtl?: boolean;
}
```

### FilterMenuProps

继承自: Omit<MenuProps, 'dataSource'>

```typescript
interface FilterMenuProps extends Omit<MenuProps, 'dataSource'> {
  dataSource?: AsyncDataSource;
}
```

### ProTableColumnTitleFilterProps

继承自: Omit<ProTableColumnFilterPanelProps, 'value' | 'defaultValue' | 'onChange'>

```typescript
interface ProTableColumnTitleFilterProps extends Omit<ProTableColumnFilterPanelProps, 'value' | 'defaultValue' | 'onChange'> {
  iconType?: string;
}
```

### ProTableColumnTitleSortterProps

```typescript
interface ProTableColumnTitleSortterProps {
  value?: SortValue;
  className?: string;
  sortDirections?: SortValue[];
  onChange: (val: SortValue) => void;
}
```

### ProTableFullscreenButtonProps

```typescript
interface ProTableFullscreenButtonProps {
  onFullscreenStateChange?: (fullscreenState: boolean) => void;
}
```

### ProTableSettingButtonProps

```typescript
interface ProTableSettingButtonProps {
  sortOverlayProps?: Partial<OverlayProps>;
}
```

### ProTableSettingSortableListProps

```typescript
interface ProTableSettingSortableListProps {
  dataSource: ProTableSettingMenuItem[];
  onToggleShow: (item: ProTableSettingMenuItem, checked: boolean) => void;
  onSortEnd?: (oldIndex: number, newIndex: number, keys: string[]) => void;
  onLock?: (id: string, lock: boolean | string) => void;
  lock?: boolean | string;
  parentHidden?: boolean;
  setting: Record<string, ProTableSettingItem>;
}
```

### ProTableSettingItem

```typescript
interface ProTableSettingItem {
  sortRank?: number;
  hidden?: boolean;
  width?: number | string;
  lock?: boolean | string;
}
```

### ProTableSettingMenuItem

```typescript
interface ProTableSettingMenuItem {
  children?: ProTableSettingMenuItem[];
  title?: React.ReactNode;
  defaultSortRank?: number;
  defaultLock?: boolean | string;
  id: string;
}
```

### ProTableSlotProps

```typescript
interface ProTableSlotProps {
  position: ProTableSlotPosition;
}
```

### ProTableSlotsOptions

```typescript
interface ProTableSlotsOptions {
  actionBarLeft?: ReactNode;
  actionBarRight?: ReactNode;
  actionBarBefore?: ReactNode;
  actionBarAfter?: ReactNode;
  table?: ReactNode;
  tableAfter?: ReactNode;
}
```

### TableParams

```typescript
interface TableParams {
  sorters: Record<string, SortValue>;
  searchers: Record<string, string | undefined>;
  filters: Record<string, any[]>;
}
```

### UseProTableServiceParams

```typescript
interface UseProTableServiceParams {
  current: number;
  pageSize: number;
  tableParams: TableParams;
  filterParams: FilterParams;
}
```

### ProTableCellCommonProps

```typescript
interface ProTableCellCommonProps {
  cellDefault?: React.ReactNode;
  cellTooltipMode?: 'ellipsis' | 'none';
}
```

### ProTableRowInstance

```typescript
interface ProTableRowInstance {
  rowKey?: ProTableRowKey;
  rowIndex: number;
  rowRecord: ProTableRowRecord;
}
```

### ProTablePaginationInstance

```typescript
interface ProTablePaginationInstance {
  total: number;
  current: number;
  pageSize: number;
  setCurrent: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}
```

### ProTableInstance

```typescript
interface ProTableInstance {
  rowSelection: ProTableRowSelectionInstance;
}
```

### ProTableColumnProps

继承自: ProTableCellCommonProps, Omit<ColumnProps, 'filters'>

```typescript
interface ProTableColumnProps extends ProTableCellCommonProps, Omit<ColumnProps, 'filters'> {
  key?: string;
  group?: React.ReactNode;
  formatOptions?: string[];
  formatValue?: (value: unknown, rowIndex: number, record: unknown) => unknown;
  formatColor?: ColorType | ((value: unknown) => ColorType) | Record<string, ColorType>;
  onCellClick?: (value: unknown, rowIndex: number, record: unknown) => void;
  dataSource?: AsyncDataSource;
  explanation?: string;
  children?: ProTableColumnProps[];
  searchable?: boolean;
}
```

### SearchParam

```typescript
interface SearchParam {
  keywords: string;
  visible: boolean;
}
```

### FilterParam

```typescript
interface FilterParam {
  selectedKeys: string[];
  visible: boolean;
}
```

### ProTableColumnFilterValue

```typescript
interface ProTableColumnFilterValue {
  keywords?: string;
  sort?: SortValue;
  selectedKeys?: string[];
}
```

### ProTableRowSelectionInstance

```typescript
interface ProTableRowSelectionInstance {
  selectedRowKeys: ProTableRowKey[];
  reverseSelection: boolean;
  currentPageSelectedRowKeys: ProTableRowKey[];
  currentPageRowKeys: ProTableRowKey[];
  hasSelectedRows: () => boolean;
  selectAllPages: (selected: boolean) => void;
  selectCurrentPage: (selected: boolean) => void;
  selectRows: (selected: boolean, rowKeys: ProTableRowKey[]) => void;
  isSelectedRowKey: (rowKey: ProTableRowKey) => boolean;
  getRowKeyByRecord: (rowRecord: ProTableRowRecord) => ProTableRowKey;
}
```

### ActionColumnButton

继承自: Omit<PayloadButtonProps<ProTableRowPayload>, 'disabled' | 'hidden'>

```typescript
interface ActionColumnButton extends Omit<PayloadButtonProps<ProTableRowPayload>, 'disabled' | 'hidden'> {
  key?: string;
  disabled?: boolean | ((payload: ProTableRowPayload) => boolean) | string;
  hidden?: boolean | ((payload: ProTableRowPayload) => boolean) | string;
}
```

### ProTableActionColumnButtons

继承自: Omit<ProTableButtonGroupProps<ProTableRowPayload>, 'dataSource'>

```typescript
interface ProTableActionColumnButtons extends Omit<ProTableButtonGroupProps<ProTableRowPayload>, 'dataSource'> {
  dataSource: ActionColumnButton[];
}
```

### ProTableBaseProps

继承自: ProTableCellCommonProps, Omit<TableProps, 'columns' | 'onSort' | 'rowSelection'>

```typescript
interface ProTableBaseProps extends ProTableCellCommonProps, Omit<TableProps, 'columns' | 'onSort' | 'rowSelection'> {
  columnKey?: 'dataIndex' | 'key';
  columns?: ProTableColumnProps[];
  resizable?: boolean;
  sortMode?: 'single' | 'multiple';
  sort?: Record<string, SortValue>;
  onSort?: (dataIndex: string, order: SortValue, sort: Record<string, SortValue>) => void;
  searchParams?: Record<string, SearchParam>;
  onSearch?: (searchParams: Record<string, SearchParam>) => void;
  filterParams?: Record<string, FilterParam>;
  onFilter?: (filterParams: Record<string, FilterParam>) => void;
  columnFilters?: ProTableColumnsFilterValue;
  onColumnsFilterChange?: (;
  newValue: ProTableColumnsFilterValue,;
  oldValue: ProTableColumnsFilterValue,;
  changedColumnFilterValue?: ProTableColumnFilterValue,;
  changedColumnDataIndex?: string,;
  groupHeader?: React.ReactNode | GroupHeaderProps;
  groupFooter?: React.ReactNode | GroupFooterProps;
  stickyLock?: boolean;
  indexColumn?: boolean;
  indexColumnProps?: Partial<ColumnProps>;
  actionColumnProps?: Partial<ColumnProps>;
  actionColumnButtons?: ProTableActionColumnButtons;
  actionColumn?: ActionColumnButton[];
  actionButtonGroupProps?: ButtonGroupProps;
  actionColumnPredication?: (payload: {;
  actionColumn?: any[];
  index: number;
  record: any;
}
```

### ProTableProps

继承自: ProTableSlotsOptions, Omit<ProTableBaseProps, 'settingProps'>

```typescript
interface ProTableProps extends ProTableSlotsOptions, Omit<ProTableBaseProps, 'settingProps'> {
  actionBarButtons?: ProTableActionBarButtons;
  settingButtons?: ProTableSettingButtonType[] | boolean;
  columnsSetting?: ProTableColumnsSetting;
  defaultColumnsSetting?: ProTableColumnsSetting;
  onColumnsSettingChange?: (;
  newSetting: ProTableColumnsSetting,;
  actionType: ProTableSettingActionType,;
  onFullscreenStateChange?: (fullscreenState: boolean) => void;
  isExpandedChild?: boolean;
  paginationProps?: Record<string, any>;
}
```


## 属性配置

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| addPosition | 'end' \| 'start' | 否 | - | - |
| onSave | (rowIndex: number, record: Record<string, any>, dataSource: any[]) => void | 否 | - | - |
| onRemove | (rowIndex: number, record: Record<string, any>, dataSource: any[]) => void | 否 | - | - |
| onCancel | (rowIndex: number, record: Record<string, any>, dataSource: any[]) => void | 否 | - | - |
| rowIndex | number | 是 | - | - |
| rowRecord | ProTableRowRecord | 是 | - | - |
| actionColumnPredication | ProTableProps['actionColumnPredication'] | 否 | - | - |
| onActionColumnClick | ProTableProps['onActionColumnClick'] | 否 | - | - |
| primaryKey | ProTableProps['primaryKey'] | 是 | - | - |
| buttonGroupProps | ProTableActionColumnButtons | 是 | - | - |
| toolTipMode | 'always' \| 'ellipsis' \| 'none' | 否 | - | - |
| onClick | () => void | 否 | - | - |
| record | any | 是 | - | - |
| value | any | 是 | - | - |
| isIconLeft | boolean | 是 | - | - |
| colIndex | number | 是 | - | - |
| __colIndex | number \| string | 是 | - | 经过锁列调整后的列索引，lock right的列会从非0开始 |
| context | any | 是 | - | - |
| component | 'td' \| 'th' \| 'div' | 是 | - | - |
| innerStyle | object | 是 | - | - |
| type | 'header' \| 'body' | 是 | - | - |
| rowSpan | number | 否 | - | - |
| getCellDomRef | string | 否 | - | - |
| dataKey | string | 是 | - | - |
| __normalized | any | 是 | - | - |
| filterMenuProps | any | 是 | - | - |
| filterProps | any | 是 | - | - |
| expandedIndexSimulate | any | 是 | - | - |
| wordBreak | any | 是 | - | - |
| editCell | any | 是 | - | - |
| indent | number | 是 | - | - |
| sortable | boolean | 否 | - | - |
| sortDirections | SortValue[] | 否 | - | - |
| searchable | boolean | 否 | - | - |
| filters | FilterMenuProps['dataSource'] | 否 | - | - |
| filterMode | FilterMenuProps['selectMode'] | 否 | - | - |
| onClose | () => void | 否 | - | - |
| lock | boolean \| string | 否 | - | - |
| dataIndex | string | 是 | - | - |
| columnFilters | ProTableColumnsFilterValue | 是 | - | - |
| isImmediate | boolean | 否 | - | - |
| rtl | boolean | 否 | - | - |
| dataSource | AsyncDataSource | 否 | - | - |
| iconType | string | 否 | - | - |
| className | string | 否 | - | - |
| onChange | (val: SortValue) => void | 是 | - | - |
| onFullscreenStateChange | (fullscreenState: boolean) => void | 否 | - | - |
| sortOverlayProps | Partial<OverlayProps> | 否 | - | - |
| onToggleShow | (item: ProTableSettingMenuItem, checked: boolean) => void | 是 | - | - |
| onSortEnd | (oldIndex: number, newIndex: number, keys: string[]) => void | 否 | - | - |
| onLock | (id: string, lock: boolean \| string) => void | 否 | - | - |
| parentHidden | boolean | 否 | - | - |
| setting | Record<string, ProTableSettingItem> | 是 | - | - |
| position | ProTableSlotPosition | 是 | - | - |
| cellDefault | React.ReactNode | 否 | - | - |
| cellTooltipMode | 'ellipsis' \| 'none' | 否 | - | - |
| key | string | 否 | - | - |
| group | React.ReactNode | 否 | - | - |
| formatOptions | string[] | 否 | - | - |
| formatValue | (value: unknown, rowIndex: number, record: unknown) => unknown | 否 | - | - |
| formatColor | ColorType \| ((value: unknown) => ColorType) \| Record<string, ColorType> | 否 | - | - |
| onCellClick | (value: unknown, rowIndex: number, record: unknown) => void | 否 | - | - |
| explanation | string | 否 | - | - |
| children | ProTableColumnProps[] | 否 | - | - |
| columnKey | 'dataIndex' \| 'key' | 否 | - | - |
| columns | ProTableColumnProps[] | 否 | - | - |
| resizable | boolean | 否 | - | - |
| sortMode | 'single' \| 'multiple' | 否 | - | - |
| sort | Record<string, SortValue> | 否 | - | - |
| onSort | (dataIndex: string, order: SortValue, sort: Record<string, SortValue>) => void | 否 | - | - |
| searchParams | Record<string, SearchParam> | 否 | - | - |
| onSearch | (searchParams: Record<string, SearchParam>) => void | 否 | - | - |
| filterParams | Record<string, FilterParam> | 否 | - | - |
| onFilter | (filterParams: Record<string, FilterParam>) => void | 否 | - | - |
| onColumnsFilterChange | ( | 否 | - | - |
| newValue | ProTableColumnsFilterValue, | 是 | - | - |
| oldValue | ProTableColumnsFilterValue, | 是 | - | - |
| changedColumnFilterValue | ProTableColumnFilterValue, | 否 | - | - |
| changedColumnDataIndex | string, | 否 | - | - |
| groupHeader | React.ReactNode \| GroupHeaderProps | 否 | - | - |
| groupFooter | React.ReactNode \| GroupFooterProps | 否 | - | - |
| stickyLock | boolean | 否 | - | - |
| indexColumn | boolean | 否 | - | - |
| indexColumnProps | Partial<ColumnProps> | 否 | - | - |
| actionColumnProps | Partial<ColumnProps> | 否 | - | - |
| actionColumnButtons | ProTableActionColumnButtons | 否 | - | - |
| actionColumn | ActionColumnButton[] | 否 | - | - |
| actionButtonGroupProps | ButtonGroupProps | 否 | - | - |
| index | number | 是 | - | - |
| actionBarButtons | ProTableActionBarButtons | 否 | - | - |
| settingButtons | ProTableSettingButtonType[] \| boolean | 否 | - | - |
| columnsSetting | ProTableColumnsSetting | 否 | - | - |
| defaultColumnsSetting | ProTableColumnsSetting | 否 | - | - |
| onColumnsSettingChange | ( | 否 | - | - |
| newSetting | ProTableColumnsSetting, | 是 | - | - |
| actionType | ProTableSettingActionType, | 是 | - | - |
| isExpandedChild | boolean | 否 | - | - |
| paginationProps | Record<string, any> | 否 | - | - |


## 核心方法

| 方法名 | 类型 | 说明 |
|--------|------|------|
| actionColumnButtonsHidden | function | - |
| tableAfter | function | - |
| calcButtonWidth | function | - |
| useActionColumn | function | - |
| useIndexColumn | function | - |
| isSelectedAllPages | function | - |
| hasSelectedRows | function | - |
| useRowSelection | function | - |
| useProTableSelectionTooltip | function | - |
| totalCell | function | - |
| valueCell | function | - |
| getColumnKey | function | - |
| pickTableProps | function | - |
| getVisibleSplitIndex | function | - |
| getColorWithFormat | function | - |
| EditComponent | function | import { Tag } from '@/tag'; |
| TextEditCell | function | - |
| NumberEditCell | function | - |
| DateEditCell | function | - |
| SelectEditCell | function | - |
| useColumnsWithSetting | function | - |
| fn | function | - |
| reduceflatColumns | function | - |
| renderColumns | function | - |
| pickColumnProps | function | - |
| getFormatterOptions | function | - |
| getCellOptions | function | - |
| cellFactory | function | - |
| formatterCellFactory | function | - |
| parseFormatType | function | - |
| trigger | function | - |
| filterTree | function | - |
| onSizeChange | function | - |
| formatItems | function | - |
| getSortRank | function | - |
| isProTableSlot | function | - |
| useProTableSlots | function | - |
| pushSlot | function | - |
| useProTableColumnsValue | function | - |
| useColumnsFilterValue | function | - |
| useColumnsSettingValue | function | - |
| useProTableValue | function | - |
| useProTablePaginationValue | function | - |
| isSelectedAllPages | function | - |
| arrayOmit | function | - |
| arrayUnique | function | - |
| arrayMerge | function | - |
| arrayPick | function | - |
| flatDataSource | function | - |
| useProTableRowSelectionValue | function | - |
| useProTableSettingValue | function | - |


## 事件回调

| 事件名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| onSave | callback | rowIndex: number, record: Record<string, any>, dataSource: any[] | onSave 回调函数 |
| onRemove | callback | rowIndex: number, record: Record<string, any>, dataSource: any[] | onRemove 回调函数 |
| onCancel | callback | rowIndex: number, record: Record<string, any>, dataSource: any[] | onCancel 回调函数 |
| onWidth | event | - | Width 事件处理函数 |
| onClick | event | - | Click 事件处理函数 |
| onSelect | event | - | Select 事件处理函数 |
| onTooltip | event | - | Tooltip 事件处理函数 |
| onResizeChange | event | - | ResizeChange 事件处理函数 |
| onTreeNodeClick | event | - | TreeNodeClick 事件处理函数 |
| onent | event | - | ent 事件处理函数 |
| onChange | event | - | Change 事件处理函数 |
| onClose | event | - | Close 事件处理函数 |
| onSizeChange | event | - | SizeChange 事件处理函数 |
| onFull | event | - | Full 事件处理函数 |
| onExitFull | event | - | ExitFull 事件处理函数 |
| onFullscreenStateChange | callback | fullscreenState: boolean | onFullscreenStateChange 回调函数 |
| onToggleShow | callback | item: ProTableSettingMenuItem, checked: boolean | onToggleShow 回调函数 |
| onSortEnd | callback | oldIndex: number, newIndex: number, keys: string[] | onSortEnd 回调函数 |
| onLock | callback | id: string, lock: boolean | string | onLock 回调函数 |
| onValue | event | - | Value 事件处理函数 |
| onFilter | event | - | Filter 事件处理函数 |
| onSort | event | - | Sort 事件处理函数 |
| onExpand | event | - | Expand 事件处理函数 |
| onCellClick | callback | value: unknown, rowIndex: number, record: unknown | onCellClick 回调函数 |
| onSearch | callback | searchParams: Record<string, SearchParam> | onSearch 回调函数 |


## 自定义 Hooks

| Hook 名称 | 类型 | 说明 |
|-----------|------|------|
| useProTableSlots | usage | 使用 useProTableSlots Hook |
| useColumnsFilterValue | usage | 使用 useColumnsFilterValue Hook |
| useColumnsSettingValue | usage | 使用 useColumnsSettingValue Hook |
| useProTableSettingValue | usage | 使用 useProTableSettingValue Hook |
| useProTableValue | usage | 使用 useProTableValue Hook |
| useProTableColumnsValue | usage | 使用 useProTableColumnsValue Hook |
| useProTableRowSelectionValue | usage | 使用 useProTableRowSelectionValue Hook |
| useContext | usage | 使用 useContext Hook |
| useMemo | usage | 使用 useMemo Hook |
| useActionColumn | hook | - |
| useI18nBundle | usage | 使用 useI18nBundle Hook |
| usePersistFn | usage | 使用 usePersistFn Hook |
| useIndexColumn | hook | - |
| useRowSelection | hook | - |
| useProTableSelectionTooltip | hook | - |
| useColumnsWithSetting | usage | 使用 useColumnsWithSetting Hook |
| usePayloadButtons | usage | 使用 usePayloadButtons Hook |
| useColumnsWithSetting | hook | - |
| useDataSource | usage | 使用 useDataSource Hook |
| useRef | usage | 使用 useRef Hook |
| useProTableSlots | hook | - |
| useCallback | usage | 使用 useCallback Hook |
| useProTableColumnsValue | hook | - |
| useColumnsFilterValue | hook | - |
| useColumnsSettingValue | hook | - |
| useProTableValue | hook | - |
| useProTablePaginationValue | hook | - |
| useProTableRowSelectionValue | hook | - |
| useProTableSettingValue | hook | - |
| useDebounceFn | usage | 使用 useDebounceFn Hook |
| useFusionTable | usage | 使用 useFusionTable Hook |


## 子组件

| 组件名 | 说明 |
|--------|------|
| EditTable | - |
| EditComponent | import { Tag } from '@/tag'; |
| TextEditCell | - |
| NumberEditCell | - |
| DateEditCell | - |
| SelectEditCell | - |

## 使用示例

### 基础用法

```jsx
import { ProTable } from '@alilc/lowcode-materials';

const BasicExample = () => {
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      searchable: true
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      formatType: 'digit'
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      formatType: 'link'
    }
  ];

  const dataSource = [
    { id: 1, name: '张三', age: 25, email: 'zhangsan@example.com' },
    { id: 2, name: '李四', age: 30, email: 'lisi@example.com' }
  ];

  return (
    <ProTable
      columns={columns}
      dataSource={dataSource}
      primaryKey="id"
      pagination={{ pageSize: 10 }}
    />
  );
};
```

### 高级用法

```jsx
const AdvancedExample = () => {
  const { tableProps, filterProps } = useProTable({
    service: fetchTableData,
    defaultParams: { current: 1, pageSize: 10 }
  });

  const columns = [
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      searchable: true,
      filters: [
        { text: '电子产品', value: 'electronics' },
        { text: '服装', value: 'clothing' }
      ]
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      formatType: 'money',
      formatOptions: { currency: 'CNY' }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      formatType: 'tag',
      formatColor: (value) => value === 'active' ? 'green' : 'red'
    }
  ];

  const actionButtons = [
    {
      key: 'edit',
      text: '编辑',
      onClick: (record) => handleEdit(record)
    },
    {
      key: 'delete',
      text: '删除',
      onClick: (record) => handleDelete(record)
    }
  ];

  return (
    <ProTable
      {...tableProps}
      {...filterProps}
      columns={columns}
      indexColumn
      settingButtons
      actionColumnButtons={{ dataSource: actionButtons }}
      rowSelection={{
        onChange: (keys, rows) => console.log('选中:', keys, rows)
      }}
    />
  );
};
```

### 插槽使用

```jsx
const SlotExample = () => {
  return (
    <ProTable columns={columns} dataSource={dataSource}>
      <ProTableSlot position="tableBarBefore">
        <div>表格前置内容</div>
      </ProTableSlot>
      
      <ProTableSlot position="tableToolBarAfter">
        <Button type="primary">自定义按钮</Button>
      </ProTableSlot>
      
      <ProTableSlot position="tableAfter">
        <div>表格后置内容</div>
      </ProTableSlot>
    </ProTable>
  );
};
```

## 最佳实践

### 1. 列配置优化

```typescript
// 推荐的列配置方式
const optimizedColumns = [
  {
    title: '用户信息',
    children: [
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
        width: 120,
        searchable: true,
        explanation: '用户的真实姓名'
      },
      {
        title: '头像',
        dataIndex: 'avatar',
        key: 'avatar',
        width: 80,
        formatType: 'image',
        formatOptions: { width: 40, height: 40 }
      }
    ]
  }
];
```

### 2. 性能优化建议

```typescript
// 大数据量优化
const performanceConfig = {
  // 启用虚拟滚动
  useVirtual: true,
  // 固定行高
  rowHeight: 40,
  // 缓存渲染结果
  cache: true,
  // 延迟加载
  lazy: true,
  // 分页大小控制
  pagination: { pageSize: 50, showSizeChanger: true }
};
```

### 3. 错误处理

```typescript
const errorHandling = {
  onError: (error) => {
    console.error('表格错误:', error);
    // 显示错误提示
    Message.error('数据加载失败，请重试');
  },
  fallback: <div>数据加载失败</div>
};
```

## 常见问题

### Q: 如何自定义单元格渲染？

A: 使用 `cell` 属性或 `formatType` + `formatValue`：

```typescript
const customColumn = {
  title: '自定义列',
  dataIndex: 'custom',
  cell: (value, index, record) => (
    <div style={{ color: 'red' }}>{value}</div>
  )
};

// 或者使用格式化
const formattedColumn = {
  title: '格式化列',
  dataIndex: 'amount',
  formatType: 'money',
  formatValue: (value) => value * 100
};
```

### Q: 如何实现表格数据的实时更新？

A: 使用 `refresh` 方法或重新设置 `dataSource`：

```typescript
const { tableProps, refresh } = useProTable({
  service: fetchData
});

// 定时刷新
useEffect(() => {
  const timer = setInterval(refresh, 30000);
  return () => clearInterval(timer);
}, [refresh]);
```

### Q: 如何处理表格的加载状态？

A: ProTable 会自动管理加载状态，也可以手动控制：

```typescript
const [loading, setLoading] = useState(false);

const handleRefresh = async () => {
  setLoading(true);
  try {
    await fetchData();
  } finally {
    setLoading(false);
  }
};

<ProTable loading={loading} {...otherProps} />
```

## 更新日志

- **v1.0.24-21**: 
  - 新增插槽系统支持
  - 优化列设置功能
  - 修复虚拟滚动问题
  - 增强类型定义

- **v1.0.23**: 
  - 新增树形表格支持
  - 优化性能和内存使用
  - 修复筛选面板问题

- **v1.0.22**: 
  - 新增可编辑表格功能
  - 支持行内编辑
  - 优化移动端适配

## 格式化类型

- **link**: 链接格式
- **money**: 金额格式
- **currency**: 货币格式
- **progress**: 进度条格式
- **date**: 日期格式

## 注意事项

1. `dataSource` 的结构需要与 `columns` 配置保持一致
2. `primaryKey` 值在数据中必须唯一
3. 树状表格需要设置 `isTree: true` 并在数据中包含 `children` 字段
4. 操作按钮的配置需要与实际业务逻辑结合
5. 分页功能需要后端配合实现数据分页逻辑

## 相关组件

- Table: 基础表格组件
- Pagination: 分页组件
- Button: 按钮组件