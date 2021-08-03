
import { subclass, property } from "esri/core/accessorSupport/decorators";
import Widget from "esri/widgets/Widget";
import Handles from "esri/core/Handles";
import { tsx } from "esri/widgets/support/widget";
import { getLocale } from "esri/intl";
import Slider from "esri/widgets/Slider";
import esri = __esri;

import ConfigurationSettings from "../ConfigurationSettings";


const CSS = {
    panel: "panel",
    panelNoBorder: "panel-no-border",
    refinePanel: "panel-refine-results",
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

    //--------------------------------------------------------------------------
    //
    //  Public Methods
    //
    //--------------------------------------------------------------------------
    constructor(props: RefineResultsProps) {
        super(props);
    }
    render() {
        const { enableBufferSearch, singleLocationPolygons } = this.config;
        const slider = enableBufferSearch && !singleLocationPolygons ? <div bind={this} afterCreate={this._createSlider} /> : null;
        return (
            <div class={this.classes(CSS.panel, CSS.refinePanel, CSS.panelNoBorder)}>
                {slider}
            </div>
        );
    }

    _createSlider(container: HTMLElement) {
        const { searchUnits, sliderRange, precision, inputsEnabled, showSlider } = this.config;

        let sliderDefault = sliderRange?.default || 1.2;
        let minimum = sliderRange.minimum || 0;
        let maximum = sliderRange.maximum || 2;

        if (!showSlider) return;
        this.slider = new Slider({
            min: minimum,
            max: maximum,
            values: [sliderDefault],
            visibleElements: {
                labels: true,
                rangeLabels: true
            },
            labelInputsEnabled: inputsEnabled,
            rangeLabelInputsEnabled: inputsEnabled,
            snapOnClickEnabled: true,
            inputCreatedFunction: (input, type, index) => {
                input.setAttribute("type", "number");
                input.setAttribute("pattern", "[0-9]*");
            },
            precision,
            container
        });
        let locale = getLocale();
        if (!locale) locale = "en";

        // Append units to range labels   
        if (!this.slider) return;
        this.slider.labelFormatFunction = (value: number, type: string) => {
            let convertedUnits = this.config.appBundle.units[searchUnits];

            convertedUnits = convertedUnits ? convertedUnits.abbr : "mi";
            //type can be min, max, value 
            if (type == "value") {
                return `${value.toLocaleString(locale)} ${convertedUnits}`;
            } else {
                return value.toLocaleString(locale);
            }
        };
        // Take locale into account
        this.slider.inputFormatFunction = (value) => {
            return value.toLocaleString(locale);
        };

        this._handles.remove(["slider,adjust"]);
        this._handles.add(this.slider.watch("values", (value) => {
            if (this.slider.state === "ready") {
                this.value = value[0];
            }
        }), "slider");
        this.slider.on("thumb-drag", (e) => {
            if (e.state === "stop") {
                this.value = e.value;
            }
        });
        this._adjustLabels();
        this._handles.add(this.slider.watch(["max", "min"], () => this._adjustLabels), "adjust");
        return this.slider;
    }
    destroy() {
        this._handles.removeAll();
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
            if (propertyName === "precision") {
                this.slider.precision = value ?? 4;
            }
            if (propertyName === "sliderRange" && value?.maximum !== this.slider.max) {
                this.slider.max = this.config.sliderRange?.maximum;
            }
            if (propertyName === "sliderRange" && value?.minimum !== this.slider.min) {
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
                        let convertedUnits = this.config.appBundle.units[searchUnits];
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
