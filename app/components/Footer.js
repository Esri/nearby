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
define(["require", "exports", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/core/Handles", "dojo/i18n!../nls/resources", "esri/widgets/support/widget"], function (require, exports, decorators_1, Widget_1, Handles_1, i18n, widget_1) {
    "use strict";
    Widget_1 = __importDefault(Widget_1);
    Handles_1 = __importDefault(Handles_1);
    var CSS = {
        grid: 'grid-container',
        mapIcon: 'icon-ui-maps',
        tableIcon: 'icon-ui-table',
        button: 'btn',
        fillButton: 'btn-fill',
        footerButton: 'btn-footer',
        borderLeft: 'border-left',
        appButton: 'app-button',
        tabletShow: 'tablet-show',
        paddingLeft: 'padding-left-0',
        paddingRight: 'padding-right-0',
        phoneColumn: 'phone-column-6',
        tabletColumn: 'tablet-column-12',
        footerColumn: 'footer-column'
    };
    var Footer = /** @class */ (function (_super) {
        __extends(Footer, _super);
        //--------------------------------------------------------------------------
        //
        //  Public Methods
        //
        //--------------------------------------------------------------------------
        function Footer(props) {
            var _this = _super.call(this, props) || this;
            _this.mapButtonVisible = true;
            //--------------------------------------------------------------------------
            //
            // Variables
            //
            //--------------------------------------------------------------------------
            _this._handles = new Handles_1.default();
            return _this;
        }
        Footer.prototype.render = function () {
            var showFooter = this.hideMap ? "hide" : null;
            var mapButton = this.mapButtonVisible ? (widget_1.tsx("button", { bind: this, onclick: this.showMap, class: this.classes(CSS.button, CSS.fillButton, CSS.appButton, CSS.mapIcon) }, i18n.map.label)) :
                (widget_1.tsx("button", { bind: this, onclick: this.closeMap, class: this.classes(CSS.button, CSS.fillButton, CSS.appButton, CSS.tableIcon) }, i18n.tools.results));
            return (widget_1.tsx("div", { class: this.classes(showFooter, CSS.footerColumn, CSS.phoneColumn, CSS.tabletColumn) },
                widget_1.tsx("div", { class: this.classes(CSS.paddingLeft, CSS.paddingRight, CSS.phoneColumn, CSS.tabletColumn, CSS.tabletShow) }, mapButton),
                ";"));
        };
        Footer.prototype.closeMap = function () {
            this.mapButtonVisible = true;
            this.mapPanel.view.container.classList.add('tablet-hide');
            var mainNodes = document.getElementsByClassName('main-map-content');
            for (var j = 0; j < mainNodes.length; j++) {
                mainNodes[j].classList.remove('hide');
            }
            this.mapPanel.selectedItemTitle = null;
            if (this.mapPanel.view.popup.visible) {
                // get item and scroll to selected 
                this.mapPanel.view.popup.close();
            }
            this.mapPanel.isMobileView = false;
            document.getElementById('mapDescription').innerHTML = i18n.map.description;
        };
        Footer.prototype.showMap = function () {
            var _this = this;
            this.mapButtonVisible = false;
            var mainNodes = document.getElementsByClassName('main-map-content');
            for (var j = 0; j < mainNodes.length; j++) {
                mainNodes[j].classList.add('hide');
            }
            this.mapPanel.isMobileView = true;
            this.mapPanel.view.container.classList.remove('tablet-hide');
            //update the maps describedby item
            document.getElementById('mapDescription').innerHTML = i18n.map.miniMapDescription;
            // if view size increases to greater than tablet close button if not already closed
            var resizeListener = function () {
                _this.closeMap();
                window.removeEventListener("resize", resizeListener);
            };
            window.addEventListener("resize", resizeListener);
        };
        __decorate([
            decorators_1.property()
        ], Footer.prototype, "mapPanel", void 0);
        __decorate([
            decorators_1.property()
        ], Footer.prototype, "config", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Footer.prototype, "hideMap", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], Footer.prototype, "mapButtonVisible", void 0);
        Footer = __decorate([
            decorators_1.subclass('app.Footer')
        ], Footer);
        return Footer;
    }((Widget_1.default)));
    return Footer;
});
//# sourceMappingURL=Footer.js.map