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
define(["require", "exports", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "../components/Share/Share", "../components/Share/Share/ShareFeatures", "esri/core/watchUtils", "esri/core/Handles", "esri/widgets/support/widget", "dojo/i18n!../nls/resources"], function (require, exports, decorators_1, Widget_1, Share_1, ShareFeatures_1, watchUtils_1, Handles, widget_1, i18n) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Widget_1 = __importDefault(Widget_1);
    Share_1 = __importDefault(Share_1);
    ShareFeatures_1 = __importDefault(ShareFeatures_1);
    var CSS = {
        calciteStyles: {
            right: 'right',
            left: 'left',
            fontSize2: 'font-size--2',
            paddingTrailer: 'padding-right-1',
            panel: 'panel',
            panelNoPadding: 'panel-no-padding',
            btn: 'btn',
            btnFill: 'btn-fill',
            btnTransparent: 'btn-transparent',
            phoneHide: 'phone-hide'
        },
        svgIcon: 'svg-icon',
        detailsTitle: 'details-title',
        detailsContent: 'details-content',
        hide: 'hide',
        details: 'detail'
    };
    var DetailPanel = /** @class */ (function (_super) {
        __extends(DetailPanel, _super);
        function DetailPanel(props) {
            var _this = _super.call(this, props) || this;
            //--------------------------------------------------------------------------
            //
            //  Properties
            //
            //--------------------------------------------------------------------------
            _this.config = null;
            _this.shareWidget = null;
            _this.view = null;
            _this._handles = new Handles();
            _this._resultsPanel = document.getElementById("resultsPanel");
            _this._filterPanel = document.getElementById("filterPanel");
            return _this;
        }
        Object.defineProperty(DetailPanel.prototype, "state", {
            //----------------------------------
            //
            //  state - readOnly
            //
            //----------------------------------
            get: function () {
                var ready = this.get('view.ready');
                return ready ? 'ready' : 'loading';
            },
            enumerable: false,
            configurable: true
        });
        DetailPanel.prototype.initialize = function () {
            var _this = this;
            var setupShare = 'setup-share';
            this._handles.add(watchUtils_1.whenOnce(this, 'view.ready', function () {
                var shareFeatures = new ShareFeatures_1.default({
                    copyToClipboard: true,
                    embedMap: false
                });
                _this.shareWidget = new Share_1.default({
                    view: _this.view,
                    shareFeatures: shareFeatures,
                    container: document.createElement('div'),
                    isDefault: true
                });
                _this._handles.remove(setupShare);
            }), setupShare);
        };
        DetailPanel.prototype.destroy = function () {
            this._handles.removeAll();
            this._handles = null;
        };
        DetailPanel.prototype.render = function () {
            var shareIncludeSocial = this.config.shareIncludeSocial;
            var title = this._getTitle();
            var content = this._getContent();
            var socialShare = shareIncludeSocial && this.shareWidget ? (widget_1.tsx("div", { bind: this.shareWidget.container, afterCreate: this._attachToNode, class: this.classes(CSS.calciteStyles.phoneHide) })) : null;
            return (widget_1.tsx("div", { bind: this, class: this.classes(CSS.calciteStyles.panel, CSS.calciteStyles.panelNoPadding) },
                widget_1.tsx("button", { bind: this, "aria-label": i18n.tools.close, title: i18n.tools.close, onclick: this.hidePanel, class: this.classes(CSS.details, CSS.calciteStyles.right, CSS.calciteStyles.btn, CSS.calciteStyles.btnTransparent) },
                    widget_1.tsx("svg", { class: this.classes(CSS.svgIcon), xmlns: "http://www.w3.org/2000/svg", width: "32", height: "32", viewBox: "0 0 32 32" },
                        widget_1.tsx("path", { d: "M18.404 16l9.9 9.9-2.404 2.404-9.9-9.9-9.9 9.9L3.696 25.9l9.9-9.9-9.9-9.898L6.1 3.698l9.9 9.899 9.9-9.9 2.404 2.406-9.9 9.898z" }))),
                widget_1.tsx("h3", { class: this.classes(CSS.detailsTitle) }, title),
                widget_1.tsx("p", { class: this.classes(CSS.detailsContent), innerHTML: content }),
                socialShare));
        };
        DetailPanel.prototype.hidePanel = function () {
            var container = this.container;
            container.classList.add("hide");
            //const filter = document.getElementById("filterPanel");
            //const results = document.getElementById("resultsPanel");
            this._resultsPanel.classList.remove("hide");
            this._filterPanel.classList.remove("hide");
        };
        DetailPanel.prototype.showPanel = function () {
            // Check local storage 
            var container = this.container;
            container.classList.remove("hide");
            // If it's info-triggered hide the filter panel 
            if (container.classList.contains("info-triggered")) {
                //const results = document.getElementById("resultsPanel");
                //const filter = document.getElementById("filterPanel");
                this._filterPanel.classList.add("hide");
                this._resultsPanel.classList.add("hide");
            }
        };
        DetailPanel.prototype._attachToNode = function (node) {
            var content = this;
            node.appendChild(content);
        };
        DetailPanel.prototype._getTitle = function () {
            var title = this.config.introductionTitle;
            if (!title) {
                // no title specified use default? 
                title = i18n.onboarding.title;
            }
            return title;
        };
        DetailPanel.prototype._getContent = function () {
            var content = this.config.introductionContent;
            if (!content) {
                content = i18n.onboarding.content;
            }
            return content;
        };
        __decorate([
            decorators_1.property(),
            widget_1.renderable(["introductionTitle", "introductionContent", "shareIncludeSocial"])
        ], DetailPanel.prototype, "config", void 0);
        __decorate([
            decorators_1.property()
        ], DetailPanel.prototype, "shareWidget", void 0);
        __decorate([
            decorators_1.property()
        ], DetailPanel.prototype, "view", void 0);
        __decorate([
            decorators_1.property({
                dependsOn: ['view.ready'],
                readOnly: true
            })
        ], DetailPanel.prototype, "state", null);
        DetailPanel = __decorate([
            decorators_1.subclass('app.DetailPanel')
        ], DetailPanel);
        return DetailPanel;
    }((Widget_1.default)));
    exports.default = DetailPanel;
});
//# sourceMappingURL=DetailPanel.js.map