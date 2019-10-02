define(["require", "exports", "esri/Graphic", "esri/layers/GraphicsLayer", "esri/geometry/Polygon", "esri/symbols/SimpleFillSymbol", "esri/geometry/support/webMercatorUtils", "esri/geometry/SpatialReference"], function (require, exports, Graphic, GraphicsLayer, Polygon, SimpleFillSymbol, webMercUtils, SpatialReference) {
    "use strict";
    var MaskLayer = /** @class */ (function () {
        function MaskLayer(map, options) {
            this.declaredClass = "arcgisonline.sharing.dijit.MaskLayer";
            this._outerRing = [[180, -90], [-180, -90], [-180, 90], [180, 90], [180, -90]];
            this._outerPoly = new Polygon({ rings: this._outerRing });
            this._map = null;
            this._geometryServiceUrl = null;
            this._maskSymbol = new SimpleFillSymbol({
                color: [0, 0, 0, 0.5],
                outline: {
                    color: [128, 128, 128, 0.5],
                    width: "0px"
                }
            });
            this.maskLayer = new GraphicsLayer({ id: "maskLayer" });
            this.overlapLayer = new GraphicsLayer({ id: "overlapLayer" });
            this._map = map;
            this._map.add(this.maskLayer);
            this._map.add(this.overlapLayer);
            if (options) {
                // do something
                this._maskSymbol = options.maskSymbol || this._maskSymbol;
                this._geometryServiceUrl = options.geometryServiceUrl || null;
            }
        }
        MaskLayer.prototype.hide = function () {
            this.maskLayer.visible = false;
        };
        MaskLayer.prototype.show = function () {
            this.maskLayer.visible = true;
        };
        MaskLayer.prototype.add = function (geom, sym) {
            var graphicResult = this._buildGraphic(geom, sym);
            if (!graphicResult) {
                return;
            }
            if (graphicResult["error"]) {
                //this.emit("error", { error: "overlap", desc: _i18n.extentpicker.error.overDateLine });
                return false;
            }
            this.maskLayer.add(graphicResult["graphic"]);
            return graphicResult;
        };
        MaskLayer.prototype.update = function (geom, sym, index) {
            if (!index) {
                this.clear();
            }
            else {
                this.remove(null, index);
            }
            var graphicResult = this._buildGraphic(geom, sym);
            if (!graphicResult) {
                return;
            }
            if (graphicResult["error"]) {
                return graphicResult;
            }
            this.maskLayer.add(graphicResult["graphic"]);
            return graphicResult;
        };
        MaskLayer.prototype._buildGraphic = function (geom, sym) {
            var result = {};
            if (!sym) {
                sym = this._maskSymbol;
            }
            if (geom.type === "extent" && geom["xmax"] === geom["xmin"]) {
                var poly_1 = new Polygon({
                    rings: this._outerRing
                });
                result["graphic"] = new Graphic({ geometry: poly_1, symbol: sym });
                return result;
            }
            geom = this._toWGS84(geom);
            var innerRing;
            var overlap = null;
            if (geom.type === "extent") {
                var olap = this._checkPolyOverlap(geom);
                if (olap) {
                    innerRing = olap["ring"].reverse();
                    overlap = olap["oring"].reverse();
                }
                else {
                    innerRing = [
                        [geom["xmin"], geom["ymax"]],
                        [geom["xmax"], geom["ymax"]],
                        [geom["xmax"], geom["ymin"]],
                        [geom["xmin"], geom["ymin"]],
                        [geom["xmin"], geom["ymax"]]
                    ];
                }
            }
            else {
                innerRing = geom["rings"];
            }
            var ringArray = [];
            if (geom["xmin"] === geom["xmax"]) {
                ringArray = this._outerRing;
            }
            else {
                ringArray = [this._outerRing, innerRing.reverse()];
            }
            var poly = new Polygon({
                rings: ringArray
            });
            if (overlap) {
                result["overlap"] = overlap;
            }
            result["graphic"] = new Graphic({ geometry: poly, symbol: sym });
            return result;
        };
        MaskLayer.prototype._checkPolyOverlap = function (ext) {
            // check to see if extent overlaps 180th meridian
            if (ext["xmax"] <= ext["xmin"]) {
                var lring = [
                    [ext["xmin"], ext["ymin"]],
                    [180, ext["ymin"]],
                    [180, ext["ymax"]],
                    [ext["xmin"], ext["ymax"]],
                    [ext["xmin"], ext["ymin"]]
                ];
                var rring = [
                    [-180, ext["ymin"]],
                    [ext["xmax"], ext["ymin"]],
                    [ext["xmax"], ext["ymax"]],
                    [-180, ext["ymax"]],
                    [-180, ext["ymin"]]
                ];
                var right = 180 - Math.abs(ext["xmax"]);
                var left = 180 - Math.abs(ext["xmin"]);
                var overlap = {};
                if (right > left) {
                    overlap["ring"] = rring;
                    overlap["oring"] = lring;
                }
                else {
                    overlap["ring"] = lring;
                    overlap["oring"] = rring;
                }
                return overlap;
            }
            else {
                return false;
            }
        };
        MaskLayer.prototype.clear = function (layer) {
            if (layer && layer !== "overlap") {
                layer = "maskLayer";
            }
            this.maskLayer.removeAll();
        };
        MaskLayer.prototype.remove = function (g, i) {
            if (!g && !i) {
                return false;
            }
            if (i && !g) {
                g = this.maskLayer.graphics[i] ? this.maskLayer.graphics[i] : null;
            }
            if (!g) {
                return;
            }
            this.maskLayer.remove(g);
        };
        MaskLayer.prototype.toTop = function () {
            var len = this._map.layers.length - 1;
            this._map.reorder(this.maskLayer, len);
        };
        MaskLayer.prototype.setIndex = function (i) {
            this._map.reorder(this.maskLayer, i);
        };
        MaskLayer.prototype.setSymbol = function (s) {
            this._maskSymbol = s;
            this._updateSymbol();
        };
        MaskLayer.prototype.setOverlapSymbol = function (s) {
            this._maskSymbol = s;
            this._updateSymbol("overlapLayer");
        };
        MaskLayer.prototype._updateSymbol = function (layer) {
            if (layer && layer !== "overlap") {
                layer = "maskLayer";
            }
            this.maskLayer[layer].forEach(function (g) {
                g.symbol = this._maskSymbol;
            });
        };
        MaskLayer.prototype._toWGS84 = function (d) {
            var sr = new SpatialReference({ wkid: 4326 });
            return webMercUtils.canProject(d, sr) ? webMercUtils.project(d, sr) : d;
        };
        return MaskLayer;
    }());
    return MaskLayer;
});
//# sourceMappingURL=MaskLayer.js.map