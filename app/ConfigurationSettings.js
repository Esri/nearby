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
define(["require", "exports", "esri/core/accessorSupport/decorators", "esri/core/Accessor"], function (require, exports, decorators_1, Accessor_1) {
    "use strict";
    Accessor_1 = __importDefault(Accessor_1);
    var ConfigurationSettings = /** @class */ (function (_super) {
        __extends(ConfigurationSettings, _super);
        function ConfigurationSettings(params) {
            var _this = _super.call(this, params) || this;
            _this.withinConfigurationExperience = window.location !== window.parent.location;
            _this._storageKey = "config-values";
            _this._draft = null;
            _this._draftMode = false;
            _this._draft = params === null || params === void 0 ? void 0 : params.draft;
            _this._draftMode = (params === null || params === void 0 ? void 0 : params.mode) === "draft";
            return _this;
        }
        ConfigurationSettings.prototype.initialize = function () {
            if (this.withinConfigurationExperience || this._draftMode) {
                // Apply any draft properties
                if (this._draft) {
                    Object.assign(this, this._draft);
                }
                window.addEventListener("message", function (e) {
                    this._handleConfigurationUpdates(e);
                }.bind(this), false);
            }
        };
        ConfigurationSettings.prototype._handleConfigurationUpdates = function (e) {
            var _a;
            if (((_a = e === null || e === void 0 ? void 0 : e.data) === null || _a === void 0 ? void 0 : _a.type) === "cats-app") {
                Object.assign(this, e.data);
            }
        };
        ConfigurationSettings.prototype.mixinConfig = function () {
        };
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "webmap", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "mapZoom", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "mapZoomPosition", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "home", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "homePosition", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "legend", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "legendOpenAtStart", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "legendPosition", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "scalebar", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "scalebarPosition", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "basemapToggle", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "basemapTogglePosition", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "nextBasemap", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "theme", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "applySharedTheme", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "title", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "titleLink", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "introductionTitle", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "introductionContent", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "hideMap", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "headerBackground", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "headerColor", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "buttonBackground", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "buttonColor", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "shareIncludeSocial", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "interactiveResults", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "resultsPanelPostText", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "resultsPanelPreText", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "noResultsMessage", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "showResultCount", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "groupResultsByLayer", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "showDirections", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "includeDistance", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "searchUnits", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "singleLocationPolygons", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "relationship", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "drawBuffer", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "hideLayers", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "sliderRange", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "precision", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "inputsEnabled", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "lookupLayers", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "searchConfiguration", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "find", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "findSource", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "mapPin", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "mapPinLabel", void 0);
        __decorate([
            decorators_1.property()
        ], ConfigurationSettings.prototype, "withinConfigurationExperience", void 0);
        ConfigurationSettings = __decorate([
            decorators_1.subclass("app.ConfigurationSettings")
        ], ConfigurationSettings);
        return ConfigurationSettings;
    }((Accessor_1.default)));
    return ConfigurationSettings;
});
//# sourceMappingURL=ConfigurationSettings.js.map