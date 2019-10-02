/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
import { subclass, declared, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';
import Accessor from 'esri/core/Accessor';
import Handles from 'esri/core/Handles';
import i18n = require('dojo/i18n!../nls/resources');
import { tsx } from 'esri/widgets/support/widget';
import Slider from 'esri/widgets/Slider';
import esri = __esri;
import ApplicationBase from 'ApplicationBase/ApplicationBase';
import * as promiseUtils from 'esri/core/promiseUtils';

const CSS = {
    panel: 'panel',
    panelNoBorder: 'panel-no-border',
    refinePanel: 'panel-refine-results',
    filterButton: 'filter-button',
    filterIcon: 'icon-ui-filter',
    buttonLink: 'btn-link',
    button: 'btn',
    hide: 'hide'
};

interface RefineResultsProps extends esri.WidgetProperties {
    base: ApplicationBase;
}

@subclass('app.RefineResults')
class RefineResults extends declared(Widget, Accessor) {
    //--------------------------------------------------------------------------
    //
    //  Properties
    //
    //--------------------------------------------------------------------------

    @property() base: ApplicationBase;
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
        super();
    }
    render() {
        const { config } = this.base;
        const filterButton = config.filters ? <button bind={this} onclick={this.showFilters} class={this.classes(CSS.filterButton, CSS.filterIcon, CSS.button, CSS.buttonLink)} title={i18n.tools.filter}></button> : null;
        const filterPanel = config.filters ? <div bind={this} afterCreate={this._storeNode} class={this.classes(CSS.hide, CSS.panel, CSS.panelNoBorder)}>TODO: Filter will go here</div> : null;
        const filterClass = config.filters ? "filters" : "no-filter";
        return (
            <div>
                <div class={this.classes(CSS.panel, CSS.refinePanel, CSS.panelNoBorder, filterClass)}>
                    {filterButton}
                    <div bind={this} afterCreate={this._createSlider} />
                </div>
                {filterPanel}
            </div>
        )
    }
    _createSlider(node: HTMLElement) {
        const { distance, units, minDistance, maxDistance, precision, labelInputsEnabled, rangeLabelInputsEnabled } = this.base.config;

        const distanceSlider = new Slider({
            min: minDistance,
            max: maxDistance,
            values: [distance],
            precision,
            rangeLabelsVisible: true,
            labelInputsEnabled,
            rangeLabelInputsEnabled,
            labelsVisible: true,
            snapOnClickEnabled: true,
            container: node
        });
        this.slider = distanceSlider;
        let convertedUnits = i18n.units[units];
        convertedUnits = convertedUnits ? convertedUnits.abbr : "mi";

        let { locale } = this.base;
        locale = locale || "en";
        // Append units to range labels
        distanceSlider.labelFormatFunction = (value: number, type: string) => {
            if (type === "min" || type === "max" || type === "value") {
                return `${value.toLocaleString(locale)} ${convertedUnits}`;
            } else {
                return value.toLocaleString(locale);
            }
        }
        // Take locale into account
        distanceSlider.inputFormatFunction = (value) => {
            return value.toLocaleString(locale);
        }

        this._handles.remove(["slider,adjust"]);
        this._handles.add(distanceSlider.watch("values", (value) => {
            if (distanceSlider.state === "ready") {
                this.value = value[0];
            }
        }), "slider");
        distanceSlider.on("thumb-drag", (e) => {
            if (e.state === "stop") {
                this.value = e.value;
            }
        });
        this._adjustLabels()
        this._handles.add(distanceSlider.watch(["max", "min"], () => this._adjustLabels), "adjust");

        return distanceSlider;
    }
    showFilters() {
        this._filterPanelNode && this._filterPanelNode.classList.toggle(CSS.hide);
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

            if (min && min.toString().length > 4 || max && max.toString().length > 4) {
                minInput.classList.add("bottom-label");
                maxInput.classList.add("bottom-label");
            } else {
                minInput.classList.remove("bottom-label");
                maxInput.classList.remove("bottom-label");
            }
        }

    }
}
export = RefineResults;
