const angular = window.angular;
const _ = window._;

angular.module('ui.dashboard', [])
  .directive('compile', function($compile) {
    return function(scope, element, attrs) {
      scope.$watch(
        function(scope) {
          return scope.$eval(attrs.compile);
        },
        function(value) {
          element.html(value);
          $compile(element.contents())(scope);
        }
      );
    };
  })
  .factory('WidgetModel', function() {
    var WidgetModel = function WidgetModel(Class, overrides) {
      var defaults = {
        title: 'Widget',
        style: {},
        size: {},
        enableVerticalResize: true,
        containerStyle: { width: '33%' },
        contentStyle: {}
      };
      
      overrides = overrides || {};
      if (angular.isObject(Class)) {
        overrides = Class;
        Class = null;
      }
      
      if (Class && angular.isFunction(Class)) {
        angular.extend(this, new Class());
      }
      
      angular.extend(this, angular.copy(defaults), overrides);
      this.updateContainerStyle();
    };

    WidgetModel.prototype = {
      setWidth: function(width, units) {
        width = width.toString();
        units = units || 'px';
        
        if (width.indexOf('%') > -1) {
          units = '%';
          width = width.replace(/%/g, '');
        }
        
        var widthVal = parseInt(width, 10);
        
        if (units === '%') {
          width = Math.min(100, Math.max(0, widthVal));
          this.widthUnits = '%';
        } else {
          width = Math.max(0, widthVal);
          this.widthUnits = 'px';
        }
        
        this.containerStyle.width = width + this.widthUnits;
        this.updateContainerStyle();
        return this.containerStyle.width;
      },

      setHeight: function(height) {
        this.containerStyle.height = height;
        this.updateContainerStyle();
        return this.containerStyle.height;
      },

      updateContainerStyle: function() {
        angular.extend(this.style, this.containerStyle);
      },

      serialize: function() {
        return _.pick(this, ['title', 'name', 'style', 'size', 'dataModelOptions', 'attrs', 'storageHash']);
      }
    };

    return WidgetModel;
  })
  .factory('DashboardState', function($log, $q) {
    function DashboardState(storage, id, hash, widgetDefinitions, stringify) {
      this.storage = storage;
      this.id = id;
      this.hash = hash;
      this.widgetDefinitions = widgetDefinitions;
      this.stringify = stringify;
    }

    DashboardState.prototype = {
      save: function(widgets) {
        if (!this.storage) {
          return true;
        }

        var serialized = _.map(widgets, function(widget) {
          return widget.serialize();
        });

        var item = angular.toJson(serialized);
        var res = this.storage.setItem(this.id, item);
        return res;
      },

      load: function() {
        if (!this.storage) {
          return null;
        }

        var serialized;
        try {
          var item = this.storage.getItem(this.id);
          if (item) {
            serialized = angular.fromJson(item);
          }
        } catch (e) {
          $log.warn('Malformed dashboard state in storage', e);
        }

        return serialized;
      }
    };

    return DashboardState;
  })
  .directive('dashboard', function($log, WidgetModel, DashboardState) {
    return {
      restrict: 'A',
      template: `
        <div class="dashboard-widget-area">
          <div class="btn-toolbar" ng-if="options.widgetButtons">
            <div class="btn-group" ng-repeat="widget in options.widgetDefinitions">
              <button type="button" class="btn btn-primary" ng-click="addWidget(widget)">
                Add {{widget.title}}
              </button>
            </div>
          </div>
          <div ui-sortable="sortableOptions" ng-model="widgets" class="dashboard-widget-container">
            <div ng-repeat="widget in widgets" class="widget-container" ng-style="widget.containerStyle">
              <div class="widget">
                <div class="widget-header">
                  <h3 class="widget-title">{{widget.title}}</h3>
                  <div class="widget-icons">
                    <a href="#" ng-click="removeWidget(widget)" ng-if="!options.hideWidgetClose">×</a>
                  </div>
                </div>
                <div class="widget-content">
                  <div app-compile="widget.directive" ng-if="widget.directive"></div>
                  <div ng-if="widget.template" app-compile="widget.template"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
      scope: {
        options: '=dashboard'
      },
      controller: function($scope) {
        var defaults = {
          stringifyStorage: true,
          hideWidgetSettings: false,
          hideWidgetClose: false,
          settingsModalOptions: {
            templateUrl: 'template/widget-settings-template.html',
            controller: 'WidgetSettingsCtrl'
          },
          onSettingsClose: function(result, widget) { },
          onSettingsDismiss: function(reason) { }
        };

        $scope.options = angular.extend({}, defaults, $scope.options);
        $scope.widgets = [];
        $scope.sortableOptions = {
          stop: function() {
            $scope.saveDashboard();
          },
          handle: '.widget-header'
        };

        var dashboardState = new DashboardState(
          $scope.options.storage,
          $scope.options.storageId,
          $scope.options.storageHash,
          $scope.options.widgetDefinitions,
          $scope.options.stringifyStorage
        );

        $scope.addWidget = function(widgetDef, doNotSave) {
          var defaultWidgetDefinition = _.find($scope.options.widgetDefinitions, { name: widgetDef.name });
          if (!defaultWidgetDefinition) {
            throw 'Widget ' + widgetDef.name + ' is not found.';
          }

          var widget = new WidgetModel(defaultWidgetDefinition, widgetDef);
          $scope.widgets.push(widget);

          if (!doNotSave) {
            $scope.saveDashboard();
          }

          return widget;
        };

        $scope.removeWidget = function(widget) {
          var index = $scope.widgets.indexOf(widget);
          if (index >= 0) {
            $scope.widgets.splice(index, 1);
            $scope.saveDashboard();
          }
        };

        $scope.saveDashboard = function() {
          dashboardState.save($scope.widgets);
        };

        $scope.loadDashboard = function() {
          var savedWidgets = dashboardState.load();
          if (savedWidgets && savedWidgets.length) {
            _.each(savedWidgets, function(widgetDef) {
              $scope.addWidget(widgetDef, true);
            });
          } else if ($scope.options.defaultWidgets) {
            _.each($scope.options.defaultWidgets, function(widgetDef) {
              $scope.addWidget(widgetDef, true);
            });
          }
        };

        $scope.loadDashboard();
      }
    };
  });

angular.module('app', ['ui.dashboard'])
  .factory('widgetDefinitions', function() {
    return [
      {
        name: 'time',
        directive: 'wt-time',
        title: 'Current Time'
      },
      {
        name: 'angular-time',
        directive: 'app-time-widget',
        title: 'Angular Time Widget'
      },
      {
        name: 'random',
        directive: 'wt-scope-watch',
        title: 'Random Number',
        attrs: {
          value: 'randomValue'
        }
      }
    ];
  })
  .value('defaultWidgets', [
    { name: 'time' },
    { name: 'angular-time' },
    { name: 'random' }
  ])
  .directive('wtTime', function($interval) {
    return {
      restrict: 'A',
      template: '<div class="time-widget"><h4>AngularJS Time</h4><div class="time-display">{{ currentTime | date:"medium" }}</div></div>',
      link: function(scope) {
        scope.currentTime = new Date();
        var timer = $interval(function() {
          scope.currentTime = new Date();
        }, 1000);
        
        scope.$on('$destroy', function() {
          $interval.cancel(timer);
        });
      }
    };
  })
  .directive('wtScopeWatch', function($interval) {
    return {
      restrict: 'A',
      template: '<div class="random-widget"><h4>Random Value</h4><div class="value-display">{{ value | number:3 }}</div></div>',
      scope: {
        value: '='
      }
    };
  })
  .controller('DashboardCtrl', function($scope, $interval, widgetDefinitions, defaultWidgets) {
    $scope.dashboardOptions = {
      widgetButtons: true,
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets,
      storage: window.localStorage,
      storageId: 'hybrid_dashboard'
    };

    $scope.randomValue = Math.random();
    $interval(function() {
      $scope.randomValue = Math.random();
    }, 500);
  });
