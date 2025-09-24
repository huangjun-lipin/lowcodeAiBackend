# 高级表单

## 基本信息

- **组件名称**: ProForm
- **组件标题**: 高级表单
- **组件分类**: 表单类
- **组件分组**: 精选组件
- **NPM包**: @alifd/fusion-ui
- **版本**: 0.1.4
- **导出名称**: ProForm

## 组件描述

高级表单是一个表单类组件，属于精选组件。

## 核心接口定义

### ProFormItemProps

继承自: ItemProps

```typescript
interface ProFormItemProps extends ItemProps {
  labelTip?: Record<string, any>;
  componentProps?: Record<string, any>;
  __designMode?: string;
  childForm?: any;
}
```

### AnchorFormProps

```typescript
interface AnchorFormProps {
  children?: React.ReactElement;
  showAnchor?: boolean;
  formMapRef?: any;
  operations?: any;
  operationConfig?: any;
  lastSaveTime?: any;
  anchorProps?: AnchorProps;
  enableRandomHtmlId?: boolean;
}
```

### ChildFormProps

继承自: ProFormProps

```typescript
interface ChildFormProps extends ProFormProps {
  mode?: string;
}
```

### ProFormProps

继承自: FormProps

```typescript
interface ProFormProps extends FormProps {
  columns: number;
  children: React.ReactChild;
  emptyContent: React.ReactNode | string;
  spacing: number;
  operations?: React.ReactNode | object[];
  operationConfig?: object;
  lastSaveTime?: number;
  device?: string;
}
```

### StepFormProps

继承自: StepProps

```typescript
interface StepFormProps extends StepProps {
  children?: React.ReactElement;
  onPrevious?: Function;
  onNext?: Function;
  formRef?: React.MutableRefObject<any | undefined>;
  formMapRef?: React.MutableRefObject<any | undefined>;
  operations?: any[];
  operationConfig?: Record<string, any>;
  lastSaveTime?: Number;
}
```

### StepFormItemProps

继承自: ItemProps

```typescript
interface StepFormItemProps extends ItemProps {
  stepItemProps?: React.ReactNode;
}
```


## 属性配置

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| labelTip | Record<string, any> | 否 | - | - |
| componentProps | Record<string, any> | 否 | - | - |
| __designMode | string | 否 | - | - |
| childForm | any | 否 | - | - |
| children | React.ReactElement | 否 | - | - |
| showAnchor | boolean | 否 | - | - |
| formMapRef | any | 否 | - | - |
| operations | any | 否 | - | - |
| operationConfig | any | 否 | - | - |
| lastSaveTime | any | 否 | - | - |
| anchorProps | AnchorProps | 否 | - | - |
| enableRandomHtmlId | boolean | 否 | - | - |
| mode | string | 否 | - | - |
| columns | number | 是 | - | - |
| emptyContent | React.ReactNode \| string | 是 | - | - |
| spacing | number | 是 | - | - |
| device | string | 否 | - | - |
| onPrevious | Function | 否 | - | - |
| onNext | Function | 否 | - | - |
| formRef | React.MutableRefObject<any \| undefined> | 否 | - | - |
| stepItemProps | React.ReactNode | 否 | - | - |


## 核心方法

| 方法名 | 类型 | 说明 |
|--------|------|------|
| FormInput | function | - |
| finalValue | function | - |
| wrapper | function | - |
| WrappedComponent | function | - |
| AnchorContainer | function | - |
| renderAnchor | function | - |
| renderForm | function | - |
| AnchorForm | function | - |
| ChildForm | function | - |
| getVisibleChildren | function | - |
| noop | function | - |
| getAction | function | - |
| renderStep | function | - |
| content | function | - |
| renderForm | function | - |
| renderOperations | function | - |
| StepForm | function | - |


## 事件回调

| 事件名 | 类型 | 参数 | 说明 |
|--------|------|------|------|
| onent | event | - | ent 事件处理函数 |
| ontent | event | - | tent 事件处理函数 |
| ons | event | - | s 事件处理函数 |


## 子组件

| 组件名 | 说明 |
|--------|------|
| FormInput | - |
| WrappedComponent | - |
| ChildForm | - |

## 使用示例

暂无使用示例

## 注意事项

1. 请确保正确引入组件依赖
2. 注意组件的属性类型和默认值
3. 根据实际业务需求配置相关属性

---
*此文档由脚本自动生成，基于组件meta配置文件*
