# 组件总览

本文档提供所有低代码物料组件的快速查找和分类信息。

## 统计信息

- **总组件数量**: 134个
- **Fusion UI 高级组件**: 36个
- **Fusion Lowcode Materials 基础组件**: 98个

## 快速查找

### 按功能分类

#### 📝 表单输入类
**基础组件 (fusion-lowcode-materials)**
- `input` - 输入框
- `input-password` - 密码输入框  
- `input-text-area` - 文本域
- `select` - 选择器
- `checkbox` - 复选框
- `checkbox-group` - 复选框组
- `radio` - 单选框
- `radio-group` - 单选框组
- `switch` - 开关
- `slider` - 滑块
- `rating` - 评分
- `upload` - 上传
- `cascader` - 级联选择
- `tree-select` - 树选择
- `date-picker` - 日期选择器
- `time-picker` - 时间选择器
- `range-picker` - 范围选择器
- `month-picker` - 月份选择器
- `year-picker` - 年份选择器
- `week-picker` - 周选择器

**高级组件 (fusion-ui)**
- `pro-form` - 高级表单
- `step-form` - 分步表单
- `form-*` 系列 - 表单项组件

#### 📊 数据展示类
**基础组件**
- `table` - 表格
- `table-column` - 表格列
- `card` - 卡片
- `list` - 列表
- `avatar` - 头像
- `badge` - 徽标
- `tag` - 标签
- `progress` - 进度条
- `tree` - 树形控件
- `calendar` - 日历
- `range-calendar` - 范围日历

**高级组件**
- `pro-table` - 高级表格
- `pro-table-slot` - 表格插槽
- `expand-table` - 可展开表格
- `edit-table` - 可编辑表格
- `pie-chart` - 饼图

#### 🧭 导航类
**基础组件**
- `menu` - 菜单
- `menu-item` - 菜单项
- `menu-group` - 菜单组
- `menu-divider` - 菜单分割线
- `menu-button` - 菜单按钮
- `nav` - 导航
- `sub-nav` - 子导航
- `breadcrumb` - 面包屑
- `breadcrumb-item` - 面包屑项
- `pagination` - 分页
- `tabs` - 标签页
- `tab-item` - 标签项
- `anchor` - 锚点

**高级组件**
- `tab-container` - 标签容器
- `page-header` - 页头

#### 💬 反馈类
**基础组件**
- `dialog` - 对话框
- `drawer` - 抽屉
- `message` - 消息
- `toast` - 提示
- `notification` - 通知
- `alert` - 警告提示
- `loading` - 加载中
- `balloon` - 气泡

**高级组件**
- `pro-dialog` - 高级对话框
- `pro-drawer` - 高级抽屉

#### 🎛️ 通用控件类
**基础组件**
- `button` - 按钮
- `button-group` - 按钮组
- `icon` - 图标
- `typography` - 排版
- `paragraph` - 段落
- `divider` - 分割线
- `grid` - 栅格
- `collapse` - 折叠面板
- `collapse-panel` - 折叠面板项
- `dropdown` - 下拉菜单
- `dropdown-item` - 下拉菜单项

#### 📦 容器布局类
**基础组件**
- `form` - 表单容器
- `form-item` - 表单项
- `group` - 分组
- `box` - 盒子容器

**高级组件**
- `filter` - 筛选器
- `filter-item` - 筛选项

#### 🔧 其他工具类
**基础组件**
- `affix` - 固钉
- `back-top` - 回到顶部
- `config-provider` - 配置提供者
- `error-boundary` - 错误边界

**高级组件**
- `story-placeholder` - 故事占位符

### 按复杂度分类

#### 🔰 基础组件 (fusion-lowcode-materials)
适用于基础UI构建，提供原子级别的组件能力：
- 单一职责，功能明确
- 配置简单，易于使用
- 覆盖基础UI需求

#### 🚀 高级组件 (fusion-ui)
适用于复杂业务场景，提供开箱即用的解决方案：
- 功能丰富，配置灵活
- 内置业务逻辑
- 提升开发效率

### 按使用频率分类

#### 🔥 高频使用
- `button` - 按钮
- `input` - 输入框
- `form` - 表单
- `table` - 表格
- `dialog` - 对话框
- `select` - 选择器
- `card` - 卡片
- `pro-table` - 高级表格
- `pro-form` - 高级表单

#### 📈 中频使用
- `checkbox` - 复选框
- `radio` - 单选框
- `date-picker` - 日期选择器
- `upload` - 上传
- `menu` - 菜单
- `tabs` - 标签页
- `pagination` - 分页
- `drawer` - 抽屉
- `message` - 消息

#### 📊 低频使用
- `affix` - 固钉
- `back-top` - 回到顶部
- `anchor` - 锚点
- `error-boundary` - 错误边界
- `config-provider` - 配置提供者

## 组件关系图

### 表单相关组件关系
```
Form (表单容器)
├── FormItem (表单项)
├── Input (输入框)
├── Select (选择器)
├── Checkbox/Radio (选择组件)
├── DatePicker (日期选择)
├── Upload (上传)
└── Button (提交按钮)

ProForm (高级表单)
├── 包含上述所有基础组件
├── FormXxx 系列高级表单项
└── StepForm (分步表单)
```

### 表格相关组件关系
```
Table (基础表格)
├── TableColumn (表格列)
└── Pagination (分页)

ProTable (高级表格)
├── 包含基础表格功能
├── ProTableSlot (表格插槽)
├── ExpandTable (可展开表格)
└── EditTable (可编辑表格)
```

### 导航相关组件关系
```
Menu (菜单)
├── MenuItem (菜单项)
├── MenuGroup (菜单组)
├── MenuDivider (分割线)
└── MenuButton (菜单按钮)

Nav (导航)
├── SubNav (子导航)
└── Breadcrumb (面包屑)
    └── BreadcrumbItem (面包屑项)

Tabs (标签页)
├── TabItem (标签项)
└── TabContainer (标签容器)
```

## 使用建议

### 选择原则

1. **优先使用高级组件**: 如果有对应的Pro版本，优先选择功能更丰富的高级组件
2. **按需选择复杂度**: 简单场景使用基础组件，复杂业务使用高级组件
3. **保持一致性**: 同一项目中尽量使用同一套组件库的组件

### 常见组合

#### 基础表单页面
```
ProForm + FormInput + FormSelect + FormDatePicker + Button
```

#### 数据管理页面
```
ProTable + Filter + ProDialog + ProForm
```

#### 导航布局
```
Menu + Breadcrumb + PageHeader + Card
```

## 更新记录

- **2024-01**: 初始版本，包含134个组件的完整文档
- **文档生成**: 使用自动化脚本生成，确保信息准确性
- **持续更新**: 随组件库更新同步维护

---

**提示**: 
- 查看具体组件详情请参考对应的组件文档
- 使用指南请参考 `USAGE.md`
- 项目说明请参考 `README.md`