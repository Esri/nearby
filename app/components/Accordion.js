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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/widgets/support/widget", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "calcite-web/dist/js/calcite-web", "dojo/i18n!../nls/resources"], function (require, exports, __extends, __decorate, widget_1, decorators_1, Widget_1, calcite_web_1, i18n) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Widget_1 = __importDefault(Widget_1);
    var CSS = {
        base: 'accordion',
        basejs: 'js-accordion',
        single: 'single',
        directions: 'directions-button',
        section: 'accordion-section',
        active: 'is-active',
        title: 'accordion-title',
        titleArea: 'title-area',
        count: 'accordion-count',
        content: 'accordion-content',
        button: 'btn',
        messageText: 'message-text',
        transparentButton: 'btn-transparent',
        smallButton: 'btn-small',
        accordionIcon: 'accordion-icon',
        paddingTrailer: 'padding-right-quarter',
        left: 'left',
        actions: 'accordion-actions',
        templateContent: 'template'
    };
    var Accordion = /** @class */ (function (_super) {
        __extends(Accordion, _super);
        function Accordion(params, parentNode) {
            var _this = _super.call(this) || this;
            // Variables 
            _this._calciteLoaded = false;
            // Properties 
            _this.selectedItem = null;
            return _this;
        }
        // Methods
        Accordion.prototype.updateCalcite = function () {
            if (!this._calciteLoaded) {
                calcite_web_1.accordion();
                this._calciteLoaded = true;
            }
        };
        Accordion.prototype.createPostText = function () {
            return (widget_1.tsx("p", { key: "postText", class: CSS.messageText, innerHTML: this.config.resultsPanelPostText }));
        };
        Accordion.prototype.createPreText = function () {
            return (widget_1.tsx("p", { key: "preText", class: CSS.messageText, innerHTML: this.config.resultsPanelPreText }));
        };
        Accordion.prototype.checkContent = function (feature) {
            var content = feature.viewModel.content;
            if (Array.isArray(content)) {
                if (content.length > 0 && content[0] && content[0].type === "fields") {
                    var fieldType_1;
                    var empty = content.every(function (c) {
                        if (c.type === "fields") {
                            fieldType_1 = c;
                            return fieldType_1.fieldInfos.length === 0 ? true : false;
                        }
                        else if (c.type === "attachments") {
                            fieldType_1 = c;
                            return !fieldType_1.attachmentInfos ? true : false;
                        }
                        else if (c.type === "media") {
                            fieldType_1 = c;
                            return fieldType_1.mediaInfos.length === 0 ? true : false;
                        }
                        else if (c.type === "text") {
                            fieldType_1 = c;
                            return !fieldType_1.text || fieldType_1.text === "" ? true : false;
                        }
                        else {
                            return false;
                        }
                    });
                    return empty;
                }
            }
            else {
                return null;
            }
        };
        Accordion.prototype.createActionItem = function (item, graphic) {
            var _this = this;
            return (widget_1.tsx("button", { onclick: function () { return _this.actionItemClick(graphic, item); }, class: this.classes(CSS.button, CSS.transparentButton, CSS.directions, CSS.left, item.icon, item.class) }, item.name));
        };
        Accordion.prototype.actionItemClick = function (graphic, item) {
            item.handleClick(item.id, graphic);
        };
        Accordion.prototype.convertUnitText = function (distance, units) {
            var unit = i18n.units[units];
            unit = unit ? unit.abbr : "mi";
            return "<span class=\"distance right\" title=\"\">\n        (" + distance + " " + unit + ")</span>";
        };
        __decorate([
            decorators_1.property()
        ], Accordion.prototype, "selectedItem", void 0);
        __decorate([
            decorators_1.property()
        ], Accordion.prototype, "actionBarItems", void 0);
        __decorate([
            decorators_1.property()
        ], Accordion.prototype, "view", void 0);
        __decorate([
            decorators_1.property()
        ], Accordion.prototype, "config", void 0);
        Accordion = __decorate([
            decorators_1.subclass('esri.widgets.Accordion')
        ], Accordion);
        return Accordion;
    }(decorators_1.declared(Widget_1.default)));
    exports.default = Accordion;
});
//# sourceMappingURL=Accordion.js.map