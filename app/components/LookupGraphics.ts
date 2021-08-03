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


import { property, subclass } from 'esri/core/accessorSupport/decorators';
import Accessor from 'esri/core/Accessor';
import Graphic from "esri/Graphic";
import Handles from "esri/core/Handles";
import { bufferGeometry } from '../utilites/geometryUtils';
import { CIMSymbol, TextSymbol } from 'esri/symbols';
import { getBasemapTheme } from '../utilites/geometryUtils';
import { createGoToProps, getSymbol } from "../utilites/lookupLayerUtils";
import Color from 'esri/Color';
import FeatureLayer from "esri/layers/FeatureLayer";
import GraphicLayer from "esri/layers/GraphicsLayer";

import ConfigurationSettings from '../ConfigurationSettings';

interface LookupGraphicsProps {
    config: ConfigurationSettings;
    view: __esri.MapView;
    graphic?: __esri.Graphic;
}

@subclass('LookupGraphics')
class LookupGraphics extends (Accessor) {
    @property() config: ConfigurationSettings;
    @property()
    view: __esri.MapView = null;
    @property()
    graphic: Graphic = null;


    // Graphic colors 
    _lightColor = "#595959";
    _darkColor = "#fff";
    // Graphics created and managed by this class 
    _bufferGraphic: Graphic = null;
    _graphicMarker: Graphic = null;
    _graphicLabel: Graphic = null;

    _theme: Color = null;
    _handles: Handles = null;
    _geometry: __esri.Geometry = null;
    _graphicLayer: GraphicLayer = null;
    constructor(props: LookupGraphicsProps) {
        super(props);
        this._handles = new Handles();
    }
    initialize() {
        this._graphicLayer = new GraphicLayer();
        this.view.map.add(this._graphicLayer);
    }
    public updateGraphics(propName: string, enabled: boolean) {
        if (this.graphic) {
            if (propName === "drawBuffer") {
                this._createBufferGraphic();
            }
            if (propName === "mapPinSize" || propName === "mapPinLabel" || propName == "mapPinLabelColor" || propName === "mapPinLabelSize") {
                this._createGraphicLabel();
            }
            if (propName === "mapPinIcon" || propName === "mapPinSize" || propName === "mapPin" || propName === "mapPinColor") {
                this._createGraphicMarker();
            }

        }
    }
    private async _createBufferGraphic() {
        const { singleLocationPolygons, drawBuffer, enableBufferSearch, enableBufferColor, bufferColor, bufferTransparency } = this.config;
        // If buffer isn't enabled stop

        if (!enableBufferSearch) {
            return;
        }
        if (singleLocationPolygons) {
            return;
        }
        if (!drawBuffer) {
            return
        };

        let fillColor = bufferColor && enableBufferColor ? new Color(bufferColor) : this._theme.clone();

        fillColor.a = bufferTransparency || 0.2;

        const fillSymbol = {
            type: 'simple-fill',
            color: fillColor,
            outline: {
                color: this._theme
            }
        };
        const geometry = this._createBuffer(this.graphic.geometry);
        if (!geometry) return;

        this._bufferGraphic = new Graphic({
            geometry,
            symbol: fillSymbol as any
        });

        const goToProps = createGoToProps(this._bufferGraphic, this.config);

        await this.view.goTo(goToProps).then(() => {
            this._graphicLayer.add(this._bufferGraphic);
        }).catch(() => {
            this._removeBuffer();
        });

    }
    private _removeBuffer() {
        if (this._bufferGraphic) this._graphicLayer.remove(this._bufferGraphic);
    }
    private async _createGraphicMarker() {
        if (this._graphicMarker) {
            // remove the existing graphic
            this._graphicLayer.remove(this._graphicMarker);
        }
        const { mapPinColor, mapPin } = this.config;
        if (!mapPin) return;


        const color = mapPinColor ? Color.fromHex(mapPinColor) : this._theme;

        // create the graphic 

        this._graphicMarker = new Graphic({
            geometry: this.graphic.geometry,
            symbol: new CIMSymbol({
                data: {
                    type: "CIMSymbolReference",
                    symbol: getSymbol(this.config, color)
                }
            })
        });
        this._graphicLayer.add(this._graphicMarker);
    }

    private async _createGraphicLabel() {
        if (this._graphicLabel) {
            // remove existing then create new
            this._graphicLayer.remove(this._graphicLabel);
        }
        const { mapPinLabel, mapPinLabelColor, mapPinLabelSize, mapPinSize } = this.config;

        if (!mapPinLabel) return;

        const color = mapPinLabelColor ? mapPinLabelColor : this._theme;

        const address = this._getAddressText();

        // create the graphic 
        const yoffset = mapPinSize ? `-${mapPinSize / 1.5}px` : `-${mapPinLabelSize / 1.5}px`
        this._graphicLabel = new Graphic({
            geometry: this.graphic.geometry,
            symbol: new TextSymbol({
                font: {
                    size: mapPinLabelSize
                },
                text: address,
                haloColor: this._theme.toHex() === this._lightColor ? this._darkColor : this._lightColor,
                haloSize: "1px",
                color,
                horizontalAlignment: 'center',
                verticalAlignment: "top",
                yoffset
            })
        });
        this._graphicLayer.add(this._graphicLabel);

    }
    private _showGraphics(): boolean {
        const { enableBufferSearch } = this.config;
        // add graphics if this wasn't a map button click 
        let addGraphics = true;
        if (!enableBufferSearch) {
            const button = document.getElementById("mapSearchButton");
            if (button?.classList?.contains("hide")) {
                addGraphics = false;
            }
        }
        return addGraphics;
    }
    private _getAddressText(): string {
        // Everytime the graphic changes let's get the address text if 
        // include address text is enabled. 
        let address = null;
        if (this.graphic?.attributes?.Match_addr) {
            // replace first comma with a new line character
            address = this.graphic.attributes.Match_addr.replace(',', '\n');
        } else if (this.graphic?.attributes?.name) {
            address = this.graphic.attributes.name;
        } else if (this.graphic?.layer instanceof FeatureLayer) {
            if (this.graphic.layer.displayField !== null) {
                address = this.graphic.attributes[this.graphic.layer.displayField] ?? null;
            } else {
                // get the first string field
                this.graphic.layer.fields.some((field) => {
                    if (field.type === 'string') {
                        address = this.graphic.attributes[field.name];
                        return true;
                    }
                });
            }
        }
        return address;

    }
    private _createBuffer(location: __esri.Geometry): __esri.Geometry {

        const buffer = bufferGeometry({
            location,
            distance: this.config.sliderRange.default,
            unit: this.config.searchUnits
        });
        return buffer as __esri.Geometry;
    }
    private async _updateTheme() {
        const theme = await getBasemapTheme(this.view);
        this._theme = (theme === "light") ? new Color(this._lightColor) : new Color(this._darkColor);
    }
    public async addGraphicsAndZoom(location) {
        const { enableBufferSearch } = this.config;

        if (!this._theme) {
            await this._updateTheme()
        };
        if (!enableBufferSearch) {
            // zoom to the extent if we don't have a buffer search defined
            const goToProps = createGoToProps(location, this.config);
            await this.view.goTo(goToProps);
        } else {
            this._createBufferGraphic();
        }
        if (this._showGraphics()) {
            this._createGraphicLabel();
            this._createGraphicMarker();
        }

    }
    public clearGraphics() {
        // remove all added graphics 

        this._graphicLayer?.removeAll();
        this._graphicLabel = null;
        this._bufferGraphic = null;
        this._graphicMarker = null;
        this.graphic = null;
    }

}

export = LookupGraphics;
