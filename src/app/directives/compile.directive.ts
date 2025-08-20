import { Directive, ElementRef, Input, OnChanges, inject } from '@angular/core';

declare const angular: unknown;

@Directive({
  selector: '[appCompile]'
})
export class CompileDirective implements OnChanges {
  @Input() appCompile!: string;
  @Input() widgetData: unknown;

  private el = inject(ElementRef);


  ngOnChanges() {
    if (this.appCompile) {
      const element = (angular as any).element(this.el.nativeElement);
      element.html(`<div ${this.appCompile}></div>`);
      
      const scope = element.scope();
      if (scope && this.widgetData) {
        Object.assign(scope, this.widgetData);
      }
      
      const injector = element.injector();
      if (injector) {
        const $compile = injector.get('$compile');
        $compile(element.contents())(scope);
      }
    }
  }
}
