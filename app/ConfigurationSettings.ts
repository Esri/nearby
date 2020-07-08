import {
    property,
    subclass
} from "esri/core/accessorSupport/decorators";

import Accessor from "esri/core/Accessor";
import { ApplicationConfig } from "./application-base-js/interfaces";

type Units =
    "feet" |
    "kilometers" |
    "meters" |
    "miles";

type UIPosition =
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-leading"
    | "top-trailing"
    | "bottom-leading"
    | "bottom-trailing";

type PanelType = "details" | "legend" | "popup";

interface SliderRange {
    minimum: number;
    maximum: number;
    default?: number;
}
@subclass("app.ConfigurationSettings")
class ConfigurationSettings extends (Accessor) {
    @property()
    webmap: string;

    @property()
    mapZoom: boolean;

    @property()
    mapZoomPosition: UIPosition;

    @property()
    home: boolean;

    @property()
    homePosition: UIPosition;

    @property()
    legend: boolean;

    @property()
    legendOpenAtStart: boolean;

    @property()
    legendPosition: UIPosition;

    @property()
    scalebar: boolean;

    @property()
    scalebarPosition: boolean;

    @property()
    basemapToggle: boolean;

    @property()
    basemapTogglePosition: UIPosition;

    @property()
    nextBasemap: string;

    @property()
    theme: string;

    @property()
    applySharedTheme: boolean;

    @property()
    title: string;

    @property()
    titleLink: string;

    @property()
    introductionTitle: string;

    @property()
    introductionContent: string;

    @property()
    hideMap: boolean;

    /* Test below vals */
    @property()
    headerBackground: string;

    @property()
    headerColor: string;

    @property()
    buttonBackground: string;
    @property()
    buttonColor: string;

    @property()
    shareIncludeSocial: boolean;

    @property()
    interactiveResults: boolean;

    @property()
    resultsPanelPostText: string;

    @property()
    resultsPanelPreText: string;

    @property()
    noResultsMessage: string;

    @property()
    showResultCount: boolean;

    @property()
    groupResultsByLayer: boolean;

    @property()
    showDirections: boolean;

    @property()
    includeDistance: boolean;


    @property()
    searchUnits: Units;

    @property()
    singleLocationPolygons: boolean;

    @property()
    relationship: __esri.QueryProperties["spatialRelationship"];


    @property()
    drawBuffer: boolean;

    @property()
    hideLayers: boolean;

    @property()
    sliderRange: SliderRange;

    @property()
    precision: string;
    @property()
    inputsEnabled: boolean;

    @property()
    lookupLayers: any;


    @property()
    searchConfiguration: any;

    @property()
    find: string;

    @property()
    findSource: any;

    @property()
    mapPin: boolean;
    @property()
    mapPinLabel: boolean;


    @property()
    withinConfigurationExperience: boolean =
        window.location !== window.parent.location;


    _storageKey = "config-values";
    _draft: ApplicationConfig = null;
    _draftMode = false;
    constructor(params?: ApplicationConfig) {

        super(params);
        this._draft = params?.draft;
        this._draftMode = params?.mode === "draft";
    }
    initialize() {
        if (this.withinConfigurationExperience || this._draftMode) {
            // Apply any draft properties
            if (this._draft) {
                Object.assign(this, this._draft);
            }

            window.addEventListener(
                "message",
                function (e) {
                    this._handleConfigurationUpdates(e);
                }.bind(this),
                false
            );
        }
    }

    _handleConfigurationUpdates(e) {
        if (e?.data?.type === "cats-app") {
            Object.assign(this, e.data);
        }
    }
    mixinConfig() {

    }
}
export = ConfigurationSettings;
