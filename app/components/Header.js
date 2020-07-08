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
define(["require", "exports", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "dojo/i18n!../nls/resources", "esri/widgets/support/widget", "ApplicationBase/support/domHelper", "esri/core/watchUtils"], function (require, exports, decorators_1, Widget_1, i18n, widget_1, domHelper_1, watchUtils_1) {
    "use strict";
    Widget_1 = __importDefault(Widget_1);
    var CSS = {
        theme: 'app-header',
        calciteStyles: {
            buttonLink: 'btn-link',
            right: 'right',
            iconDesc: 'icon-ui-description',
            fade: 'fade-in',
            topNavLink: 'top-nav-link',
            topNav: 'top-nav',
            topNavTitle: 'top-nav-title',
            ellipsis: 'text-fade'
        }
    };
    var Header = /** @class */ (function (_super) {
        __extends(Header, _super);
        //--------------------------------------------------------------------------
        //
        //  Public Methods
        //
        //--------------------------------------------------------------------------
        function Header(props) {
            return _super.call(this, props) || this;
        }
        Header.prototype.postInitialize = function () {
            var handle = watchUtils_1.init(this, "config.title", this._onTitleUpdate);
            this.own(handle);
        };
        Header.prototype.render = function () {
            var _a = this.config, title = _a.title, titleLink = _a.titleLink;
            var titleNode = titleLink ? (widget_1.tsx("a", { target: "_blank", rel: "noopener", href: titleLink }, title)) : (title);
            var infoButton = this.detailPanel ? widget_1.tsx("div", { class: "right" },
                widget_1.tsx("button", { bind: this, onclick: this._showDetailPanel, "aria-label": i18n.tools.info, title: i18n.tools.info, class: this.classes(CSS.theme, CSS.calciteStyles.topNavTitle, CSS.calciteStyles.buttonLink, CSS.calciteStyles.iconDesc) })) : null;
            return (widget_1.tsx("header", { class: this.classes(CSS.calciteStyles.topNav, CSS.theme) },
                widget_1.tsx("div", { class: this.classes(CSS.calciteStyles.fade) },
                    widget_1.tsx("h1", { title: title, class: this.classes(CSS.calciteStyles.topNavTitle, CSS.calciteStyles.ellipsis) }, titleNode)),
                infoButton));
        };
        Header.prototype._showDetailPanel = function (e) {
            // add class to detail panel to add close button and position at top of panel
            var node = this.detailPanel.container;
            node.classList.add("info-triggered");
            // Show panel unless we click button with panel already open
            if (node && !node.classList.contains("hide")) {
                this.detailPanel.hidePanel();
            }
            else {
                this.detailPanel.showPanel();
            }
        };
        Header.prototype._onTitleUpdate = function () {
            domHelper_1.setPageTitle(this.config.title);
        };
        ;
        __decorate([
            decorators_1.property(),
            widget_1.renderable(["title", "titleLink"])
        ], Header.prototype, "config", void 0);
        __decorate([
            decorators_1.property()
        ], Header.prototype, "detailPanel", void 0);
        Header = __decorate([
            decorators_1.subclass('app.Header')
        ], Header);
        return Header;
    }((Widget_1.default)));
    return Header;
});
//# sourceMappingURL=Header.js.map