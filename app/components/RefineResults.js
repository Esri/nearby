var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/core/Handles", "dojo/i18n!../nls/resources", "esri/widgets/support/widget", "esri/intl", "esri/widgets/Slider"], function (require, exports, decorators_1, Widget_1, Handles_1, i18n, widget_1, intl_1, Slider_1) {
    "use strict";
    Widget_1 = __importDefault(Widget_1);
    Handles_1 = __importDefault(Handles_1);
    Slider_1 = __importDefault(Slider_1);
    var CSS = {
        panel: "panel",
        panelNoBorder: "panel-no-border",
        refinePanel: "panel-refine-results",
        filterButton: "filter-button",
        filterIcon: "icon-ui-filter",
        buttonLink: "btn-link",
        button: "btn",
        hide: "hide"
    };
    var RefineResults = /** @class */ (function (_super) {
        __extends(RefineResults, _super);
        //--------------------------------------------------------------------------
        //
        //  Public Methods
        //
        //--------------------------------------------------------------------------
        function RefineResults(props) {
            var _this = _super.call(this, props) || this;
            //--------------------------------------------------------------------------
            //
            // Variables
            //
            //--------------------------------------------------------------------------
            _this._handles = new Handles_1.default();
            _this._filterPanelNode = null;
            return _this;
        }
        RefineResults.prototype.render = function () {
            return (widget_1.tsx("div", null,
                widget_1.tsx("div", { class: this.classes(CSS.panel, CSS.refinePanel, CSS.panelNoBorder) },
                    widget_1.tsx("div", { bind: this, afterCreate: this._createSlider }))));
        };
        RefineResults.prototype._createSlider = function (node) {
            var _this = this;
            var _a = this.config, searchUnits = _a.searchUnits, sliderRange = _a.sliderRange, precision = _a.precision, inputsEnabled = _a.inputsEnabled;
            var minimum = sliderRange.minimum, maximum = sliderRange.maximum;
            var distanceSlider = new Slider_1.default({
                min: minimum,
                max: maximum,
                values: [sliderRange.default],
                precision: parseInt(precision),
                visibleElements: {
                    labels: true,
                    rangeLabels: true
                },
                labelInputsEnabled: inputsEnabled,
                rangeLabelInputsEnabled: inputsEnabled,
                snapOnClickEnabled: true,
                container: node
            });
            this.slider = distanceSlider;
            var locale = intl_1.getLocale();
            // Append units to range labels   
            this.slider.labelFormatFunction = function (value, type) {
                var convertedUnits = i18n.units[searchUnits];
                convertedUnits = convertedUnits ? convertedUnits.abbr : "mi";
                //type can be min, max, value 
                if (type == "value") {
                    return value.toLocaleString(locale) + " " + convertedUnits;
                }
                else {
                    return value.toLocaleString(locale);
                }
            };
            // Take locale into account
            distanceSlider.inputFormatFunction = function (value) {
                return value.toLocaleString(locale);
            };
            this._handles.remove(["slider,adjust"]);
            this._handles.add(distanceSlider.watch("values", function (value) {
                // this.config.distance = value;
                if (distanceSlider.state === "ready") {
                    _this.value = value[0];
                }
            }), "slider");
            distanceSlider.on("thumb-drag", function (e) {
                if (e.state === "stop") {
                    _this.value = e.value;
                }
            });
            this._adjustLabels();
            this._handles.add(distanceSlider.watch(["max", "min"], function () { return _this._adjustLabels; }), "adjust");
            return distanceSlider;
        };
        RefineResults.prototype.destroy = function () {
            this._handles.removeAll();
        };
        RefineResults.prototype._storeNode = function (node) {
            this._filterPanelNode = node;
        };
        RefineResults.prototype._adjustLabels = function () {
            // Move label down so it doesn't look so smushed 
            // when we have more than 4 numbers
            if (this.slider) {
                var _a = this.slider, max = _a.max, min = _a.min;
                var container = this.slider.container;
                var maxInput = container.querySelector(".esri-slider__max");
                var minInput = container.querySelector(".esri-slider__min");
                if ((min === null || min === void 0 ? void 0 : min.toString().length) > 4 || max && max.toString().length > 4) {
                    minInput === null || minInput === void 0 ? void 0 : minInput.classList.add("bottom-label");
                    maxInput === null || maxInput === void 0 ? void 0 : maxInput.classList.add("bottom-label");
                }
                else {
                    minInput === null || minInput === void 0 ? void 0 : minInput.classList.remove("bottom-label");
                    maxInput === null || maxInput === void 0 ? void 0 : maxInput.classList.remove("bottom-label");
                }
            }
        };
        RefineResults.prototype.updateSliderProps = function (propertyName, value) {
            var _a, _b;
            if (this.slider) {
                if (propertyName === "sliderRange") {
                    if ((value === null || value === void 0 ? void 0 : value.default) !== this.slider.values[0]) {
                        this.slider.values = [this.config.sliderRange.default];
                    }
                }
                if (propertyName === "sliderRange" && (value === null || value === void 0 ? void 0 : value.maximum) !== this.slider.max) {
                    this.slider.max = (_a = this.config.sliderRange) === null || _a === void 0 ? void 0 : _a.maximum;
                }
                if (propertyName === "minDistance" && (value === null || value === void 0 ? void 0 : value.minimum) !== this.slider.min) {
                    this.slider.min = (_b = this.config.sliderRange) === null || _b === void 0 ? void 0 : _b.minimum;
                }
                if (propertyName === "inputsEnabled") {
                    this.slider.labelInputsEnabled = this.config.inputsEnabled;
                    this.slider.rangeLabelInputsEnabled = this.config.inputsEnabled;
                }
                if (propertyName === "searchUnits") {
                    // update labels 
                    var locale_1 = intl_1.getLocale();
                    var searchUnits_1 = this.config.searchUnits;
                    if (this.slider) {
                        // Append units to range labels   
                        this.slider.labelFormatFunction = function (value, type) {
                            var convertedUnits = i18n.units[searchUnits_1];
                            convertedUnits = convertedUnits ? convertedUnits.abbr : "mi";
                            if (type === "value") {
                                return value.toLocaleString(locale_1) + " " + convertedUnits;
                            }
                            else {
                                return value.toLocaleString(locale_1);
                            }
                        };
                    }
                }
            }
        };
        __decorate([
            decorators_1.property()
        ], RefineResults.prototype, "config", void 0);
        __decorate([
            decorators_1.property()
        ], RefineResults.prototype, "slider", void 0);
        __decorate([
            decorators_1.property()
        ], RefineResults.prototype, "value", void 0);
        RefineResults = __decorate([
            decorators_1.subclass("app.RefineResults")
        ], RefineResults);
        return RefineResults;
    }((Widget_1.default)));
    return RefineResults;
});
//# sourceMappingURL=RefineResults.js.map