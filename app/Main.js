/*
  Copyright 2017 Esri
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
define(["require", "exports", "telemetry/telemetry.dojo", "esri/widgets/Search", "esri/Graphic", "esri/core/Handles", "./utilites/lookupLayerUtils", "./utilites/esriWidgetUtils", "./utilites/errorUtils", "esri/core/watchUtils", "./components/DisplayLookupResults", "./components/Header", "./components/Footer", "./components/MapPanel", "dojo/i18n!./nls/resources", "ApplicationBase/support/domHelper", "./ConfigurationSettings", "./components/DetailPanel", "./components/LookupGraphics", "esri/layers/FeatureLayer"], function (require, exports, telemetry_dojo_1, Search_1, Graphic_1, Handles_1, lookupLayerUtils_1, esriWidgetUtils_1, errorUtils_1, watchUtils_1, DisplayLookupResults_1, Header_1, Footer_1, MapPanel_1, i18n, domHelper_1, ConfigurationSettings_1, DetailPanel_1, LookupGraphics, FeatureLayer_1) {
    "use strict";
    telemetry_dojo_1 = __importDefault(telemetry_dojo_1);
    Search_1 = __importDefault(Search_1);
    Graphic_1 = __importDefault(Graphic_1);
    Handles_1 = __importDefault(Handles_1);
    DisplayLookupResults_1 = __importDefault(DisplayLookupResults_1);
    Header_1 = __importDefault(Header_1);
    Footer_1 = __importDefault(Footer_1);
    MapPanel_1 = __importDefault(MapPanel_1);
    ConfigurationSettings_1 = __importDefault(ConfigurationSettings_1);
    DetailPanel_1 = __importDefault(DetailPanel_1);
    FeatureLayer_1 = __importDefault(FeatureLayer_1);
    var CSS = {
        loading: 'configurable-application--loading'
    };
    var LocationApp = /** @class */ (function () {
        function LocationApp() {
            this._appConfig = null;
            this.telemetry = null;
            this.searchWidget = null;
            this.mapPanel = null;
            this._detailPanel = null;
            this._clearButton = null;
            this.footer = null;
            this._handles = new Handles_1.default();
            this._results = null;
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
            var _this = this;
            if (!base) {
                console.error('ApplicationBase is not defined');
                return;
            }
            this._updateMapVisibility(base.config);
            domHelper_1.setPageLocale(base.locale);
            domHelper_1.setPageDirection(base.direction);
            this.base = base;
            var config = base.config, results = base.results, portal = base.portal;
            config.helperServices = __assign({}, base.portal.helperServices);
            var webMapItems = results.webMapItems;
            // create and insert the shared theme styles 
            this._createSharedTheme();
            this._appConfig = new ConfigurationSettings_1.default(config);
            this._handles.add(watchUtils_1.init(this._appConfig, ["theme", "applySharedTheme"], function () {
                _this.handleThemeUpdates();
            }), "configuration");
            // Setup Telemetry
            if (config.telemetry) {
                var _a = config.telemetry, prod = _a.prod, qaext = _a.qaext, devext = _a.devext;
                var options = prod;
                if (portal.customBaseUrl.indexOf('mapsdevext') !== -1) {
                    // use devext credentials
                    options = devext;
                }
                else if (portal.customBaseUrl.indexOf('mapsqa') !== -1) {
                    // or qa
                    options = qaext;
                }
                var disabled = options.disabled, debug = options.debug, amazon = options.amazon;
                this.telemetry = new telemetry_dojo_1.default({
                    portal: portal,
                    disabled: disabled,
                    debug: debug,
                    amazon: amazon
                });
                this.telemetry.logPageView();
            }
            // Get web map
            var allItems = webMapItems.map(function (item) {
                return item;
            });
            var validWebMapItems = [];
            allItems.forEach(function (response) {
                if (response === null || response === void 0 ? void 0 : response.error) {
                    return;
                }
                validWebMapItems.push(response.value);
            });
            var item = validWebMapItems[0];
            if (!item) {
                var error = 'Could not load an item to display';
                errorUtils_1.displayError({
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
                var _a, panelHandle;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
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
                                // watch properties that determine how results are displayed
                                _this._handles.add(watchUtils_1.init(_this._appConfig, ["searchUnits", "includeDistance", "interactiveResults", "groupResultsByLayer"], function () {
                                    if (_this._results) {
                                        _this._displayResults(_this._results);
                                    }
                                }), "configuration");
                                _this.view.popup.autoOpenEnabled = false;
                                _this.view.popup.actions = null;
                                document.body.classList.remove(CSS.loading);
                                _this._addWidgets();
                                _this._addHeader(item);
                                _this._addFooter();
                            });
                            return [2 /*return*/];
                    }
                });
            });
        };
        LocationApp.prototype._addFooter = function () {
            var _this = this;
            var hideMap = this._appConfig.hideMap;
            this.footer = new Footer_1.default({
                container: 'bottomNav',
                hideMap: hideMap,
                mapPanel: this.mapPanel,
                config: this._appConfig
            });
            // dark background: #242424 color "#d1d1d1"
            this._handles.add(watchUtils_1.init(this._appConfig, "hideMap", function () {
                _this._updateMapVisibility(_this._appConfig);
            }), "configuration");
            if (this.mapPanel && !hideMap) {
                watchUtils_1.whenTrue(this.mapPanel, "isMobileView", function (value) {
                    _this._detailPanel && _this._detailPanel.hidePanel();
                });
            }
        };
        LocationApp.prototype._addHeader = function (item) {
            // Add a page header
            this._appConfig.title = this._appConfig.title || item.title;
            domHelper_1.setPageTitle(this._appConfig.title);
            // Add info button 
            this._detailPanel = new DetailPanel_1.default({
                config: this._appConfig,
                view: this.view,
                container: document.getElementById('detailPanel')
            });
            // If there is a value in session storage don't open panel when app loads
            var detailPanelShown = sessionStorage && sessionStorage.getItem("detailPanelShow") ? true : false;
            if (!detailPanelShown) {
                this._detailPanel.showPanel();
                sessionStorage && sessionStorage.setItem("detailPanelShow", "true");
            }
            new Header_1.default({
                config: this._appConfig,
                detailPanel: this._detailPanel,
                container: 'header'
            });
        };
        LocationApp.prototype._addWidgets = function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    // Add esri widgets to the app (legend, home etc)
                    esriWidgetUtils_1.addMapComponents({
                        view: this.view,
                        config: this._appConfig,
                        portal: this.base.portal
                    });
                    this._setupFeatureSearch();
                    return [2 /*return*/];
                });
            });
        };
        LocationApp.prototype._setupFeatureSearch = function () {
            var _a, _b, _c, _d;
            return __awaiter(this, void 0, void 0, function () {
                var RefineResults, container, refineResultsPanel, lookupGraphics;
                var _this = this;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0: return [4 /*yield*/, new Promise(function (resolve_1, reject_1) { require(["./components/RefineResults"], resolve_1, reject_1); }).then(__importStar)];
                        case 1:
                            RefineResults = _e.sent();
                            if (!RefineResults) {
                                return [2 /*return*/];
                            }
                            container = document.getElementById("distanceOptions");
                            if (((_b = (_a = this._appConfig) === null || _a === void 0 ? void 0 : _a.sliderRange) === null || _b === void 0 ? void 0 : _b.default) && !isNaN((_d = (_c = this._appConfig) === null || _c === void 0 ? void 0 : _c.sliderRange) === null || _d === void 0 ? void 0 : _d.default)) {
                                this._appConfig.sliderRange.default = this._appConfig.sliderRange.default;
                            }
                            refineResultsPanel = new RefineResults.default({
                                config: this._appConfig,
                                container: container
                            });
                            this._handles.add(watchUtils_1.init(this._appConfig, ["sliderRange", "searchUnits", "precision", "inputsEnabled"], function (value, oldValue, propertyName) {
                                refineResultsPanel.updateSliderProps(propertyName, value);
                            }), "configuration");
                            refineResultsPanel.watch("value", function (value) {
                                _this._appConfig.sliderRange.default = value;
                                _this.lookupResults && _this.lookupResults.clearResults();
                                if (_this._searchFeature) {
                                    _this._generateSearchResults();
                                }
                                _this._updateUrlParam();
                            });
                            lookupGraphics = new LookupGraphics({
                                view: this.view,
                                config: this._appConfig
                            });
                            this._handles.add(watchUtils_1.init(this._appConfig, ["drawBuffer", "mapPinLabel", "mapPin"], function (value, oldValue, propertyName) {
                                lookupGraphics.updateGraphics(propertyName, value);
                            }), "configuration");
                            this.lookupResults = new DisplayLookupResults_1.default({
                                lookupGraphics: lookupGraphics,
                                config: this._appConfig,
                                view: this.view,
                                mapPanel: this.mapPanel,
                                portal: this.base.config.portal,
                                container: 'resultsPanel',
                                footer: this.footer ? this.footer : null
                            });
                            this._handles.add(watchUtils_1.init(this._appConfig, ["lookupLayers", "hideLayers"], function () { return __awaiter(_this, void 0, void 0, function () {
                                var parsedLayers, lookupLayers;
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            parsedLayers = ((_a = this._appConfig.lookupLayers) === null || _a === void 0 ? void 0 : _a.layers) ? this._appConfig.lookupLayers.layers : null;
                                            if (!Array.isArray(parsedLayers) || !parsedLayers.length) {
                                                parsedLayers = null;
                                            }
                                            return [4 /*yield*/, lookupLayerUtils_1.getLookupLayers({
                                                    view: this.view,
                                                    lookupLayers: parsedLayers,
                                                    hideFeaturesOnLoad: this._appConfig.hideLayers
                                                })];
                                        case 1:
                                            lookupLayers = _b.sent();
                                            this.lookupResults.lookupLayers = lookupLayers;
                                            if (this._results) {
                                                this._displayResults(this._results);
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); }), "configuration");
                            this._addSearchWidget();
                            // Wait for view model 
                            this._handles.add(watchUtils_1.init(this._appConfig, ["showDirections"], function () {
                                var _a;
                                if (_this._appConfig.showDirections && !((_a = _this.lookupResults) === null || _a === void 0 ? void 0 : _a.directions)) {
                                    _this._createDirections();
                                    if (_this._results) {
                                        // refresh the results to show directions
                                        _this._displayResults(_this._results);
                                    }
                                }
                            }), "configuration");
                            this._cleanUpHandles();
                            return [2 /*return*/];
                    }
                });
            });
        };
        LocationApp.prototype._createDirections = function () {
            return __awaiter(this, void 0, void 0, function () {
                var url, Directions, container, directions;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.lookupResults.directions)
                                return [2 /*return*/];
                            url = this.base.config.helperServices.route.url;
                            return [4 /*yield*/, new Promise(function (resolve_2, reject_2) { require(['esri/widgets/Directions'], resolve_2, reject_2); }).then(__importStar)];
                        case 1:
                            Directions = _a.sent();
                            container = document.createElement("div");
                            container.setAttribute("role", "alertdialog");
                            directions = new Directions.default({
                                routeServiceUrl: url,
                                container: container
                            });
                            // add directions to the view's popup 
                            watchUtils_1.whenDefinedOnce(directions, "viewModel", function () {
                                directions.view = _this.view;
                                directions.viewModel.routeParameters.directionsLengthUnits = _this._appConfig.searchUnits;
                                directions.viewModel.routeParameters.returnDirections = true;
                                directions.viewModel.load().catch(function (e) {
                                    if (e && e.message) {
                                        console.log("Problem loading directions:", e.message);
                                    }
                                });
                            });
                            this.lookupResults.directions = directions;
                            return [2 /*return*/];
                    }
                });
            });
        };
        LocationApp.prototype._addSearchWidget = function () {
            var _this = this;
            var _a;
            var container = document.getElementById("search");
            var _b = this._appConfig, searchConfiguration = _b.searchConfiguration, find = _b.find, findSource = _b.findSource;
            var sources = searchConfiguration === null || searchConfiguration === void 0 ? void 0 : searchConfiguration.sources;
            if (sources) {
                sources.forEach(function (source) {
                    var _a, _b;
                    if ((_a = source === null || source === void 0 ? void 0 : source.layer) === null || _a === void 0 ? void 0 : _a.url) {
                        source.layer = new FeatureLayer_1.default((_b = source === null || source === void 0 ? void 0 : source.layer) === null || _b === void 0 ? void 0 : _b.url);
                    }
                });
            }
            var searchProperties = __assign({
                view: this.view,
                resultGraphicEnabled: false,
                autoSelect: false,
                popupEnabled: false,
                container: "search"
            }, searchConfiguration);
            if (((_a = searchProperties === null || searchProperties === void 0 ? void 0 : searchProperties.sources) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                searchProperties.includeDefaultSources = false;
            }
            this.searchWidget = new Search_1.default(searchProperties);
            // If there's a find url param search for it when view is done updating once
            if (find) {
                watchUtils_1.whenFalseOnce(this.view, "updating", function () {
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
                    if (!searchConfiguration) {
                        _this.searchWidget.viewModel.allSources.forEach(function (source) {
                            source.withinViewEnabled = true;
                        });
                    }
                }
            });
            // in progress migrate search logic from lookup 
            // to nearby and work on rest of the props
            this.searchWidget.on('search-clear', function () {
                var _a;
                _this._cleanUpResults();
                container.classList.remove("hide-search-btn");
                (_a = _this._clearButton) === null || _a === void 0 ? void 0 : _a.classList.add("hide");
                // Remove find url param
                _this._updateUrlParam();
                _this._searchFeature = null;
            });
            this.searchWidget.on('search-complete', function (results) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this._cleanUpResults();
                    if (results.numResults > 0) {
                        // Add find url param
                        container.classList.add("hide-search-btn");
                        this._displayResults(results);
                    }
                    return [2 /*return*/];
                });
            }); });
            // Search for location where user clicked on the map 
            this.view.on('click', function (e) { return __awaiter(_this, void 0, void 0, function () {
                var point, screenPoint, results_1;
                var _this = this;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            point = e.mapPoint;
                            if (!this.lookupResults.empty) return [3 /*break*/, 1];
                            this._performSearch(point);
                            return [3 /*break*/, 3];
                        case 1:
                            screenPoint = this.view.toScreen(point);
                            return [4 /*yield*/, this.view.hitTest(screenPoint)];
                        case 2:
                            results_1 = _b.sent();
                            // If we are in mobile view let's wait until we switch out
                            this._getSelectedAccordionItem(results_1);
                            if (this.mapPanel.isMobileView) {
                                watchUtils_1.whenFalseOnce(this.mapPanel, "isMobileView", function () {
                                    _this._getSelectedAccordionItem(results_1);
                                });
                            }
                            _b.label = 3;
                        case 3:
                            (_a = this._clearButton) === null || _a === void 0 ? void 0 : _a.classList.remove("hide");
                            return [2 /*return*/];
                    }
                });
            }); });
            // add clear search button to map view 
            this._clearButton = document.createElement("button");
            this._clearButton.innerHTML = i18n.tools.clearLocation;
            this._clearButton.classList.add("btn");
            this._clearButton.classList.add("clear-btn");
            this._clearButton.classList.add('hide');
            this._clearButton.classList.add("app-button");
            this._clearButton.addEventListener("click", function () {
                _this._clearButton.classList.add("hide");
                _this.searchWidget && _this.searchWidget.clear();
            });
            this.view.ui.add(this._clearButton, 'manual');
        };
        LocationApp.prototype._displayResults = function (results) {
            var _a;
            return __awaiter(this, void 0, void 0, function () {
                var index, feature;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            (_a = this._clearButton) === null || _a === void 0 ? void 0 : _a.classList.remove("hide");
                            index = results && results.activeSourceIndex ? results.activeSourceIndex : null;
                            this._results = results;
                            this._updateUrlParam(index);
                            return [4 /*yield*/, lookupLayerUtils_1.getSearchGeometry({
                                    config: this.base.config,
                                    view: this.view,
                                    results: results
                                })];
                        case 1:
                            feature = _b.sent();
                            this._searchFeature = feature;
                            this._generateSearchResults();
                            return [2 /*return*/];
                    }
                });
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
                if ((response === null || response === void 0 ? void 0 : response.numResults) < 1) {
                    _this._displayNoResultsMessage(mapPoint);
                }
                if ((response === null || response === void 0 ? void 0 : response.numErrors) > 0) {
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
                var location;
                return __generator(this, function (_a) {
                    location = this._searchFeature ? this._searchFeature : null;
                    if (this._detailPanel) {
                        this._detailPanel.hidePanel();
                    }
                    this.lookupResults && this.lookupResults.queryFeatures(location);
                    return [2 /*return*/];
                });
            });
        };
        LocationApp.prototype._cleanUpResults = function () {
            // Clear the lookup results displayed in the side panel
            this.lookupResults && this.lookupResults.clearResults();
            this._results = null;
            this.view.graphics.removeAll();
            this.mapPanel && this.mapPanel.clearResults();
            if (!this.mapPanel.isMobileView) {
                this.view.popup.autoOpenEnabled = false;
            }
        };
        LocationApp.prototype._updateUrlParam = function (index) {
            var _a;
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
                    if ((_a = this._appConfig.sliderRange) === null || _a === void 0 ? void 0 : _a.default) {
                        params.set('sliderDistance', this._appConfig.sliderRange.default);
                    }
                    params.set('find', encodeURIComponent(this.searchWidget.searchTerm));
                }
                else {
                    params.delete('find');
                    params.delete('findSource');
                    params.delete('sliderDistance');
                }
                if (params && params.toString()) {
                    window.history.replaceState({}, '', location.pathname + "?" + params);
                }
                else {
                    window.history.replaceState({}, '', "" + location.pathname);
                }
            }
        };
        LocationApp.prototype._createSharedTheme = function () {
            var _a, _b, _c;
            // use shared theme colors for header and buttons 
            var sharedTheme = (_c = (_b = (_a = this.base) === null || _a === void 0 ? void 0 : _a.portal) === null || _b === void 0 ? void 0 : _b.portalProperties) === null || _c === void 0 ? void 0 : _c.sharedTheme;
            if (!sharedTheme) {
                return;
            }
            var header = sharedTheme.header, button = sharedTheme.button;
            var styles = [];
            // Build and insert style
            styles.push((header === null || header === void 0 ? void 0 : header.background) ?
                ".shared-theme #detailPanel svg{color:" + header.background + ";}\n\t\t\t.shared-theme .app-header{background:" + header.background + ";}\n\t\t\t.shared-theme .text-fade:after {\n\t\t\t\tbackground: linear-gradient(to left, " + header.background + ", 40%, transparent 90%);\n\t\t\t  }\n\t\t\t  html[dir=\"rtl\"] .shared-theme .text-fade:after {\n\t\t\t\tbackground: linear-gradient(to right, " + header.background + " 40%, transparent 90%);\n\t\t\t  }\n\t\t\t"
                : null);
            styles.push((header === null || header === void 0 ? void 0 : header.text) ? ".shared-theme .app-header a{color:" + header.text + ";}\n\t\t\t\t.shared-theme .app-header{color:" + header.text + ";}\n\t\t\t\t.shared-theme .toolbar-buttons{color:" + header.text + "}"
                : null);
            styles.push((button === null || button === void 0 ? void 0 : button.background) ? ".shared-theme .esri-icon-close:before, .shared-theme .esri-icon-search:before, \n\t\t\t\t.shared-theme .esri-clear-search,.shared-theme .esri-search__submit-button{\n\t\t\t\t\tcolor:" + (button === null || button === void 0 ? void 0 : button.background) + "\n\t\t\t\t}\n\t\t\t\t\t.shared-theme .app-button:hover, \n\t\t\t\t\t.shared-theme .app-button{\n\t\t\t\t\t\tbackground:" + (button === null || button === void 0 ? void 0 : button.background) + ";\n\t\t\t\t\t\tborder-color:" + (button === null || button === void 0 ? void 0 : button.background) + ";\n\t\t\t\t\t} \n\t\t\t\t\t.shared-theme #detailPanel .svg-icon{\n\t\t\t\t\t\tcolor:" + (button === null || button === void 0 ? void 0 : button.background) + ";\n\t\t\t\t\t}"
                : null);
            styles.push((button === null || button === void 0 ? void 0 : button.text) ? ".shared-theme .app-button, .shared-theme .app-button:hover{\n\t\t\t\t\tcolor:" + (button === null || button === void 0 ? void 0 : button.text) + ";\n\t\t\t\t}"
                : null);
            var style = document.createElement('style');
            style.appendChild(document.createTextNode(styles.join('')));
            document.getElementsByTagName('head')[0].appendChild(style);
        };
        LocationApp.prototype.handleThemeUpdates = function () {
            // Check for a preferred color scheme and then
            // monitor updates to that color scheme and the
            // configuration panel updates.
            var _a = this._appConfig, theme = _a.theme, applySharedTheme = _a.applySharedTheme;
            if (theme) {
                var style = document.getElementById("esri-stylesheet");
                style.href = style.href.indexOf("light") !== -1 ? style.href.replace(/light/g, theme) : style.href.replace(/dark/g, theme);
                // add light/dark class
                document.body.classList.add(theme === "light" ? "light" : "dark");
                document.body.classList.remove(theme === "light" ? "dark" : "light");
            }
            applySharedTheme ? document.body.classList.add("shared-theme") : document.body.classList.remove("shared-theme");
        };
        LocationApp.prototype._updateMapVisibility = function (config) {
            // Hide the map when it is configured to display 
            // without a map option 
            var hide = config.hideMap;
            var hideMapClass = "no-map";
            var mapClassList = document.body.classList;
            hide ? mapClassList.add(hideMapClass) : mapClassList.remove(hideMapClass);
        };
        LocationApp.prototype._cleanUpHandles = function () {
            // Remove configuration handles after load
            // if the app isn't within the config experience. 
            if (!this._appConfig.withinConfigurationExperience) {
                this._handles.remove("configuration");
            }
        };
        return LocationApp;
    }());
    return LocationApp;
});
//# sourceMappingURL=Main.js.map