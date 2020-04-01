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
define(["require", "exports", "esri/Graphic", "esri/Color", "esri/views/support/colorUtils", "esri/geometry/SpatialReference", "esri/geometry/geometryEngine", "esri/geometry"], function (require, exports, Graphic_1, Color_1, colorUtils, SpatialReference_1, geometryEngine_1, geometry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Graphic_1 = __importDefault(Graphic_1);
    Color_1 = __importDefault(Color_1);
    colorUtils = __importStar(colorUtils);
    SpatialReference_1 = __importDefault(SpatialReference_1);
    geometryEngine_1 = __importDefault(geometryEngine_1);
    function getDistances(params) {
        return __awaiter(this, void 0, void 0, function () {
            var location, unit, locale, geodesic, sr, feature, sr2, type, srValid, sr2Valid;
            return __generator(this, function (_a) {
                location = params.location, unit = params.unit;
                locale = document.documentElement.lang || "en";
                geodesic = false;
                if (location && location.type && location.type === "point") {
                    sr = (location && location.spatialReference) ? location.spatialReference : null;
                    feature = params.features && params.features.length && params.features.length > 0 ? params.features[0] : null;
                    sr2 = feature.geometry && feature.geometry.spatialReference ? feature.geometry.spatialReference : null;
                    type = (feature.geometry && feature.geometry.type) ? feature.geometry.type : null;
                    if (type === "point" && (sr.wkid === sr2.wkid)) {
                        srValid = sr.isGeographic || sr.isWebMercator;
                        sr2Valid = sr.isGeographic || sr.isWebMercator;
                        if (srValid && sr2Valid) {
                            geodesic = true;
                        }
                    }
                }
                params.features.forEach(function (feature) {
                    var distance;
                    if (geodesic) {
                        var pt1 = location;
                        var pt2 = feature.geometry;
                        var polyLine = new geometry_1.Polyline({
                            paths: [[[pt1.x, pt1.y], [pt2.x, pt2.y]]],
                            spatialReference: pt1.spatialReference
                        });
                        distance = geometryEngine_1.default.geodesicLength(polyLine, unit);
                    }
                    else {
                        distance = geometryEngine_1.default.distance(location, feature.geometry, unit);
                    }
                    if (feature && feature.attributes) {
                        feature.attributes.lookupDistance = distance !== null ? distance.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null;
                    }
                });
                return [2 /*return*/];
            });
        });
    }
    exports.getDistances = getDistances;
    function getBasemapTheme(view) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, colorUtils.getBackgroundColorTheme(view)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    }
    exports.getBasemapTheme = getBasemapTheme;
    function bufferGeometry(params) {
        var location = params.location, distance = params.distance, unit = params.unit;
        var spatialReference = location.spatialReference ||
            new SpatialReference_1.default({
                wkid: 102100
            });
        if (spatialReference.isWGS84 || spatialReference.isWebMercator) {
            return geometryEngine_1.default.geodesicBuffer(location, distance, unit);
        }
        else {
            return geometryEngine_1.default.buffer(location, distance, unit);
        }
    }
    exports.bufferGeometry = bufferGeometry;
    function createBufferGraphic(geometry, theme, config) {
        // determine theme and apply color based on that 
        var lightColor = config.lightColor, darkColor = config.darkColor;
        if (!theme)
            theme = "light";
        var hexVal = theme === "light" ? lightColor : darkColor;
        var color = new Color_1.default(hexVal);
        var fillColor = color.clone();
        fillColor.a = 0.08;
        var fillSymbol = {
            type: 'simple-fill',
            color: theme === "light" ? fillColor : null,
            outline: {
                color: color
            }
        };
        var bufferGraphic = new Graphic_1.default({
            geometry: geometry,
            symbol: fillSymbol
        });
        return bufferGraphic;
    }
    exports.createBufferGraphic = createBufferGraphic;
});
//# sourceMappingURL=geometryUtils.js.map