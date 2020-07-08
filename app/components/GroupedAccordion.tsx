import { debounce } from 'esri/core/promiseUtils';

import Accordion, { AccordionProps } from './Accordion';
import { property, subclass } from 'esri/core/accessorSupport/decorators';

import Feature from 'esri/widgets/Feature';
import Handles from 'esri/core/Handles';
import { tsx } from 'esri/widgets/support/widget';

import esri = __esri;
import { ApplicationConfig } from 'ApplicationBase/interfaces';

const CSS = {
    base: 'accordion',
    basejs: 'js-accordion',
    single: 'single',
    singleSection: 'single-section',
    section: 'accordion-section',
    groupSection: 'group-accordion-section',
    active: 'is-active',
    title: 'accordion-title',
    titleArea: 'title-area',
    titleText: 'title-text',
    count: 'group-accordion-count',
    content: 'accordion-content',
    groupContent: 'group-accordion-content',
    featureGroup: 'feature-group',
    button: 'btn',
    transparentButton: 'btn-transparent',
    smallButton: 'btn-small',
    accordionIcon: 'accordion-icon',
    groupAccordionIcon: 'group-accordion-icon',
    paddingTrailer: 'padding-right-quarter',
    right: 'right',
    actions: 'accordion-actions',
    templateContent: 'template',
    scrollable: "scrollable-content",
    actionBar: 'action-bar',
    flexCount: "flex-count",
    flexArrow: 'flex-arrow'
};

export interface FeatureResults {
    features: esri.Graphic[],
    title?: string,
    grouped?: boolean
}
interface GroupedAccordionProps extends AccordionProps {
    featureResults: FeatureResults[];
    config: ApplicationConfig;
}

@subclass('app.GroupedAccordion')
class GroupedAccordion extends (Accordion) {

    // TODO UPDate to thise 
    /*
    resultsPanelPreText, resultsPanelPostText, showResultCount, showDirections,
    interactiveResults, units, includeDistance
    */
    //--------------------------------------------------------------------------
    //
    //  Properties
    //
    //--------------------------------------------------------------------------
    @property() featureResults: FeatureResults[];
    @property() selectedItem: esri.Graphic;
    @property() hoveredItem: esri.Feature;
    @property() zoom: boolean = true;
    @property() config: ApplicationConfig;
    //--------------------------------------------------------------------------
    //
    // Variables
    //
    //--------------------------------------------------------------------------
    _calciteLoaded: boolean = false;
    _handles: Handles = new Handles();
    _featureCount: number = 0;
    //--------------------------------------------------------------------------
    //
    //  Public Methods
    //
    //--------------------------------------------------------------------------
    constructor(props: GroupedAccordionProps) {
        super(props);
        if (props.featureResults) {
            props.featureResults.forEach((result) => {
                this._featureCount += result.features && result.features.length;
            });
        }
    }
    render() {

        const { resultsPanelPreText, resultsPanelPostText } = this.config;
        const preText = resultsPanelPreText && this._featureCount > 0 ? this.createPreText() : null;
        const postText = resultsPanelPostText && this._featureCount > 0 ? this.createPostText() : null;

        return (<div key="feature-container"
            class={this.classes(CSS.scrollable)}
            afterCreate={this.updateCalcite}>
            {preText}
            <div class={this.classes(CSS.base, CSS.basejs)}>
                {this.featureResults &&
                    this.featureResults.map((result, i) => this._createSections(result, i))}
            </div>
            {postText}
        </div >);
    }



    _createSections(result: FeatureResults, key) {
        const count = result.features && result.features.length;

        const classes = count === 1 ? [CSS.section, CSS.single, CSS.groupSection] : [CSS.section, CSS.groupSection];
        const sectionCount = this.featureResults.length || 0;

        if (sectionCount === 1) {
            classes.push(CSS.singleSection);
        }
        // Open section if its the first section and it only has a few 
        // features.  or if there is only one feature in the section
        if ((sectionCount === 1 || (key === 0 && count <= 3))) {
            classes.push(CSS.active);
        }
        // Show the section count in the title area. Don't display if there is only 
        // one section and only one result in that section. 
        let resultCount = null;
        if (this.config.showResultCount) {
            if (sectionCount === 1 || (sectionCount === 1 && count === 1)) {
                resultCount = null;
            } else if (count) {
                resultCount = <div><span class={this.classes(CSS.count, CSS.flexCount)}>{count}</span></div>;
            }
        }
        return (
            <section
                bind={this}
                role="menu"
                key={`section${key}`}
                class={this.classes(classes)}
            >
                <h5 class={CSS.title}>
                    <div class={this.classes(CSS.accordionIcon, CSS.groupAccordionIcon, CSS.flexArrow)} >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 32 32"
                            class="svg-icon"
                        >
                            <path d="M28 9v5L16 26 4 14V9l12 12L28 9z" />
                        </svg>
                    </div>
                    <div class={this.classes(CSS.titleArea, CSS.titleText)} >{result.title}</div>
                    {resultCount}
                </h5>
                <ul role='group' class={this.classes(CSS.templateContent, CSS.content, CSS.groupContent)} >
                    {result.features &&
                        result.features.map((feature, i) => {
                            return (<li role='menuitem' tabindex="0">
                                <div data-feature={feature}
                                    afterCreate={this._createFeature}
                                    class={this.classes(CSS.featureGroup)}
                                    bind={this}
                                    key={`feature${i}`}></div>
                                {this.config.showDirections && this.actionBarItems && this.actionBarItems.length > 0 ? (<nav class={this.classes(CSS.actionBar)}>
                                    {this.actionBarItems &&
                                        this.actionBarItems.length > 0 &&
                                        this.actionBarItems.map((item) => this.createActionItem(item, feature))}
                                </nav>) : null}
                            </li>)

                        })}
                </ul>
            </section>);

    }
    _createFeature(node: HTMLElement) {
        const graphic = node['data-feature'];
        const distNode = document.createElement("span");

        node.appendChild(distNode);
        const container = document.createElement("div");
        node.id = `${graphic.layer.id}${graphic.attributes[graphic.layer.objectIdField]}`;

        const feature = new Feature({
            graphic,
            defaultPopupTemplateEnabled: true,
            map: this.view.map,
            spatialReference: this.view.spatialReference,
            container
        });
        node.appendChild(container);

        // Set the count and then update with title if we have one 
        if (graphic && graphic.attributes && graphic.attributes.lookupDistance && this.config.includeDistance) {
            distNode.innerHTML = this.convertUnitText(graphic.attributes.lookupDistance, this.config.searchUnits);
        }

        // Add click event if results are interactive 
        const clickableResults = this.config.interactiveResults === false ? false : true;
        if (clickableResults) {
            node.addEventListener("click", () => {
                this.zoom = true;
                this._selectAccordionSection(node.parentElement, graphic);
            });
            node.addEventListener("mouseover", debounce(() => {
                this.hoveredItem = feature;
            }));
        }
    }
    clear() {
        this.featureResults = null;
    }
    showToggle(): boolean {
        // show toggle buttons if we have more than 1 sections? 
        return this.featureResults && this.featureResults.length && this.featureResults.length > 1;
    }
    findAccordionItem(results: esri.HitTestResult) {
        let found = false;
        results.results.forEach(result => {
            // User has clicked a feature on the map
            // Check to see if we have a matching item in list and 
            // if so active the section and scroll 
            const graphic = result.graphic;
            if (graphic && graphic.attributes) {
                const layer = result.graphic.layer as esri.FeatureLayer;
                const idField = layer && layer.objectIdField || null;
                const val = graphic.attributes[idField];
                this.featureResults && this.featureResults.forEach((featureResult) => {
                    if (featureResult.title === layer.title) {
                        // find the graphic 
                        featureResult.features.forEach(f => {
                            if (f.attributes[idField] === val) {
                                const node = document.getElementById(`${layer.id}${val}`);
                                if (node && node.parentElement) {
                                    found = true;
                                    this.zoom = false;
                                    this._selectAccordionSection(node.parentElement, graphic);
                                    this._findActiveSectionForFeature(node.parentElement);
                                    node.parentElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                                }
                                return found;
                            }
                        });
                        return true;
                    } else {
                        return false;
                    }
                });
            }
        });
        return found;
    }
    _findActiveSectionForFeature(node) {
        // Find the acordion section and expand
        var els = [];
        while (node) {
            els.unshift(node);
            if (node.classList.contains('accordion-section')) {
                if (!node.classList.contains('is-active')) {
                    node.classList.add('is-active');
                }
                node = null;
            } else {
                node = node.parentNode;
            }
        }
    }
    _selectAccordionSection(node: HTMLElement, graphic: esri.Graphic) {
        const selectedClassName = 'accordion-section-selected';

        const mainNodes = document.getElementsByClassName(selectedClassName);
        for (let j = 0; j < mainNodes.length; j++) {
            mainNodes[j].classList.remove(selectedClassName);
        }

        node.classList.add(selectedClassName);
        this.selectedItem = graphic;
    }
}
export default GroupedAccordion;
