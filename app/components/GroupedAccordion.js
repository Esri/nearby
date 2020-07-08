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
define(["require", "exports", "esri/core/promiseUtils", "./Accordion", "esri/core/accessorSupport/decorators", "esri/widgets/Feature", "esri/core/Handles", "esri/widgets/support/widget"], function (require, exports, promiseUtils_1, Accordion_1, decorators_1, Feature_1, Handles_1, widget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Accordion_1 = __importDefault(Accordion_1);
    Feature_1 = __importDefault(Feature_1);
    Handles_1 = __importDefault(Handles_1);
    var CSS = {
        base: 'accordion',
        basejs: 'js-accordion',
        single: 'single',
        singleSection: 'single-section',
        section: 'accordion-section',
        groupSection: 'group-accordion-section',
        active: 'is-active',
        title: 'accordion-title',
        titleArea: 'title-area',
        titleText: 'title-text',
        count: 'group-accordion-count',
        content: 'accordion-content',
        groupContent: 'group-accordion-content',
        featureGroup: 'feature-group',
        button: 'btn',
        transparentButton: 'btn-transparent',
        smallButton: 'btn-small',
        accordionIcon: 'accordion-icon',
        groupAccordionIcon: 'group-accordion-icon',
        paddingTrailer: 'padding-right-quarter',
        right: 'right',
        actions: 'accordion-actions',
        templateContent: 'template',
        scrollable: "scrollable-content",
        actionBar: 'action-bar',
        flexCount: "flex-count",
        flexArrow: 'flex-arrow'
    };
    var GroupedAccordion = /** @class */ (function (_super) {
        __extends(GroupedAccordion, _super);
        //--------------------------------------------------------------------------
        //
        //  Public Methods
        //
        //--------------------------------------------------------------------------
        function GroupedAccordion(props) {
            var _this = _super.call(this, props) || this;
            _this.zoom = true;
            //--------------------------------------------------------------------------
            //
            // Variables
            //
            //--------------------------------------------------------------------------
            _this._calciteLoaded = false;
            _this._handles = new Handles_1.default();
            _this._featureCount = 0;
            if (props.featureResults) {
                props.featureResults.forEach(function (result) {
                    _this._featureCount += result.features && result.features.length;
                });
            }
            return _this;
        }
        GroupedAccordion.prototype.render = function () {
            var _this = this;
            var _a = this.config, resultsPanelPreText = _a.resultsPanelPreText, resultsPanelPostText = _a.resultsPanelPostText;
            var preText = resultsPanelPreText && this._featureCount > 0 ? this.createPreText() : null;
            var postText = resultsPanelPostText && this._featureCount > 0 ? this.createPostText() : null;
            return (widget_1.tsx("div", { key: "feature-container", class: this.classes(CSS.scrollable), afterCreate: this.updateCalcite },
                preText,
                widget_1.tsx("div", { class: this.classes(CSS.base, CSS.basejs) }, this.featureResults &&
                    this.featureResults.map(function (result, i) { return _this._createSections(result, i); })),
                postText));
        };
        GroupedAccordion.prototype._createSections = function (result, key) {
            var _this = this;
            var count = result.features && result.features.length;
            var classes = count === 1 ? [CSS.section, CSS.single, CSS.groupSection] : [CSS.section, CSS.groupSection];
            var sectionCount = this.featureResults.length || 0;
            if (sectionCount === 1) {
                classes.push(CSS.singleSection);
            }
            // Open section if its the first section and it only has a few 
            // features.  or if there is only one feature in the section
            if ((sectionCount === 1 || (key === 0 && count <= 3))) {
                classes.push(CSS.active);
            }
            // Show the section count in the title area. Don't display if there is only 
            // one section and only one result in that section. 
            var resultCount = null;
            if (this.config.showResultCount) {
                if (sectionCount === 1 || (sectionCount === 1 && count === 1)) {
                    resultCount = null;
                }
                else if (count) {
                    resultCount = widget_1.tsx("div", null,
                        widget_1.tsx("span", { class: this.classes(CSS.count, CSS.flexCount) }, count));
                }
            }
            return (widget_1.tsx("section", { bind: this, role: "menu", key: "section" + key, class: this.classes(classes) },
                widget_1.tsx("h5", { class: CSS.title },
                    widget_1.tsx("div", { class: this.classes(CSS.accordionIcon, CSS.groupAccordionIcon, CSS.flexArrow) },
                        widget_1.tsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 32 32", class: "svg-icon" },
                            widget_1.tsx("path", { d: "M28 9v5L16 26 4 14V9l12 12L28 9z" }))),
                    widget_1.tsx("div", { class: this.classes(CSS.titleArea, CSS.titleText) }, result.title),
                    resultCount),
                widget_1.tsx("ul", { role: 'group', class: this.classes(CSS.templateContent, CSS.content, CSS.groupContent) }, result.features &&
                    result.features.map(function (feature, i) {
                        return (widget_1.tsx("li", { role: 'menuitem', tabindex: "0" },
                            widget_1.tsx("div", { "data-feature": feature, afterCreate: _this._createFeature, class: _this.classes(CSS.featureGroup), bind: _this, key: "feature" + i }),
                            _this.config.showDirections && _this.actionBarItems && _this.actionBarItems.length > 0 ? (widget_1.tsx("nav", { class: _this.classes(CSS.actionBar) }, _this.actionBarItems &&
                                _this.actionBarItems.length > 0 &&
                                _this.actionBarItems.map(function (item) { return _this.createActionItem(item, feature); }))) : null));
                    }))));
        };
        GroupedAccordion.prototype._createFeature = function (node) {
            var _this = this;
            var graphic = node['data-feature'];
            var distNode = document.createElement("span");
            node.appendChild(distNode);
            var container = document.createElement("div");
            node.id = "" + graphic.layer.id + graphic.attributes[graphic.layer.objectIdField];
            var feature = new Feature_1.default({
                graphic: graphic,
                defaultPopupTemplateEnabled: true,
                map: this.view.map,
                spatialReference: this.view.spatialReference,
                container: container
            });
            node.appendChild(container);
            // Set the count and then update with title if we have one 
            if (graphic && graphic.attributes && graphic.attributes.lookupDistance && this.config.includeDistance) {
                distNode.innerHTML = this.convertUnitText(graphic.attributes.lookupDistance, this.config.searchUnits);
            }
            // Add click event if results are interactive 
            var clickableResults = this.config.interactiveResults === false ? false : true;
            if (clickableResults) {
                node.addEventListener("click", function () {
                    _this.zoom = true;
                    _this._selectAccordionSection(node.parentElement, graphic);
                });
                node.addEventListener("mouseover", promiseUtils_1.debounce(function () {
                    _this.hoveredItem = feature;
                }));
            }
        };
        GroupedAccordion.prototype.clear = function () {
            this.featureResults = null;
        };
        GroupedAccordion.prototype.showToggle = function () {
            // show toggle buttons if we have more than 1 sections? 
            return this.featureResults && this.featureResults.length && this.featureResults.length > 1;
        };
        GroupedAccordion.prototype.findAccordionItem = function (results) {
            var _this = this;
            var found = false;
            results.results.forEach(function (result) {
                // User has clicked a feature on the map
                // Check to see if we have a matching item in list and 
                // if so active the section and scroll 
                var graphic = result.graphic;
                if (graphic && graphic.attributes) {
                    var layer_1 = result.graphic.layer;
                    var idField_1 = layer_1 && layer_1.objectIdField || null;
                    var val_1 = graphic.attributes[idField_1];
                    _this.featureResults && _this.featureResults.forEach(function (featureResult) {
                        if (featureResult.title === layer_1.title) {
                            // find the graphic 
                            featureResult.features.forEach(function (f) {
                                if (f.attributes[idField_1] === val_1) {
                                    var node = document.getElementById("" + layer_1.id + val_1);
                                    if (node && node.parentElement) {
                                        found = true;
                                        _this.zoom = false;
                                        _this._selectAccordionSection(node.parentElement, graphic);
                                        _this._findActiveSectionForFeature(node.parentElement);
                                        node.parentElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                                    }
                                    return found;
                                }
                            });
                            return true;
                        }
                        else {
                            return false;
                        }
                    });
                }
            });
            return found;
        };
        GroupedAccordion.prototype._findActiveSectionForFeature = function (node) {
            // Find the acordion section and expand
            var els = [];
            while (node) {
                els.unshift(node);
                if (node.classList.contains('accordion-section')) {
                    if (!node.classList.contains('is-active')) {
                        node.classList.add('is-active');
                    }
                    node = null;
                }
                else {
                    node = node.parentNode;
                }
            }
        };
        GroupedAccordion.prototype._selectAccordionSection = function (node, graphic) {
            var selectedClassName = 'accordion-section-selected';
            var mainNodes = document.getElementsByClassName(selectedClassName);
            for (var j = 0; j < mainNodes.length; j++) {
                mainNodes[j].classList.remove(selectedClassName);
            }
            node.classList.add(selectedClassName);
            this.selectedItem = graphic;
        };
        __decorate([
            decorators_1.property()
        ], GroupedAccordion.prototype, "featureResults", void 0);
        __decorate([
            decorators_1.property()
        ], GroupedAccordion.prototype, "selectedItem", void 0);
        __decorate([
            decorators_1.property()
        ], GroupedAccordion.prototype, "hoveredItem", void 0);
        __decorate([
            decorators_1.property()
        ], GroupedAccordion.prototype, "zoom", void 0);
        __decorate([
            decorators_1.property()
        ], GroupedAccordion.prototype, "config", void 0);
        GroupedAccordion = __decorate([
            decorators_1.subclass('app.GroupedAccordion')
        ], GroupedAccordion);
        return GroupedAccordion;
    }((Accordion_1.default)));
    exports.default = GroupedAccordion;
});
//# sourceMappingURL=GroupedAccordion.js.map