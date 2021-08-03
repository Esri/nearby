import {
    property,
    subclass
} from "esri/core/accessorSupport/decorators";
import ConfigurationSettingsBase from 'TemplatesCommonLib/baseClasses/configurationSettingsBase';

interface IExtentSelectorOutput { constraints: __esri.MapViewConstraints; mapRotation: number; }

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


interface SliderRange {
    minimum: number;
    maximum: number;
    default?: number;
}
@subclass("app.ConfigurationSettings")
class ConfigurationSettings extends (ConfigurationSettingsBase) {

    @property()
    telemetry: any;

    @property()
    googleAnalytics: boolean;
    @property()
    googleAnalyticsKey: string;
    @property()
    googleAnalyticsConsentMsg: string;
    @property()
    googleAnalyticsConsent: boolean;

    @property()
    webmap: string;

    @property()
    extentSelectorConfig: IExtentSelectorOutput;
    @property()
    extentSelector: boolean;

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
    legendConfig: __esri.LegendProperties;

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
    basemapSelector: string;

    @property()
    theme: string;

    @property()
    applySharedTheme: boolean;

    @property()
    headerColor: string;
    @property()
    headerBackground: string;
    @property()
    enableHeaderBackground: boolean;
    @property()
    enableHeaderColor: boolean;

    @property()
    title: string;

    @property()
    titleLink: string;

    @property()
    showIntroduction: boolean;

    @property()
    introductionTitle: string;

    @property()
    introductionContent: string;

    @property()
    hideMap: boolean;

    /* Test below vals */
    @property()
    share: boolean;

    @property()
    customCSS: string;

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
    directionsLayers: any;

    @property()
    useDirectionsApp: boolean;

    @property()
    showElevationProfile: boolean;

    @property()
    includeDistance: boolean;


    @property()
    searchUnits: Units;

    @property()
    singleLocationPolygons: boolean;

    @property()
    relationship: __esri.QueryProperties["spatialRelationship"];

    @property()
    shareSelected: boolean;

    @property()
    enableBufferSearch: boolean;

    @property()
    searchScale: number;

    @property()
    enableSearchScale: boolean;

    @property()
    drawBuffer: boolean;

    @property()
    enableBufferColor: boolean;
    @property()
    bufferColor: string;
    @property()
    bufferTransparency: number;

    @property()
    hideLayers: boolean;

    @property()
    sliderRange: SliderRange;

    @property()
    showSlider: boolean;

    @property()
    precision: number;
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
    mapPinIcon: string;

    @property()
    mapPinLabel: boolean;
    @property()
    mapPinColor: any;

    @property()
    mapPinLabelColor: any;

    @property()
    mapPinSize: number;
    @property()
    mapPinLabelSize: number;

    @property()
    screenshot: boolean;
    @property()
    screenshotPosition: UIPosition;

    @property()
    bookmarks: boolean;
    @property()
    bookmarksPosition: UIPosition;
    @property()
    mapA11yDesc: string;

    @property()
    enableFilter: boolean;
    @property()
    filterConfig: any;
    @property()
    bundle: any;

    @property()
    appBundle: any;

    @property()
    coverPage: boolean;
    @property()
    coverPageConfig: any;

    @property()
    panelSize: string;

    @property() select: string;

    @property() level: any;
    @property() center: any;

    @property()
    searchLayer: any;
}
export = ConfigurationSettings;
