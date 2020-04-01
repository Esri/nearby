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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/core/Handles", "dojo/i18n!../nls/resources", "esri/widgets/support/widget", "esri/widgets/Slider"], function (require, exports, __extends, __decorate, decorators_1, Widget_1, Handles_1, i18n, widget_1, Slider_1) {
    "use strict";
    Widget_1 = __importDefault(Widget_1);
    Handles_1 = __importDefault(Handles_1);
    Slider_1 = __importDefault(Slider_1);
    var CSS = {
        panel: 'panel',
        panelNoBorder: 'panel-no-border',
        refinePanel: 'panel-refine-results',
        filterButton: 'filter-button',
        filterIcon: 'icon-ui-filter',
        buttonLink: 'btn-link',
        button: 'btn',
        hide: 'hide'
    };
    var RefineResults = /** @class */ (function (_super) {
        __extends(RefineResults, _super);
        //--------------------------------------------------------------------------
        //
        //  Public Methods
        //
        //--------------------------------------------------------------------------
        function RefineResults(props) {
            var _this = _super.call(this) || this;
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
            var config = this.base.config;
            var filterButton = config.filters ? widget_1.tsx("button", { bind: this, onclick: this.showFilters, class: this.classes(CSS.filterButton, CSS.filterIcon, CSS.button, CSS.buttonLink), title: i18n.tools.filter }) : null;
            var filterPanel = config.filters ? widget_1.tsx("div", { bind: this, afterCreate: this._storeNode, class: this.classes(CSS.hide, CSS.panel, CSS.panelNoBorder) }, "TODO: Filter will go here") : null;
            var filterClass = config.filters ? "filters" : "no-filter";
            return (widget_1.tsx("div", null,
                widget_1.tsx("div", { class: this.classes(CSS.panel, CSS.refinePanel, CSS.panelNoBorder, filterClass) },
                    filterButton,
                    widget_1.tsx("div", { bind: this, afterCreate: this._createSlider })),
                filterPanel));
        };
        RefineResults.prototype._createSlider = function (node) {
            var _this = this;
            var _a = this.base.config, distance = _a.distance, units = _a.units, minDistance = _a.minDistance, maxDistance = _a.maxDistance, precision = _a.precision, labelInputsEnabled = _a.labelInputsEnabled, rangeLabelInputsEnabled = _a.rangeLabelInputsEnabled;
            var distanceSlider = new Slider_1.default({
                min: minDistance,
                max: maxDistance,
                values: [distance],
                precision: precision,
                visibleElements: {
                    labels: true,
                    rangeLabels: true
                },
                labelInputsEnabled: labelInputsEnabled,
                rangeLabelInputsEnabled: rangeLabelInputsEnabled,
                snapOnClickEnabled: true,
                container: node
            });
            this.slider = distanceSlider;
            var convertedUnits = i18n.units[units];
            convertedUnits = convertedUnits ? convertedUnits.abbr : "mi";
            var locale = this.base.locale;
            locale = locale || "en";
            // Append units to range labels
            distanceSlider.labelFormatFunction = function (value, type) {
                if (type === "min" || type === "max") {
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
        RefineResults.prototype.showFilters = function () {
            this._filterPanelNode && this._filterPanelNode.classList.toggle(CSS.hide);
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
                if (min && min.toString().length > 4 || max && max.toString().length > 4) {
                    minInput.classList.add("bottom-label");
                    maxInput.classList.add("bottom-label");
                }
                else {
                    minInput.classList.remove("bottom-label");
                    maxInput.classList.remove("bottom-label");
                }
            }
        };
        __decorate([
            decorators_1.property()
        ], RefineResults.prototype, "base", void 0);
        __decorate([
            decorators_1.property()
        ], RefineResults.prototype, "slider", void 0);
        __decorate([
            decorators_1.property()
        ], RefineResults.prototype, "value", void 0);
        RefineResults = __decorate([
            decorators_1.subclass('app.RefineResults')
        ], RefineResults);
        return RefineResults;
    }(decorators_1.declared(Widget_1.default)));
    return RefineResults;
});
//# sourceMappingURL=RefineResults.js.map