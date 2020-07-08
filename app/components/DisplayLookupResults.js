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
define(["require", "exports", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/core/Handles", "esri/widgets/support/widget", "../utilites/geometryUtils", "esri/core/promiseUtils", "esri/core/watchUtils", "../utilites/lookupLayerUtils", "esri/views/layers/support/FeatureFilter", "esri/views/layers/support/FeatureEffect", "./GroupedAccordion", "esri/widgets/Expand", "dojo/i18n!../nls/resources"], function (require, exports, decorators_1, Widget_1, Handles_1, widget_1, geometryUtils_1, promiseUtils_1, watchUtils_1, lookupLayerUtils_1, FeatureFilter_1, FeatureEffect_1, GroupedAccordion_1, Expand_1, i18n) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Widget_1 = __importDefault(Widget_1);
    Handles_1 = __importDefault(Handles_1);
    FeatureFilter_1 = __importDefault(FeatureFilter_1);
    FeatureEffect_1 = __importDefault(FeatureEffect_1);
    GroupedAccordion_1 = __importDefault(GroupedAccordion_1);
    Expand_1 = __importDefault(Expand_1);
    var CSS = {
        calciteStyles: {
            clearBtn: 'btn-transparent',
            smallBtn: 'btn-small',
            button: 'btn',
            right: 'right',
            leaderFull: 'margin-left-1',
            leaderHalf: 'leader-half',
            trailer0: 'trailer-0',
            panel: 'panel',
            panelNoBorder: 'panel-no-border',
            panelNoPadding: 'panel-no-padding',
        },
        togglePanel: 'toggle-panel',
        toggle: 'toggleOpen',
        messageText: 'message-text',
        openItems: 'open-items',
        collapseItems: 'collapse-items',
        toggleContentTools: 'toggle-content-tools',
        toggleContentBtn: 'toggle-content-btn',
        collapse: 'collapse',
        expand: 'expand'
    };
    var expandSVG = widget_1.tsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 26 26" },
        widget_1.tsx("polygon", { points: "23.6 14.95 23.6 23.63 14.94 23.63 14.94 22.19 21.16 22.19 13.83 14.81 14.84 13.8 22.17 21.18 22.17 14.95 23.6 14.95" }),
        widget_1.tsx("polygon", { points: "11.06 3.83 11.06 2.4 2.4 2.4 2.4 11.07 3.83 11.07 3.83 4.84 11.27 12.41 12.28 11.4 4.84 3.83 11.06 3.83" }),
        widget_1.tsx("path", { d: "M24,1a1,1,0,0,1,1,1V24a1,1,0,0,1-1,1H2a1,1,0,0,1-1-1V2A1,1,0,0,1,2,1H24m0-1H2A2,2,0,0,0,0,2V24a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2V2a2,2,0,0,0-2-2Z" }));
    var collapseSVG = widget_1.tsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 26 26" },
        widget_1.tsx("polygon", { points: "14.88 23.48 14.88 14.81 23.54 14.81 23.54 16.25 17.32 16.25 25.47 24.41 24.46 25.42 16.31 17.26 16.31 23.48 14.88 23.48" }),
        widget_1.tsx("polygon", { points: "2.75 9.97 2.75 11.4 11.4 11.4 11.4 2.73 9.97 2.73 9.97 8.96 1.82 0.8 0.81 1.81 8.96 9.97 2.75 9.97" }),
        widget_1.tsx("path", { d: "M24,1a1,1,0,0,1,1,1V24a1,1,0,0,1-1,1H2a1,1,0,0,1-1-1V2A1,1,0,0,1,2,1H24m0-1H2A2,2,0,0,0,0,2V24a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2V2a2,2,0,0,0-2-2Z" }));
    var DisplayLookupResults = /** @class */ (function (_super) {
        __extends(DisplayLookupResults, _super);
        //--------------------------------------------------------------------------
        //
        //  Public Methods
        //
        //--------------------------------------------------------------------------
        function DisplayLookupResults(props) {
            var _this = _super.call(this, props) || this;
            _this.lookupGraphics = null;
            _this.empty = true;
            _this.lookupLayers = null;
            _this.expand = [];
            _this.directions = null;
            _this.state = 'init';
            //--------------------------------------------------------------------------
            //
            // Variables
            //
            //--------------------------------------------------------------------------
            _this._featureResults = null;
            _this._viewPoint = null;
            _this._accordion = null;
            _this._handles = new Handles_1.default();
            _this._toggle = false;
            return _this;
        }
        DisplayLookupResults.prototype.render = function () {
            var loader = this.state === 'loading' ? (widget_1.tsx("div", { key: "loader", class: "loader is-active padding-leader-3 padding-trailer-3" },
                widget_1.tsx("div", { key: "loaderBars", class: "loader-bars" }),
                widget_1.tsx("div", { key: "loaderText", class: "loader-text" },
                    i18n.load.label,
                    "..."))) : null;
            var ready = this.state === 'ready' || false;
            // No Results 
            var errorText = null;
            if (this.empty && ready) {
                errorText = this.config.noResultsMessage || i18n.noFeatures;
                this._featureResults = null;
                if (this.mapPanel && this.mapPanel.isMobileView) {
                    // Add no results message to the map in mobile view
                    this.mapPanel.message = errorText;
                }
            }
            // feature or group there
            var accordion = ready ? (widget_1.tsx("div", { key: "accordion" },
                widget_1.tsx("p", { key: "errorText", class: CSS.messageText, innerHTML: errorText }),
                widget_1.tsx("div", { key: "detailAccordion", bind: this, afterCreate: !this.empty ? this._addDetailAccordion : null }))) : null;
            var togglePanel = this._featureResults ? this.createTogglePanel() : null;
            return (widget_1.tsx("div", { key: "loader" },
                loader,
                togglePanel,
                accordion));
        };
        DisplayLookupResults.prototype._addDetailAccordion = function (container) {
            var _this = this;
            var _a, _b;
            var _c = this, _featureResults = _c._featureResults, view = _c.view;
            var eventHandler = this._handleActionItem.bind(this);
            var actionItems = [];
            if (this.config.showDirections) { // check status
                if (((_b = (_a = this === null || this === void 0 ? void 0 : this.directions) === null || _a === void 0 ? void 0 : _a.viewModel) === null || _b === void 0 ? void 0 : _b.state) === "ready") {
                    actionItems.push({
                        icon: 'icon-ui-map-pin',
                        id: 'directions',
                        name: this.directions && this.directions.label ? this.directions.label : 'Directions',
                        handleClick: eventHandler
                    });
                }
            }
            this.accordion = new GroupedAccordion_1.default({
                actionBarItems: actionItems,
                featureResults: _featureResults,
                config: this.config,
                view: view,
                container: container
            });
            this.accordion.watch("hoveredItem", function () {
                if (_this.accordion.hoveredItem && _this.accordion.hoveredItem.graphic) {
                    var location_1 = _this.accordion.hoveredItem.graphic.geometry;
                    if (location_1 && location_1.type !== "point") {
                        location_1 = location_1.extent.center;
                    }
                    var title = _this.accordion.hoveredItem.title;
                    if (title) {
                        _this.view.popup.dockEnabled = false;
                        _this.view.popup.dockOptions.buttonEnabled = false;
                        _this.view.popup.open({
                            location: location_1,
                            content: "<div style=\"text-align:center;padding-top:10px;\">" + title + "</div>"
                        });
                        var puContainer_1 = _this.view.popup.container;
                        puContainer_1.classList.add("no-title");
                        var container_1 = _this.accordion.hoveredItem.container;
                        container_1 && container_1.addEventListener("mouseleave", function () {
                            _this.view.popup.close();
                            puContainer_1.classList.remove("no-title");
                        });
                    }
                    _this._highlightFeature(_this.accordion.hoveredItem.graphic);
                }
            });
            this.accordion.watch('selectedItem', function () {
                _this._clearDirections();
                if (_this.accordion.selectedItem) {
                    _this._highlightFeature(_this.accordion.selectedItem);
                    _this.accordion.zoom && _this._zoomToFeature(_this.accordion.selectedItem);
                    _this.mapPanel.selectedItemTitle =
                        _this.accordion.selectedItem.attributes['app-accordion-title'] || null;
                }
                _this.accordion.selectedItem = null;
            });
        };
        DisplayLookupResults.prototype._handleActionItem = function (name, selected) {
            return __awaiter(this, void 0, void 0, function () {
                var start, stop, results, printPage_1, closebutton, mainNodes, j, node, expand;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            start = this._createStop(this.location);
                            stop = this._createStop(selected);
                            if (!(this.directions && this.directions.viewModel)) return [3 /*break*/, 4];
                            this._clearDirections();
                            this.directions.viewModel.stops.addMany([start, stop]);
                            return [4 /*yield*/, this.directions.viewModel.getDirections()];
                        case 1:
                            _a.sent();
                            if (!this.config.hideMap) return [3 /*break*/, 3];
                            return [4 /*yield*/, this.directions.getDirections()];
                        case 2:
                            results = _a.sent();
                            printPage_1 = document.getElementById("printPanel");
                            printPage_1.classList.remove("hide");
                            closebutton = document.createElement("button");
                            closebutton.classList.add("btn");
                            closebutton.classList.add("btn-transparent");
                            closebutton.classList.add("right");
                            closebutton.setAttribute("aria-label", i18n.tools.close);
                            closebutton.title = i18n.tools.close;
                            closebutton.addEventListener("click", function () {
                                printPage_1.classList.add("hide");
                            });
                            closebutton.innerHTML = "<svg class=\"svg-icon\" xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" viewBox=\"0 0 32 32\"><path d=\"M18.404 16l9.9 9.9-2.404 2.404-9.9-9.9-9.9 9.9L3.696 25.9l9.9-9.9-9.9-9.898L6.1 3.698l9.9 9.899 9.9-9.9 2.404 2.406-9.9 9.898z\" /></svg>";
                            printPage_1.appendChild(closebutton);
                            printPage_1.appendChild(this.directions.container);
                            return [3 /*break*/, 4];
                        case 3:
                            // In mobile view switch to map after directions are calcuated. 
                            if (this.view && this.view.container && getComputedStyle(this.view.container).display === "none") {
                                mainNodes = document.getElementsByClassName('icon-ui-maps');
                                for (j = 0; j < mainNodes.length; j++) {
                                    node = mainNodes[j];
                                    node.classList.remove('icon-ui-maps');
                                    node.classList.add('icon-ui-table');
                                    node.innerHTML = i18n.tools.results;
                                }
                                this.footer && this.footer.showMap();
                            }
                            expand = new Expand_1.default({
                                content: this.directions.container,
                                expandTooltip: this.directions.label,
                                expanded: true,
                                mode: "floating",
                                expandIconClass: "esri-icon-directions",
                                group: "bottom-right"
                            });
                            this.expand.push(expand);
                            this.view.ui.add(expand, 'bottom-right');
                            _a.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        DisplayLookupResults.prototype._createStop = function (graphic) {
            var returnGraphic = graphic.clone();
            var type = graphic.geometry.type;
            if (type === "polygon") {
                var geometry = graphic.geometry;
                returnGraphic.geometry = geometry.centroid;
            }
            else if (type === "polyline") {
                var geometry = graphic.geometry;
                returnGraphic.geometry = geometry.extent.center;
            }
            return returnGraphic;
        };
        DisplayLookupResults.prototype.queryFeatures = function (location) {
            return __awaiter(this, void 0, void 0, function () {
                var promises;
                var _this = this;
                return __generator(this, function (_a) {
                    this.location = location;
                    this.lookupGraphics.graphic = location;
                    this.state = 'loading';
                    promises = [];
                    if (!location) {
                        this.state = 'init';
                        this._featureResults = [];
                        promiseUtils_1.resolve();
                    }
                    else {
                        this.lookupGraphics.addGraphics();
                        this.lookupLayers.forEach(function (layer) {
                            promises.push(_this._queryFeatureLayers(layer, location.geometry));
                        });
                    }
                    return [2 /*return*/, Promise.all(promises).then(function (results) {
                            _this._featureResults = [];
                            var groupResultsByLayer = _this.config.groupResultsByLayer;
                            // Reverse the results so the order matches the legend but  
                            // if singleLocationPolygons is true display the polygon result at the top
                            if (!_this.config.singleLocationPolygons) {
                                results.reverse();
                            }
                            // Loop through the feaures 
                            results.forEach(function (result) {
                                // do we have features? 
                                if (result.features && result.features.length && result.features.length > 0) {
                                    if (groupResultsByLayer) {
                                        var sortedFeatures = result.features;
                                        _this._sortFeatures(sortedFeatures);
                                        _this._featureResults.push({
                                            title: result.title,
                                            features: sortedFeatures
                                        });
                                    }
                                    else {
                                        // all features shown as individual results
                                        var features_1 = [];
                                        results.forEach(function (result) { features_1.push.apply(features_1, result.features); });
                                        _this._sortFeatures(features_1);
                                        _this._featureResults = [{
                                                features: features_1,
                                                title: null,
                                                grouped: false
                                            }];
                                    }
                                }
                            });
                            _this.empty = _this._featureResults ? _this._featureResults.every(function (result) {
                                return result.features && result.features.length && result.features.length > 0 ? false : true;
                            }) : true;
                            _this.state = 'ready';
                        }, function () {
                            _this.state = "init";
                        })];
                });
            });
        };
        DisplayLookupResults.prototype._queryFeatureLayers = function (layer, location) {
            return __awaiter(this, void 0, void 0, function () {
                var layerView, queryLayer, query;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.view.whenLayerView(layer)];
                        case 1:
                            layerView = _a.sent();
                            if (!layerView.updating) return [3 /*break*/, 3];
                            return [4 /*yield*/, watchUtils_1.whenFalseOnce(layerView, "updating")];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            queryLayer = this._getQueryLayer(layerView);
                            query = this._createQuery(layerView, location);
                            return [2 /*return*/, queryLayer.queryFeatures(query).then(function (results) {
                                    if (results.features && results.features.length && results.features.length > 0) {
                                        _this._applyLayerEffectAndFilter(layerView, query);
                                    }
                                    else {
                                        // hide other layers 
                                        query.where = "1=0";
                                        _this._applyLayerEffectAndFilter(layerView, query);
                                    }
                                    return promiseUtils_1.resolve({
                                        features: results.features,
                                        title: layer.get("title") ? layer.get("title") : null,
                                        id: layer.get("id") ? layer.get("id") : null
                                    });
                                })];
                    }
                });
            });
        };
        DisplayLookupResults.prototype._createQuery = function (layer, location) {
            var _a = this.config, relationship = _a.relationship, searchUnits = _a.searchUnits, singleLocationPolygons = _a.singleLocationPolygons;
            var type = layer.layer.geometryType;
            // we need return geom since we have to get distances and zoom to selected 
            var query = layer.layer.createQuery();
            // Find features that are within x distance of search geometry
            query.geometry = location;
            // Always set with points and lines but also set for 
            // polygons that don't have singleLocationPolygons set to true
            query.distance = type === "polygon" && singleLocationPolygons ? 0 : this.config.sliderRange.default;
            query.units = searchUnits;
            query.spatialRelationship = relationship;
            return query;
        };
        DisplayLookupResults.prototype._getFeatureCount = function (results) {
            var count = 0;
            results && results.forEach(function (result) {
                if (result.features && result.features.length) {
                    count += result.features.length;
                }
            });
            var countString = i18n.count + ": " + count;
            return count < 2 || !this.config.showResultCount ? null : widget_1.tsx("span", { class: this.classes('total-count') }, countString);
        };
        DisplayLookupResults.prototype._clearDirections = function () {
            var _this = this;
            if (this.directions && this.directions.viewModel) {
                this.directions.viewModel.stops.removeAll();
                this.directions.viewModel.reset();
                if (this.expand) {
                    this.expand.forEach(function (expand) {
                        _this.view.ui.remove(expand);
                    });
                }
            }
            if (this.config.hideMap) {
                var printPage = document.getElementById("printPanel");
                printPage.classList.add("hide");
                printPage.innerHTML = null;
            }
        };
        DisplayLookupResults.prototype._getQueryLayer = function (layerView) {
            //return layerView.layer;
            var unsupportedIds = ["4742", "8042", "8086", "4757"];
            var view = this.view;
            if (this.config.hideMap || this.config.hideLayers) {
                return layerView.layer;
            }
            if (!layerView.visible) {
                return layerView.layer;
            }
            if (view && view.container && getComputedStyle(this.view.container).display === "none") {
                return layerView.layer;
            }
            else if (view && view.spatialReference && (!view.spatialReference.isGeographic && !view.spatialReference.isWGS84 && !view.spatialReference.isWebMercator)) {
                return layerView.layer;
            }
            else if (view && view.spatialReference && view.spatialReference.wkid && unsupportedIds.indexOf(view.spatialReference.wkid.toString()) !== -1) {
                return layerView.layer;
            }
            else {
                return layerView.layer;
            }
        };
        DisplayLookupResults.prototype._applyLayerEffectAndFilter = function (layerView, query) {
            var _a, _b;
            var geometry = query.geometry, units = query.units, spatialRelationship = query.spatialRelationship, where = query.where;
            var props = {
                geometry: geometry,
                spatialRelationship: spatialRelationship,
                where: where
            };
            if ((_b = (_a = this.config) === null || _a === void 0 ? void 0 : _a.sliderRange) === null || _b === void 0 ? void 0 : _b.default) {
                props.distance = this.config.sliderRange.default;
                if (units) {
                    props.units = units;
                }
            }
            var filter = new FeatureFilter_1.default(props);
            var effect = new FeatureEffect_1.default({ filter: filter });
            layerView.filter = filter;
            layerView.effect = effect;
        };
        DisplayLookupResults.prototype._sortFeatures = function (features) {
            var _a = this.config, includeDistance = _a.includeDistance, searchUnits = _a.searchUnits, sliderRange = _a.sliderRange;
            if (includeDistance && this.location && sliderRange) {
                // add distance val to the features and sort array by distance
                geometryUtils_1.getDistances({
                    location: this.location.geometry,
                    distance: sliderRange === null || sliderRange === void 0 ? void 0 : sliderRange.default,
                    unit: searchUnits,
                    features: features
                });
                // sort the features based on the distance
                features.sort(function (a, b) {
                    var alookup = a.attributes.lookupDistance ? parseFloat(a.attributes.lookupDistance.replace(/[,]/g, '')) : null;
                    var blookup = b.attributes.lookupDistance ? parseFloat(b.attributes.lookupDistance.replace(/[,]/g, '')) : null;
                    return alookup - blookup;
                });
            }
        };
        DisplayLookupResults.prototype.clearResults = function () {
            this._toggle = false;
            this.empty = true;
            this.lookupGraphics.clearGraphics();
            this.accordion && this.accordion.clear();
            this._featureResults = null;
            if (this.config.hideLayers) {
                lookupLayerUtils_1.hideLookuplayers(this.lookupLayers, this.view);
            }
            else {
                lookupLayerUtils_1.clearLookupLayers(this.lookupLayers, this.view);
            }
            this._clearDirections();
            this.clearHighlights();
            this.state = 'init';
        };
        DisplayLookupResults.prototype.clearHighlights = function () {
            this._handles.removeAll();
        };
        DisplayLookupResults.prototype._highlightFeature = function (graphic) {
            var _this = this;
            this.clearHighlights();
            this.view.whenLayerView(graphic.layer).then(function (layerView) {
                // highlight feature
                _this._handles.add(layerView.highlight(graphic));
            });
        };
        DisplayLookupResults.prototype._zoomToFeature = function (graphic) {
            this.view.goTo(graphic);
            this._highlightFeature(graphic);
        };
        DisplayLookupResults.prototype.destroy = function () {
            this.clearResults();
            this.clearHighlights();
        };
        DisplayLookupResults.prototype.createTogglePanel = function () {
            var count = this._getFeatureCount(this._featureResults);
            var toggleLinks = this._createToggleLinks();
            return count || toggleLinks ? (widget_1.tsx("div", { class: this.classes(CSS.togglePanel) },
                toggleLinks,
                count)) : null;
        };
        DisplayLookupResults.prototype._createToggleLinks = function () {
            var buttonLabel = this._toggle ? i18n.tools.collapse : i18n.tools.open;
            var buttonImage = this._toggle ? collapseSVG : expandSVG;
            return this.accordion && this.accordion.showToggle() ? (widget_1.tsx("label", { class: this.classes() },
                widget_1.tsx("button", { "aria-label": buttonLabel, bind: this, key: buttonLabel, class: this.classes(CSS.calciteStyles.button, CSS.toggleContentBtn, CSS.calciteStyles.clearBtn, CSS.calciteStyles.smallBtn, CSS.expand), onclick: this._toggleItems }, buttonImage),
                buttonLabel)) : null;
        };
        DisplayLookupResults.prototype._toggleItems = function () {
            this._toggle = !this._toggle;
            var elements = document.getElementsByClassName('accordion-section');
            for (var i = 0; i < elements.length; i++) {
                this._toggle ? elements[i].classList.add("is-active") : elements[i].classList.remove("is-active");
            }
        };
        __decorate([
            decorators_1.property()
        ], DisplayLookupResults.prototype, "accordion", void 0);
        __decorate([
            decorators_1.property()
        ], DisplayLookupResults.prototype, "location", void 0);
        __decorate([
            decorators_1.property()
        ], DisplayLookupResults.prototype, "view", void 0);
        __decorate([
            decorators_1.property()
        ], DisplayLookupResults.prototype, "lookupGraphics", void 0);
        __decorate([
            decorators_1.property()
        ], DisplayLookupResults.prototype, "config", void 0);
        __decorate([
            decorators_1.property()
        ], DisplayLookupResults.prototype, "mapPanel", void 0);
        __decorate([
            decorators_1.property()
        ], DisplayLookupResults.prototype, "footer", void 0);
        __decorate([
            decorators_1.property()
        ], DisplayLookupResults.prototype, "empty", void 0);
        __decorate([
            decorators_1.property()
        ], DisplayLookupResults.prototype, "lookupLayers", void 0);
        __decorate([
            decorators_1.property()
        ], DisplayLookupResults.prototype, "expand", void 0);
        __decorate([
            decorators_1.property()
        ], DisplayLookupResults.prototype, "directions", void 0);
        __decorate([
            decorators_1.property()
        ], DisplayLookupResults.prototype, "portal", void 0);
        __decorate([
            decorators_1.property(),
            widget_1.renderable()
        ], DisplayLookupResults.prototype, "state", void 0);
        DisplayLookupResults = __decorate([
            decorators_1.subclass('app.DisplayLookupResults')
        ], DisplayLookupResults);
        return DisplayLookupResults;
    }((Widget_1.default)));
    exports.default = DisplayLookupResults;
});
//# sourceMappingURL=DisplayLookupResults.js.map