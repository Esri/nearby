/*
  Copyright 2019 Esri
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.​
*/
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
define(["require", "exports", "telemetry/telemetry.dojo", "esri/widgets/Search", "esri/Graphic", "esri/core/Handles", "./utilites/lookupLayerUtils", "./utilites/esriWidgetUtils", "./utilites/errorUtils", "esri/core/watchUtils", "./components/DisplayLookupResults", "./components/Header", "./components/Footer", "./components/MapPanel", "dojo/i18n!./nls/resources", "ApplicationBase/support/domHelper", "esri/layers/FeatureLayer", "./components/DetailPanel"], function (require, exports, telemetry_dojo_1, Search_1, Graphic_1, Handles_1, lookupLayerUtils, esriWidgetUtils, errorUtils, watchUtils, DisplayLookupResults_1, Header_1, Footer_1, MapPanel_1, i18n, domHelper_1, FeatureLayer, DetailPanel_1) {
    "use strict";
    telemetry_dojo_1 = __importDefault(telemetry_dojo_1);
    Search_1 = __importDefault(Search_1);
    Graphic_1 = __importDefault(Graphic_1);
    Handles_1 = __importDefault(Handles_1);
    lookupLayerUtils = __importStar(lookupLayerUtils);
    esriWidgetUtils = __importStar(esriWidgetUtils);
    errorUtils = __importStar(errorUtils);
    DisplayLookupResults_1 = __importDefault(DisplayLookupResults_1);
    Header_1 = __importDefault(Header_1);
    Footer_1 = __importDefault(Footer_1);
    MapPanel_1 = __importDefault(MapPanel_1);
    DetailPanel_1 = __importDefault(DetailPanel_1);
    var CSS = {
        loading: 'configurable-application--loading'
    };
    var LocationApp = /** @class */ (function () {
        function LocationApp() {
            this.telemetry = null;
            this.searchWidget = null;
            this.mapPanel = null;
            this._detailPanel = null;
            this.footer = null;
            this._handles = new Handles_1.default();
            //----------------------------------
            //  ApplicationBase
            //----------------------------------
            this.base = null;
        }
        //--------------------------------------------------------------------------
        //
        //  Public Methods
        //
        //--------------------------------------------------------------------------
        LocationApp.prototype.init = function (base) {
            if (!base) {
                console.error('ApplicationBase is not defined');
                return;
            }
            this._applySharedTheme(base);
            domHelper_1.setPageLocale(base.locale);
            domHelper_1.setPageDirection(base.direction);
            this.base = base;
            var config = base.config, results = base.results, portal = base.portal;
            config.helperServices = __assign({}, base.portal.helperServices);
            var webMapItems = results.webMapItems;
            if (config.noMap) {
                document.body.classList.add('no-map');
            }
            // Setup Telemetry
            if (config.telemetry) {
                var options = config.telemetry.prod;
                if (portal.customBaseUrl.indexOf('mapsdevext') !== -1) {
                    // use devext credentials
                    options = config.telemetry.devext;
                }
                else if (portal.customBaseUrl.indexOf('mapsqa') !== -1) {
                    // or qa
                    options = config.telemetry.qaext;
                }
                this.telemetry = new telemetry_dojo_1.default({
                    portal: portal,
                    disabled: options.disabled,
                    debug: options.debug,
                    amazon: options.amazon
                });
                this.telemetry.logPageView();
            }
            // Get web map
            var allItems = webMapItems.map(function (item) {
                return item;
            });
            var validWebMapItems = [];
            allItems.forEach(function (response) {
                if (response && response.error) {
                    return;
                }
                validWebMapItems.push(response.value);
            });
            var item = validWebMapItems[0];
            if (!item) {
                var error = 'Could not load an item to display';
                errorUtils.displayError({
                    title: 'Error',
                    message: error
                });
                this.telemetry.logError({
                    error: error
                });
                return;
            }
            this._createMap(item);
        };
        LocationApp.prototype._createMap = function (item) {
            return __awaiter(this, void 0, void 0, function () {
                var config, _a, panelHandle;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            config = this.base.config;
                            _a = this;
                            return [4 /*yield*/, new MapPanel_1.default({
                                    item: item,
                                    base: this.base,
                                    container: 'mapPanel'
                                })];
                        case 1:
                            _a.mapPanel = _b.sent();
                            this._handles.add(this.mapPanel.watch("isMobileView", function (isMobile) {
                                // enable popup in mobile view 
                                _this.view.popup.autoOpenEnabled = isMobile;
                            }), "popupvis");
                            panelHandle = this.mapPanel.watch('view', function () {
                                panelHandle.remove();
                                _this.view = _this.mapPanel.view;
                                _this.view.popup.autoOpenEnabled = false;
                                _this.view.popup.actions = null;
                                document.body.classList.remove(CSS.loading);
                                _this._addWidgets(config);
                                _this._addHeader(item);
                                if (!_this.base.config.noMap) {
                                    _this._addFooter();
                                }
                            });
                            return [2 /*return*/];
                    }
                });
            });
        };
        LocationApp.prototype._addFooter = function () {
            var _this = this;
            var config = this.base.config;
            this.footer = new Footer_1.default({
                container: 'bottomNav',
                mapPanel: this.mapPanel,
                config: config
            });
            if (this.mapPanel) {
                watchUtils.whenTrue(this.mapPanel, "isMobileView", function (value) {
                    _this._detailPanel && _this._detailPanel.hidePanel();
                });
            }
        };
        LocationApp.prototype._addHeader = function (item) {
            var config = this.base.config;
            var detailTitle = config.detailTitle, detailContent = config.detailContent, socialSharing = config.socialSharing;
            // Add a page header
            config.title = config.title || item.title;
            domHelper_1.setPageTitle(config.title);
            if (!config.appid && (!detailTitle || !detailContent)) {
                detailTitle = !detailTitle ? i18n.onboarding.title : detailTitle;
                detailContent = !detailContent ? i18n.onboarding.content : detailContent;
            }
            if (detailTitle || detailContent || socialSharing) {
                this._detailPanel = new DetailPanel_1.default({
                    title: detailTitle || null,
                    content: detailContent,
                    view: this.view,
                    sharing: socialSharing,
                    container: document.getElementById('detailPanel')
                });
                // If there is a value in local storage don't open panel when app loads
                var detailPanelShown = localStorage && localStorage.getItem("detailPanelShow") ? true : false;
                if (!detailPanelShown) {
                    this._detailPanel.showPanel();
                    localStorage && localStorage.setItem("detailPanelShow", "true");
                }
            }
            var header = new Header_1.default({
                config: config,
                detailPanel: this._detailPanel,
                container: 'header'
            });
        };
        LocationApp.prototype._addWidgets = function (config) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Add esri widgets to the app (legend, home etc)
                    esriWidgetUtils.addMapComponents({
                        view: this.view,
                        config: config,
                        portal: this.base.portal
                    });
                    this._setupFeatureSearch();
                    return [2 /*return*/];
                });
            });
        };
        LocationApp.prototype._setupFeatureSearch = function () {
            return __awaiter(this, void 0, void 0, function () {
                var config, RefineResults, container, refineResultsPanel, parsedLayers, lookupLayers, url, Directions, directions_1;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            config = this.base.config;
                            return [4 /*yield*/, new Promise(function (resolve_1, reject_1) { require(["./components/RefineResults"], resolve_1, reject_1); }).then(__importStar)];
                        case 1:
                            RefineResults = _a.sent();
                            if (!RefineResults) {
                                return [2 /*return*/];
                            }
                            container = document.getElementById("distanceOptions");
                            if (config.distance && !isNaN(config.distance)) {
                                config.distance = parseFloat(config.distance);
                            }
                            refineResultsPanel = new RefineResults.default({
                                base: this.base,
                                container: container
                            });
                            refineResultsPanel.watch("value", function (value) {
                                _this.base.config.distance = value;
                                _this.lookupResults && _this.lookupResults.clearResults();
                                if (_this._searchFeature) {
                                    _this._generateSearchResults();
                                }
                                _this._updateUrlParam();
                            });
                            parsedLayers = config.lookupLayers ? JSON.parse(config.lookupLayers) : null;
                            if (!Array.isArray(parsedLayers) || !parsedLayers.length) {
                                parsedLayers = null;
                            }
                            return [4 /*yield*/, lookupLayerUtils.getLookupLayers({
                                    view: this.view,
                                    lookupLayers: parsedLayers,
                                    hideFeaturesOnLoad: config.hideLookupLayers
                                })];
                        case 2:
                            lookupLayers = _a.sent();
                            this.lookupResults = new DisplayLookupResults_1.default({
                                lookupLayers: lookupLayers,
                                config: this.base.config,
                                view: this.view,
                                mapPanel: this.mapPanel,
                                container: 'resultsPanel',
                                footer: this.footer ? this.footer : null
                            });
                            this._addSearchWidget();
                            if (!config.showDirections) return [3 /*break*/, 4];
                            url = config.helperServices.route.url;
                            return [4 /*yield*/, new Promise(function (resolve_2, reject_2) { require(['esri/widgets/Directions'], resolve_2, reject_2); }).then(__importStar)];
                        case 3:
                            Directions = _a.sent();
                            directions_1 = new Directions.default({
                                routeServiceUrl: url,
                                container: document.createElement("div")
                            });
                            // add directions to the view's popup 
                            watchUtils.whenDefinedOnce(directions_1, "viewModel", function () {
                                directions_1.view = _this.view;
                                directions_1.viewModel.routeParameters.directionsLengthUnits = config.units;
                                directions_1.viewModel.routeParameters.returnDirections = true;
                                directions_1.viewModel.load().catch(function (e) {
                                    if (e && e.message) {
                                        console.log("Problem loading directions:", e.message);
                                    }
                                });
                            });
                            this.lookupResults.directions = directions_1;
                            _a.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        LocationApp.prototype._addSearchWidget = function () {
            var _this = this;
            var _a = this.base.config, searchConfig = _a.searchConfig, find = _a.find, findSource = _a.findSource;
            var container = document.getElementById("search");
            var searchProperties = {
                view: this.view,
                resultGraphicEnabled: false,
                autoSelect: false,
                popupEnabled: false,
                container: container
            };
            if (searchConfig) {
                var sources = searchConfig.sources, activeSourceIndex = searchConfig.activeSourceIndex, enableSearchingAll = searchConfig.enableSearchingAll;
                if (sources) {
                    searchProperties.sources = sources.filter(function (source) {
                        if (source.flayerId && source.url) {
                            var layer = _this.view.map.findLayerById(source.flayerId);
                            source.layer = layer ? layer : new FeatureLayer(source.url);
                        }
                        if (source.hasOwnProperty('enableSuggestions')) {
                            source.suggestionsEnabled = source.enableSuggestions;
                        }
                        if (source.hasOwnProperty('searchWithinMap')) {
                            source.withinViewEnabled = source.searchWithinMap;
                        }
                        return source;
                    });
                }
                if (searchProperties.sources && searchProperties.sources.length && searchProperties.sources.length > 0) {
                    searchProperties.includeDefaultSources = false;
                }
                searchProperties.searchAllEnabled =
                    enableSearchingAll && enableSearchingAll === false ? false : true;
                if (activeSourceIndex &&
                    searchProperties.sources &&
                    searchProperties.sources.length >= activeSourceIndex) {
                    searchProperties.activeSourceIndex = activeSourceIndex;
                }
            }
            this.searchWidget = new Search_1.default(searchProperties);
            // If there's a find url param search for it when view is done updating once
            if (find) {
                watchUtils.whenFalseOnce(this.view, "updating", function () {
                    _this.searchWidget.viewModel.searchTerm = decodeURIComponent(find);
                    if (findSource) {
                        _this.searchWidget.activeSourceIndex = findSource;
                    }
                    _this.searchWidget.viewModel.search();
                });
            }
            var handle = this.searchWidget.viewModel.watch('state', function (state) {
                if (state === 'ready') {
                    handle.remove();
                    // conditionally hide on tablet
                    if (!_this.view.container.classList.contains('tablet-show')) {
                        _this.view.container.classList.add('tablet-hide');
                    }
                    // force search within map if nothing is configured
                    if (!searchConfig) {
                        _this.searchWidget.viewModel.allSources.forEach(function (source) {
                            source.withinViewEnabled = true;
                        });
                    }
                }
            });
            this.searchWidget.on('search-clear', function () {
                _this._cleanUpResults();
                container.classList.remove("hide-search-btn");
                //this.clearSearchButton.setAttribute("disabled", "disabled");
                // Remove find url param
                _this._updateUrlParam();
                _this._searchFeature = null;
            });
            this.searchWidget.on('search-complete', function (results) { return __awaiter(_this, void 0, void 0, function () {
                var index, feature;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this._cleanUpResults();
                            if (!(results.numResults > 0)) return [3 /*break*/, 2];
                            // Add find url param
                            container.classList.add("hide-search-btn");
                            index = results && results.activeSourceIndex ? results.activeSourceIndex : null;
                            this._updateUrlParam(index);
                            return [4 /*yield*/, lookupLayerUtils.getSearchGeometry({
                                    config: this.base.config,
                                    view: this.view,
                                    results: results
                                })];
                        case 1:
                            feature = _a.sent();
                            this._searchFeature = feature;
                            this._generateSearchResults();
                            _a.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            }); });
            // We also want to search for locations when users click on the map if 
            // we aren't in 'interactive results' mode 
            this.view.on('click', function (e) { return __awaiter(_this, void 0, void 0, function () {
                var point, screenPoint, results_1;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            point = e.mapPoint;
                            if (!this.lookupResults.empty) return [3 /*break*/, 1];
                            this._performSearch(point);
                            return [3 /*break*/, 3];
                        case 1:
                            screenPoint = this.view.toScreen(point);
                            return [4 /*yield*/, this.view.hitTest(screenPoint)];
                        case 2:
                            results_1 = _a.sent();
                            // If we are in mobile view let's wait until we switch out
                            this._getSelectedAccordionItem(results_1);
                            if (this.mapPanel.isMobileView) {
                                watchUtils.whenFalseOnce(this.mapPanel, "isMobileView", function () {
                                    _this._getSelectedAccordionItem(results_1);
                                });
                            }
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // add clear search button to map view 
            var clearButton = document.createElement("button");
            clearButton.innerHTML = i18n.tools.clearLocation;
            clearButton.classList.add("btn");
            clearButton.classList.add("clear-btn");
            clearButton.classList.add('hide');
            clearButton.classList.add("app-button");
            clearButton.addEventListener("click", function () {
                _this.searchWidget && _this.searchWidget.clear();
            });
            this.view.ui.add(clearButton, 'manual');
            this.lookupResults.watch("empty", function (val) {
                if (!val) {
                    clearButton.classList.remove("hide");
                }
                else {
                    clearButton.classList.add("hide");
                }
            });
        };
        LocationApp.prototype._getSelectedAccordionItem = function (results) {
            if (this.lookupResults.accordion) {
                this.lookupResults.accordion.findAccordionItem(results);
            }
            ;
        };
        LocationApp.prototype._performSearch = function (mapPoint) {
            var _this = this;
            this.searchWidget.search(mapPoint).then(function (response) {
                if (response && response.numResults < 1) {
                    _this._displayNoResultsMessage(mapPoint);
                }
                if (response && response.numErrors && response.numErrors > 0) {
                    _this._displayNoResultsMessage(mapPoint);
                }
            });
        };
        LocationApp.prototype._displayNoResultsMessage = function (geometry) {
            // display no results message
            this._searchFeature = new Graphic_1.default({ geometry: geometry });
            this._generateSearchResults();
            this.searchWidget.activeMenu = null;
        };
        LocationApp.prototype._generateSearchResults = function () {
            return __awaiter(this, void 0, void 0, function () {
                var location, distance;
                return __generator(this, function (_a) {
                    location = this._searchFeature ? this._searchFeature : null;
                    if (this._detailPanel) {
                        this._detailPanel.hidePanel();
                    }
                    distance = (this.base.config && this.base.config.distance) || 0;
                    this.lookupResults && this.lookupResults.queryFeatures(location, distance);
                    return [2 /*return*/];
                });
            });
        };
        LocationApp.prototype._cleanUpResults = function () {
            // Clear the lookup results displayed in the side panel
            this.lookupResults && this.lookupResults.clearResults();
            this.view.graphics.removeAll();
            this.mapPanel && this.mapPanel.clearResults();
            if (!this.mapPanel.isMobileView) {
                this.view.popup.autoOpenEnabled = false;
            }
        };
        //_updateUrlParam(searchTerm?, index?) {
        LocationApp.prototype._updateUrlParam = function (index) {
            if ('URLSearchParams' in window) {
                var params = new URLSearchParams(document.location.search);
                var searchTerm = encodeURIComponent(this.searchWidget.searchTerm);
                if (searchTerm) {
                    if (index && (index > 0 || index === 0)) {
                        params.set('findSource', index);
                    }
                    else {
                        params.delete('findSource');
                    }
                    if (this.base.config.distance) {
                        params.set('distance', this.base.config.distance);
                    }
                    params.set('find', encodeURIComponent(this.searchWidget.searchTerm));
                }
                else {
                    params.delete('find');
                    params.delete('findSource');
                    params.delete('distance');
                }
                if (params && params.toString()) {
                    window.history.replaceState({}, '', location.pathname + "?" + params);
                }
                else {
                    window.history.replaceState({}, '', "" + location.pathname);
                }
            }
        };
        LocationApp.prototype._applySharedTheme = function (base) {
            var config = base.config;
            // Build and insert style
            var styles = [];
            styles.push(config.headerBackground ? "#detailPanel svg{color:" + config.headerBackground + ";}.app-header{background:" + config.headerBackground + ";}" : null);
            styles.push(config.headerColor
                ? ".app-header a{color:" + config.headerColor + ";}.app-header{color:" + config.headerColor + ";}.toolbar-buttons{color:" + config.headerColor + "}"
                : null);
            styles.push(config.buttonBackground
                ? ".esri-icon-close:before, .esri-icon-search:before, .esri-clear-search,.esri-search__submit-button{color:" + config.buttonBackground + "}.app-button:hover, .app-button{background:" + config.buttonBackground + "; border-color:" + config.buttonBackground + ";} #detailPanel .svg-icon{color:" + config.buttonBackground + ";}"
                : null);
            styles.push(config.buttonColor
                ? ".app-button, .app-button:hover{color:" + config.buttonColor + ";}"
                : null);
            var style = document.createElement('style');
            style.appendChild(document.createTextNode(styles.join('')));
            document.getElementsByTagName('head')[0].appendChild(style);
        };
        return LocationApp;
    }());
    return LocationApp;
});
//# sourceMappingURL=Main.js.map