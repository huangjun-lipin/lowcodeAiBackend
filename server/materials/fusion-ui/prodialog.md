# 对话框

## 基本信息

- **组件名称**: ProDialog
- **组件标题**: 对话框
- **组件分类**: 布局容器类
- **组件分组**: 精选组件
- **NPM包**: @alifd/fusion-ui
- **版本**: 0.1.6-beta.23
- **导出名称**: ProDialog

## 组件描述

对话框是一个布局容器类组件，属于精选组件。

## 属性配置

### 主要属性

#### ref
- **描述**: 对话框
- **类型**: 根据配置确定

#### dialogType
- **描述**: 弹窗类型
- **类型**: 根据配置确定

#### status
- **描述**: 提示弹窗
- **类型**: 根据配置确定

#### title
- **描述**: 普通弹窗
- **类型**: 根据配置确定

#### size
- **描述**: 提示状态
- **类型**: 根据配置确定

#### visible
- **描述**: 提醒
- **类型**: 根据配置确定

#### hasTips
- **描述**: 警告
- **类型**: 根据配置确定

#### iconType
- **描述**: 确认
- **类型**: 根据配置确定

#### explanation
- **描述**: 成功
- **类型**: 根据配置确定

#### hasMask
- **描述**: 失败
- **类型**: 根据配置确定




## 核心接口定义

### DialogProps

继承自: NextDialogProps

```typescript
interface DialogProps extends NextDialogProps {
  size?: 'small' | 'medium' | 'large' | 'autoLarge';
  operations?: object[];
  operationConfig?: object;
  status?: string;
  dialogType?: string;
  explanation?: string;
  iconType?: string;
  hasTips?: boolean;
}
```

### DialogOperationsProps

继承自: OperationProps

```typescript
interface DialogOperationsProps extends OperationProps {
  onOk?: any;
  onCancel?: any;
}
```

### DialogState

```typescript
interface DialogState {
  visible?: boolean;
}
```


## 属性配置

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| size | 'small' \| 'medium' \| 'large' \| 'autoLarge' | 否 | - | - |
| operations | object[] | 否 | - | - |
| operationConfig | object | 否 | - | - |
| status | string | 否 | - | - |
| dialogType | string | 否 | - | - |
| explanation | string | 否 | - | - |
| iconType | string | 否 | - | - |
| hasTips | boolean | 否 | - | - |
| onOk | any | 否 | - | - |
| onCancel | any | 否 | - | - |


## 核心方法

| 方法名 | 类型 | 说明 |
|--------|------|------|
| noop | function | - |
| isValidFunction | function | - |
| getAction | function | - |
| DialogOperations | function | - |
| Dialog | function | - |


## 事件回调

| 事件名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| ons | event | - | s 事件处理函数 |
| onOk | event | - | Ok 事件处理函数 |
| onCancel | event | - | Cancel 事件处理函数 |
| onClose | event | - | Close 事件处理函数 |


## 子组件

| 组件名 | 说明 |
|--------|------|
| DialogOperations | - |

## 使用示例

暂无使用示例

## 注意事项

1. 请确保正确引入组件依赖
2. 注意组件的属性类型和默认值
3. 根据实际业务需求配置相关属性

---
*此文档由脚本自动生成，基于组件meta配置文件*
