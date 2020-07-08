
import { subclass, property } from "esri/core/accessorSupport/decorators";
import Widget from "esri/widgets/Widget";
import Handles from "esri/core/Handles";
import i18n = require("dojo/i18n!../nls/resources");
import { tsx } from "esri/widgets/support/widget";
import { getLocale } from "esri/intl";
import Slider from "esri/widgets/Slider";
import esri = __esri;

import ConfigurationSettings = require("../ConfigurationSettings");


const CSS = {
    panel: "panel",
    panelNoBorder: "panel-no-border",
    refinePanel: "panel-refine-results",
    filterButton: "filter-button",
    filterIcon: "icon-ui-filter",
    buttonLink: "btn-link",
    button: "btn",
    hide: "hide"
};

interface RefineResultsProps extends esri.WidgetProperties {
    config: ConfigurationSettings;
}

@subclass("app.RefineResults")
class RefineResults extends (Widget) {
    //--------------------------------------------------------------------------
    //
    //  Properties
    //
    //--------------------------------------------------------------------------
    @property() config: ConfigurationSettings;

    @property() slider: Slider;
    @property() value: number;
    //--------------------------------------------------------------------------
    //
    // Variables
    //
    //--------------------------------------------------------------------------

    _handles: Handles = new Handles();
    _filterPanelNode: HTMLElement = null;
    //--------------------------------------------------------------------------
    //
    //  Public Methods
    //
    //--------------------------------------------------------------------------
    constructor(props: RefineResultsProps) {
        super(props);
    }
    render() {
        return (
            <div>
                <div class={this.classes(CSS.panel, CSS.refinePanel, CSS.panelNoBorder)}>
                    <div bind={this} afterCreate={this._createSlider} />
                </div>
            </div>
        );
    }
    _createSlider(node: HTMLElement) {
        const { searchUnits, sliderRange, precision, inputsEnabled } = this.config;
        const { minimum, maximum } = sliderRange;
        const distanceSlider = new Slider({
            min: minimum,
            max: maximum,
            values: [sliderRange.default],
            precision: parseInt(precision),
            visibleElements: {
                labels: true,
                rangeLabels: true
            },
            labelInputsEnabled: inputsEnabled,
            rangeLabelInputsEnabled: inputsEnabled,
            snapOnClickEnabled: true,
            container: node
        });
        this.slider = distanceSlider;

        const locale = getLocale();
        // Append units to range labels   
        this.slider.labelFormatFunction = (value: number, type: string) => {
            let convertedUnits = i18n.units[searchUnits];
            convertedUnits = convertedUnits ? convertedUnits.abbr : "mi";
            //type can be min, max, value 
            if (type == "value") {
                return `${value.toLocaleString(locale)} ${convertedUnits}`;
            } else {
                return value.toLocaleString(locale);
            }
        };
        // Take locale into account
        distanceSlider.inputFormatFunction = (value) => {
            return value.toLocaleString(locale);
        };

        this._handles.remove(["slider,adjust"]);
        this._handles.add(distanceSlider.watch("values", (value) => {
            // this.config.distance = value;
            if (distanceSlider.state === "ready") {
                this.value = value[0];
            }
        }), "slider");
        distanceSlider.on("thumb-drag", (e) => {
            if (e.state === "stop") {
                this.value = e.value;
            }
        });
        this._adjustLabels();
        this._handles.add(distanceSlider.watch(["max", "min"], () => this._adjustLabels), "adjust");

        return distanceSlider;
    }
    destroy() {
        this._handles.removeAll();
    }
    _storeNode(node: HTMLElement) {
        this._filterPanelNode = node;
    }

    _adjustLabels() {
        // Move label down so it doesn't look so smushed 
        // when we have more than 4 numbers
        if (this.slider) {
            const { max, min } = this.slider;
            const container = this.slider.container as HTMLElement;

            const maxInput = container.querySelector(".esri-slider__max");
            const minInput = container.querySelector(".esri-slider__min");

            if (min?.toString().length > 4 || max && max.toString().length > 4) {
                minInput?.classList.add("bottom-label");
                maxInput?.classList.add("bottom-label");
            } else {
                minInput?.classList.remove("bottom-label");
                maxInput?.classList.remove("bottom-label");
            }
        }

    }
    public updateSliderProps(propertyName: string, value: any) {

        if (this.slider) {

            if (propertyName === "sliderRange") {
                if (value?.default !== this.slider.values[0]) {
                    this.slider.values = [this.config.sliderRange.default];
                }
            }

            if (propertyName === "sliderRange" && value?.maximum !== this.slider.max) {
                this.slider.max = this.config.sliderRange?.maximum;
            }
            if (propertyName === "minDistance" && value?.minimum !== this.slider.min) {
                this.slider.min = this.config.sliderRange?.minimum;
            }
            if (propertyName === "inputsEnabled") {
                this.slider.labelInputsEnabled = this.config.inputsEnabled;
                this.slider.rangeLabelInputsEnabled = this.config.inputsEnabled;
            }
            if (propertyName === "searchUnits") {
                // update labels 
                const locale = getLocale();
                const { searchUnits } = this.config;
                if (this.slider) {
                    // Append units to range labels   
                    this.slider.labelFormatFunction = (value: number, type: string) => {
                        let convertedUnits = i18n.units[searchUnits];
                        convertedUnits = convertedUnits ? convertedUnits.abbr : "mi";

                        if (type === "value") {
                            return `${value.toLocaleString(locale)} ${convertedUnits}`;
                        } else {
                            return value.toLocaleString(locale);
                        }
                    };
                }
            }

        }

    }
}
export = RefineResults;
