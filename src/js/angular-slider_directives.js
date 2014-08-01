/**
 * Created by Derek on 7/31/2014.
 */

angular.module('vr.directives.slider')
    .directive('ngSlider', ['$parse', function($parse) {
        return {
            restrict: 'EA',
            controller: 'SliderCtrl',
			scope: true,
            compile: function(elem, attr) {
                if(angular.isUndefined(attr.floor)) {
                    throw "ngSlider Error: Floor not specified";
                }
                if(angular.isUndefined(attr.ceiling)) {
                    throw "ngSlider Error: Ceiling not specified";
                }

                elem.addClass('ng-slider');

                return function (scope, elem, attr, ctrl) {
                    attr.$observe('ngDisabled', function(disabled) {
                        ctrl.options.disabled = angular.isDefined(disabled) && disabled;
                    });
                    attr.$observe('ceiling', function(ceiling) {
                        ceiling = angular.isDefined(ceiling)?parseFloat(ceiling):0;
                        scope.ceiling = isNaN(ceiling)?0:ceiling;
                    });
                    attr.$observe('floor', function(floor) {
                        floor = angular.isDefined(floor)?parseFloat(floor):0;
                        scope.floor = isNaN(floor)?0:floor;
                    });
					
					scope.$watch(function() { return $parse(attr.ngSliderOptions); }, function(opts) {
						if(angular.isDefined(opts)) {
							for(var opt in opts) {
								ctrl.options[opt] = opts[opt];
							}
						}
					}, true)
                };
            }
        }
    }])
    .directive('ngSliderKnob', ['$parse', function($parse) {
        return {
            restrict: 'EA',
            require: ['^ngSlider', '^ngModel'],
			scope: true,
            compile: function(elem, attr) {
                if(angular.isUndefined(attr.ngModel)) {
                    throw "ngSliderKnob Error: ngModel not specified";
                }
                elem.addClass('ng-slider-knob');

                return function(scope, elem, attr, ctrls) {
					var ngSliderCtrl = ctrls[0];
					var ngModelCtrl = ctrls[1];
					
					var enabled = true;
					
                    var knob = ngSliderCtrl.registerKnob({
						ngModel: ngModelCtrl,
						elem: elem,
						onChange: function(modelValue, percent) {
							scope.$viewValue = ngSliderCtrl.options.translate(modelValue);
							elem.css('left', percent);
						}
					});
                    elem.bind('$destroy', function() {
                        knob.destroy();
                    });
					
					scope.$watch(function() { return $parse(attr.ngDisabled); }, function(disabled) {
						if(disabled) {
							knob.disable();
							enabled = false;
							elem.addClass('disabled');
						} else {
							knob.enable();
							enabled = true;
							elem.removeClass('disabled');
						}
					});

					// Start events
                    angular.forEach(['mousedown', 'touchstart', 'MSPointerStart', 'pointerdown'], function(event) {
                        elem.bind(event, function(ev) {
							if(!scope.ngDisabled && !ngSliderCtrl.disabled) {
								knob.start();
							}
                        });
                    });
                    var moveEvents = ['mousemove', 'touchmove', 'MSPointerMove', 'pointermove'];
                    var cancelEvents = ['mousecancel', 'touchcancel', 'MSPointerCancel', 'pointercancel'];
                    var endEvents = ['mouseup', 'touchend', 'MSPointerUp', 'pointerup'];
                };
            }
        }
    }])
    .directive('ngSliderBar', function() {
        return {
            restrict: 'EA',
            require: ['^ngSlider'],
            link: function(scope, elem, attr, ctrl) {
                ctrl.registerBar(scope, elem);

                elem.bind('$destroy', function() {
                    ctrl.destroyBar(elem);
                });
            }
        }
    })
    .directive('vrSliderGroup', function() {
        return {
            restrict: 'EA'
        }
    });
