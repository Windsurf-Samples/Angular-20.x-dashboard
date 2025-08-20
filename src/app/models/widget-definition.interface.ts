export interface WidgetDefinition {
  name: string;
  title?: string;
  directive?: string;
  templateUrl?: string;
  template?: string;
  attrs?: Record<string, unknown>;
  dataModelType?: string;
  dataModelOptions?: Record<string, unknown>;
  dataAttrName?: string;
  size?: {
    width?: string;
    height?: string;
    minWidth?: string;
  };
  style?: Record<string, unknown>;
}

export interface WidgetInstance {
  name: string;
  title: string;
  style?: Record<string, unknown>;
  size?: {
    width?: string;
    height?: string;
    minWidth?: string;
  };
  dataModelOptions?: Record<string, unknown>;
  attrs?: Record<string, unknown>;
  containerStyle?: Record<string, unknown>;
  contentStyle?: Record<string, unknown>;
  editingTitle?: boolean;
  enableVerticalResize?: boolean;
}

export interface DashboardOptions {
  widgetButtons?: boolean;
  widgetDefinitions?: WidgetDefinition[];
  defaultWidgets?: WidgetInstance[];
  storage?: Storage;
  storageId?: string;
  storageHash?: string;
  explicitSave?: boolean;
  stringifyStorage?: boolean;
  hideToolbar?: boolean;
  hideWidgetName?: boolean;
  hideWidgetClose?: boolean;
  settingsModalOptions?: Record<string, unknown>;
  onSettingsClose?: Record<string, unknown>;
  onSettingsDismiss?: Record<string, unknown>;
}
