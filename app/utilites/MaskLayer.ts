import Graphic = require("esri/Graphic");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import Extent = require("esri/geometry/Extent");
import Polygon = require("esri/geometry/Polygon");
import SimpleFillSymbol = require("esri/symbols/SimpleFillSymbol");
import webMercUtils = require("esri/geometry/support/webMercatorUtils");
import Geometry = require("esri/geometry/Geometry");
import SpatialReference = require("esri/geometry/SpatialReference");
import Map4 = require("esri/Map");
import Evented = require("esri/core/Evented");


interface MaskLayer extends dojo._base.DeclareCreatedObject, Evented { }

class MaskLayer {
    declaredClass: string = "arcgisonline.sharing.dijit.MaskLayer";

    _outerRing: any = [[180, -90], [-180, -90], [-180, 90], [180, 90], [180, -90]];
    _outerPoly: Polygon = new Polygon({ rings: this._outerRing });
    _map: Map4 = null;
    _geometryServiceUrl: string = null;

    _maskSymbol = new SimpleFillSymbol({
        color: [0, 0, 0, 0.5],
        outline: {
            color: [128, 128, 128, 0.5],
            width: "0px"
        }
    });

    public maskLayer: GraphicsLayer = new GraphicsLayer({ id: "maskLayer" });

    public overlapLayer: GraphicsLayer = new GraphicsLayer({ id: "overlapLayer" });

    constructor(map: Map4, options?: any) {
        this._map = map;
        this._map.add(this.maskLayer);
        this._map.add(this.overlapLayer);
        if (options) {
            // do something
            this._maskSymbol = options.maskSymbol || this._maskSymbol;
            this._geometryServiceUrl = options.geometryServiceUrl || null;
        }
    }

    public hide() {
        this.maskLayer.visible = false;
    }

    public show() {
        this.maskLayer.visible = true;
    }

    public add(geom: any, sym?: SimpleFillSymbol) {
        const graphicResult = this._buildGraphic(geom, sym);
        if (!graphicResult) {
            return;
        }
        if (graphicResult["error"]) {
            //this.emit("error", { error: "overlap", desc: _i18n.extentpicker.error.overDateLine });
            return false;
        }
        this.maskLayer.add(graphicResult["graphic"]);
        return graphicResult;
    }

    public update(geom: Geometry, sym?: SimpleFillSymbol, index?: number) {
        if (!index) {
            this.clear();
        } else {
            this.remove(null, index);
        }
        const graphicResult = this._buildGraphic(geom, sym);
        if (!graphicResult) {
            return;
        }
        if (graphicResult["error"]) {
            return graphicResult;
        }
        this.maskLayer.add(graphicResult["graphic"]);
        return graphicResult;
    }

    private _buildGraphic(geom: Geometry, sym?: SimpleFillSymbol) {
        const result = {};
        if (!sym) {
            sym = this._maskSymbol;
        }
        if (geom.type === "extent" && geom["xmax"] === geom["xmin"]) {
            const poly = new Polygon({
                rings: this._outerRing
            });
            result["graphic"] = new Graphic({ geometry: poly, symbol: sym });
            return result;
        }
        geom = this._toWGS84(geom);

        let innerRing: any;
        let overlap: any = null;
        if (geom.type === "extent") {
            const olap = this._checkPolyOverlap(geom);
            if (olap) {
                innerRing = olap["ring"].reverse();
                overlap = olap["oring"].reverse();
            } else {
                innerRing = [
                    [geom["xmin"], geom["ymax"]],
                    [geom["xmax"], geom["ymax"]],
                    [geom["xmax"], geom["ymin"]],
                    [geom["xmin"], geom["ymin"]],
                    [geom["xmin"], geom["ymax"]]
                ];
            }
        } else {
            innerRing = geom["rings"];
        }
        let ringArray = [];
        if (geom["xmin"] === geom["xmax"]) {
            ringArray = this._outerRing;
        } else {
            ringArray = [this._outerRing, innerRing.reverse()];
        }
        const poly = new Polygon({
            rings: ringArray
        });
        if (overlap) {
            result["overlap"] = overlap;
        }
        result["graphic"] = new Graphic({ geometry: poly, symbol: sym });
        return result;
    }

    private _checkPolyOverlap(ext: Geometry) {
        // check to see if extent overlaps 180th meridian
        if (ext["xmax"] <= ext["xmin"]) {
            const lring = [
                [ext["xmin"], ext["ymin"]],
                [180, ext["ymin"]],
                [180, ext["ymax"]],
                [ext["xmin"], ext["ymax"]],
                [ext["xmin"], ext["ymin"]]
            ];
            const rring = [
                [-180, ext["ymin"]],
                [ext["xmax"], ext["ymin"]],
                [ext["xmax"], ext["ymax"]],
                [-180, ext["ymax"]],
                [-180, ext["ymin"]]
            ];
            const right = 180 - Math.abs(ext["xmax"]);
            const left = 180 - Math.abs(ext["xmin"]);
            const overlap = {};
            if (right > left) {
                overlap["ring"] = rring;
                overlap["oring"] = lring;
            } else {
                overlap["ring"] = lring;
                overlap["oring"] = rring;
            }
            return overlap;
        } else {
            return false;
        }
    }

    public clear(layer?: string) {
        if (layer && layer !== "overlap") {
            layer = "maskLayer";
        }
        this.maskLayer.removeAll();
    }

    public remove(g?: Graphic, i?: number) {
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
    }

    public toTop() {
        const len = this._map.layers.length - 1;
        this._map.reorder(this.maskLayer, len);
    }

    public setIndex(i: number) {
        this._map.reorder(this.maskLayer, i);
    }

    public setSymbol(s: SimpleFillSymbol) {
        this._maskSymbol = s;
        this._updateSymbol();
    }

    public setOverlapSymbol(s: SimpleFillSymbol) {
        this._maskSymbol = s;
        this._updateSymbol("overlapLayer");
    }

    private _updateSymbol(layer?: string) {
        if (layer && layer !== "overlap") {
            layer = "maskLayer";
        }
        this.maskLayer[layer].forEach(function (g) {
            g.symbol = this._maskSymbol;
        });
    }

    private _toWGS84(d: any) {
        const sr = new SpatialReference({ wkid: 4326 });
        return webMercUtils.canProject(d, sr) ? webMercUtils.project(d, sr) : d;
    }
}

export = MaskLayer;