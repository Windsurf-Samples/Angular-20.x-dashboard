export interface Widget {
  title: string;
  name: string;
  style: Record<string, string>;
  size: Record<string, string>;
  attrs?: Record<string, unknown>;
  storageHash?: string;
  framework?: 'angularjs' | 'angular';
  enableVerticalResize?: boolean;
  containerStyle: Record<string, string>;
  contentStyle: Record<string, string>;
  directive?: string;
  templateUrl?: string;
  template?: string;
  editingTitle?: boolean;
  dataModelOptions?: Record<string, unknown>;
  widthUnits?: string;
  resizeTimeout?: number;
}

export interface WidgetDefinition {
  name: string;
  title?: string;
  directive?: string;
  templateUrl?: string;
  template?: string;
  component?: unknown;
  framework: 'angularjs' | 'angular';
  storageHash?: string;
}
