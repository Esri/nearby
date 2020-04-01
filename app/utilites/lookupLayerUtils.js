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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
define(["require", "exports", "esri/core/Collection", "esri/views/layers/support/FeatureFilter", "esri/core/promiseUtils", "../utilites/geometryUtils", "esri/Graphic", "esri/symbols", "esri/views/layers/support/FeatureEffect"], function (require, exports, Collection, FeatureFilter_1, promiseUtils, geometryUtils, Graphic_1, symbols_1, FeatureEffect) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    FeatureFilter_1 = __importDefault(FeatureFilter_1);
    geometryUtils = __importStar(geometryUtils);
    Graphic_1 = __importDefault(Graphic_1);
    function getLookupLayers(props) {
        return __awaiter(this, void 0, void 0, function () {
            var view, hideFeaturesOnLoad, lookupLayers, searchableLayers, returnLayers;
            return __generator(this, function (_a) {
                view = props.view, hideFeaturesOnLoad = props.hideFeaturesOnLoad, lookupLayers = props.lookupLayers;
                searchableLayers = !lookupLayers ? view.map.layers : new Collection();
                returnLayers = [];
                // Get all the map layers
                if (lookupLayers) {
                    // get any predefined layers otherwise we'll use all map layers
                    lookupLayers.forEach(function (layerItem) {
                        if (layerItem.id) {
                            if (layerItem.type === 'DynamicLayer') {
                                var sublayerId = layerItem.id.lastIndexOf('.');
                                if (sublayerId !== -1) {
                                    var id = layerItem.id.slice(0, sublayerId);
                                    var layer = view.map.findLayerById(id);
                                    if (layer && searchableLayers.indexOf(layer) === -1) {
                                        searchableLayers.add(layer);
                                    }
                                }
                            }
                            else {
                                // feature layer
                                var layer = view.map.findLayerById(layerItem.id);
                                if (!layer) {
                                    //maybe its a feature collection
                                    var sublayerId = layerItem.id.lastIndexOf('_');
                                    if (sublayerId !== -1) {
                                        var id = layerItem.id.slice(0, sublayerId);
                                        layer = view.map.findLayerById(id);
                                    }
                                }
                                // disable clustering 
                                if (layer && layer.get("featureReduction")) {
                                    layer.set("featureReduction", null);
                                }
                                layer && searchableLayers.add(layer);
                            }
                        }
                    });
                }
                // Include the search layer in the lookup layers if specified
                searchableLayers.forEach(function (layer) {
                    if (layer && layer.type) {
                        if (layer.type === 'feature') {
                            var flayer = layer;
                            if (flayer.popupEnabled) {
                                flayer.outFields = ["*"];
                                returnLayers.push(flayer);
                            }
                            // disable clustering 
                            if (flayer && flayer.get("featureReduction")) {
                                flayer.set("featureReduction", null);
                            }
                        }
                        else if (layer.type === 'map-image') {
                            // if sub layers have been enabled during config
                            // only add those. Otherwise add all dynamic sub layers
                            var mapLayer = layer;
                            var checkSubLayer_1 = lookupLayers && lookupLayers.length && lookupLayers.length > 0 ? true : false;
                            mapLayer.sublayers &&
                                mapLayer.sublayers.forEach(function (sublayer) {
                                    if (checkSubLayer_1) {
                                        var configId_1 = sublayer.layer.id + "." + sublayer.id;
                                        lookupLayers.forEach(function (l) {
                                            if (l.id && l.id === configId_1) {
                                                sublayer.createFeatureLayer().then(function (l) {
                                                    view.map.add(l);
                                                    returnLayers.push(l);
                                                });
                                                sublayer.visible = false;
                                            }
                                        });
                                    }
                                    else {
                                        sublayer.createFeatureLayer().then(function (l) {
                                            view.map.add(l);
                                            returnLayers.push(l);
                                        });
                                        sublayer.visible = false;
                                    }
                                });
                        }
                    }
                });
                if (hideFeaturesOnLoad)
                    hideLookuplayers(returnLayers, props.view);
                return [2 /*return*/, promiseUtils.resolve(returnLayers)];
            });
        });
    }
    exports.getLookupLayers = getLookupLayers;
    function getSearchGeometry(props) {
        return __awaiter(this, void 0, void 0, function () {
            var results, view, config, graphic, returnGraphic;
            return __generator(this, function (_a) {
                results = props.results, view = props.view, config = props.config;
                graphic = _getResultGeometries(results);
                // add marker to map
                _addLocationGraphics(graphic, config, view);
                returnGraphic = graphic;
                if (graphic.geometry && graphic.geometry.type && graphic.geometry.type === 'polygon') {
                    returnGraphic = new Graphic_1.default({ geometry: graphic.geometry.extent.center, attributes: graphic.attributes });
                }
                return [2 /*return*/, promiseUtils.resolve(returnGraphic)];
            });
        });
    }
    exports.getSearchGeometry = getSearchGeometry;
    function _addLocationGraphics(graphic, config, view) {
        return __awaiter(this, void 0, void 0, function () {
            var includeAddressText, includeAddressGraphic, lightColor, darkColor, theme, color, geometry, displayText_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        includeAddressText = config.includeAddressText, includeAddressGraphic = config.includeAddressGraphic, lightColor = config.lightColor, darkColor = config.darkColor;
                        return [4 /*yield*/, geometryUtils.getBasemapTheme(view)];
                    case 1:
                        theme = _a.sent();
                        color = theme === "light" ? lightColor : darkColor;
                        if (graphic && graphic.geometry) {
                            geometry = graphic.geometry && graphic.geometry.type === 'point' ? graphic.geometry : graphic.geometry.extent.center;
                            displayText_1 = null;
                            if (graphic && includeAddressText) {
                                if (graphic.attributes && graphic.attributes.Match_addr) {
                                    // replace first comma with a new line character
                                    displayText_1 = graphic.attributes.Match_addr.replace(',', '\n');
                                }
                                else if (graphic.attributes && graphic.attributes.name) {
                                    displayText_1 = graphic.attributes.name;
                                }
                                else if (graphic.layer && graphic.layer.displayField && graphic.layer.displayField !== '') {
                                    displayText_1 = graphic.attributes[graphic.layer.displayField] || null;
                                }
                                else if (graphic.layer && graphic.layer.fields) {
                                    // get the first string field?
                                    graphic.layer.fields.some(function (field) {
                                        if (field.type === 'string') {
                                            displayText_1 = graphic.attributes[field.name];
                                            return true;
                                        }
                                    });
                                }
                            }
                            if (displayText_1) {
                                view.graphics.add(new Graphic_1.default({
                                    geometry: geometry,
                                    symbol: new symbols_1.TextSymbol({
                                        font: {
                                            size: 12
                                        },
                                        text: displayText_1,
                                        color: color,
                                        horizontalAlignment: 'center'
                                    })
                                }));
                            }
                            if (includeAddressGraphic) {
                                view.graphics.add(new Graphic_1.default({
                                    geometry: geometry,
                                    symbol: new symbols_1.TextSymbol({
                                        color: color,
                                        text: '\ue61d',
                                        yoffset: 10,
                                        font: {
                                            size: 20,
                                            family: 'calcite-web-icons'
                                        }
                                    })
                                }));
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    function _getResultGeometries(results) {
        var feature = null;
        results.results.some(function (searchResults) {
            return searchResults.results.some(function (r) {
                if (r.feature) {
                    feature = r.feature;
                    if (r.name && feature.attributes) {
                        feature.attributes.name = r.name;
                    }
                    return true;
                }
                else {
                    return false;
                }
            });
        });
        return feature;
    }
    function hideLookuplayers(layers, view) {
        var noMap = document.body.classList.contains('no-map');
        if (noMap) {
            return;
        }
        layers.forEach(function (layer) {
            view.whenLayerView(layer).then(function (layerView) {
                //hide layers
                layerView.filter = null;
                layerView.effect = new FeatureEffect({
                    excludedEffect: "opacity(0%)",
                    filter: new FeatureFilter_1.default({ where: '1=0' })
                });
            });
        });
    }
    exports.hideLookuplayers = hideLookuplayers;
    function clearLookupLayers(layers, view) {
        layers.forEach(function (layer) {
            view.whenLayerView(layer).then(function (layerView) {
                //hide layers
                layerView.filter = null;
                layerView.effect = new FeatureEffect({
                    excludedEffect: null,
                    filter: null
                });
            });
        });
    }
    exports.clearLookupLayers = clearLookupLayers;
});
//# sourceMappingURL=lookupLayerUtils.js.map