export interface Widget {
  title: string;
  name: string;
  style: Record<string, string>;
  size: Record<string, string>;
  attrs?: Record<string, unknown>;
  storageHash?: string;
  framework?: 'angularjs' | 'angular';
}

export interface WidgetDefinition {
  name: string;
  title?: string;
  directive?: string;
  templateUrl?: string;
  template?: string;
  component?: unknown;
  framework: 'angularjs' | 'angular';
}
