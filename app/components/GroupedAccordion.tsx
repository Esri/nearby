import { debounce } from 'esri/core/promiseUtils';
import Accordion, { AccordionProps, ActionButton } from './Accordion';
import { property, subclass } from 'esri/core/accessorSupport/decorators';

import Feature from 'esri/widgets/Feature';
import Handles from 'esri/core/Handles';
import { tsx } from 'esri/widgets/support/widget';

import esri = __esri;
import { ApplicationConfig } from 'TemplatesCommonLib/interfaces/applicationBase';
import { whenFalseOnce } from 'esri/core/watchUtils';


type State = 'init' | 'loading' | 'ready';
const CSS = {
    base: 'accordion',
    basejs: 'js-accordion',
    single: 'single',
    singleSection: 'solo-section',
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
    flexArrow: 'flex-arrow',
    togglePanel: 'toggle-panel'
};

export interface FeatureResults {
    features: esri.Graphic[],
    title?: string,
    grouped?: boolean,
    layerIndex?: any
}
interface GroupedAccordionProps extends AccordionProps {
    featureResults: FeatureResults[];
    config: ApplicationConfig;
}
@subclass('app.GroupedAccordion')
class GroupedAccordion extends (Accordion) {

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
    @property() actionBarItems: ActionButton[] = [];
    @property() state: State = "loading";
    //--------------------------------------------------------------------------
    //
    // Variables
    //
    //--------------------------------------------------------------------------

    _handles: Handles = new Handles();
    _featureCount: number = 0;
    _toggle: boolean = false;
    _clusterLayers: any = [];

    //--------------------------------------------------------------------------
    //
    //  Public Methods
    //
    //--------------------------------------------------------------------------
    constructor(props: GroupedAccordionProps) {
        super(props);
    }
    render() {

        const { theme, enableFilter, resultsPanelPreText, resultsPanelPostText, groupResultsByLayer } = this.config;
        let themeClass = theme === "dark" ? "calcite-theme-dark" : "calcite-theme-light";
        const preText = resultsPanelPreText && this?.featureResults?.length > 0 ? this.createPreText() : null;
        const postText = resultsPanelPostText && this?.featureResults?.length > 0 ? this.createPostText() : null;

        if (groupResultsByLayer) {
            this.featureResults?.sort((a: any, b: any) => {
                return b?.layerIndex - a?.layerIndex;
            });
        }

        const filter = enableFilter ? "filter" : "";

        return (<calcite-panel key="feature-container" id="feature-container" bind={this}
            class={this.classes(CSS.scrollable, filter)}
        >
            {preText}
            <calcite-accordion icon-position="start" icon-type="chevron" class={this.classes(themeClass)}>
                {this.featureResults?.map((result, i) => this._createSections(result, i))}
            </calcite-accordion>
            {postText}
        </calcite-panel >);
    }

    _createSections(result: FeatureResults, key) {
        const { groupResultsByLayer, showResultCount, select } = this.config;
        const count = result?.features?.length;
        const layerKey = result?.layerIndex || key;
        const classes = count === 1 ? [CSS.section, CSS.single, CSS.groupSection] : [CSS.section, CSS.groupSection];
        const sectionCount = this.featureResults.length || 0;
        let headerClasses = [];
        let active = false;

        if (!groupResultsByLayer) {
            classes.push(CSS.singleSection);
            headerClasses.push(CSS.singleSection);
        }
        if (this?.state === "ready") {
            if (sectionCount === 1 || key === 0 && count <= 3) {
                active = true
            }
        }
        // Show the section count in the title area. 
        const resultCount = showResultCount ? count?.toString() : null

        return (
            <section
                bind={this}
                key={`${layerKey}`}
                data-title={result.title}
                class={this.classes(classes)}
            >

                <calcite-accordion-item
                    active={active}
                    afterCreate={this.styleLayerHeader}
                    class={this.classes(headerClasses)}
                    bind={this}
                    item-title={result.title}
                    item-subtitle={resultCount ? resultCount : null}
                    key={`layer${result?.title || key}`}  >
                    {result.features &&
                        result.features.map((feature, i) => {
                            const actionBarNav = this._createActionBar(feature)
                            return (<div class="feature-group-container" key={`${i}-item`} tabindex="0" >
                                <div data-feature={feature}
                                    afterCreate={this._createFeature}
                                    class={this.classes(CSS.featureGroup)}
                                    bind={this}
                                    key={`feature${i}`}></div>
                                {actionBarNav}
                            </div>)

                        })}
                </calcite-accordion-item>
            </section >);

    }
    _createActionBar(feature) {
        const { shareSelected, showDirections, showElevationProfile, directionsLayers } = this.config;
        const actionItems = [];
        this?.actionBarItems?.forEach(item => {
            if (showDirections && item.id === "directions") {
                if (directionsLayers?.layers?.length > 0) {
                    directionsLayers.layers.forEach(layer => {
                        if (layer?.id === feature?.layer?.id) {
                            if (feature?.geometry?.type === "point")
                                actionItems.push(item);
                        }
                    })
                } else if (feature?.geometry?.type === "point" && (directionsLayers?.layers?.length === 0 || !directionsLayers)) {
                    actionItems.push(item);
                }
            }
            if (shareSelected && item.id === "copyLink") {
                actionItems.push(item);
            }
            if (showElevationProfile && item.id === "elevationProfile" && feature?.geometry?.type === "polyline") {
                actionItems.push(item);
            }
        })

        return actionItems.length > 0 ? (<nav class={this.classes(CSS.actionBar)}>
            {actionItems.map((it) => this.createActionItem(it, feature))}
        </nav>) : null;
    }
    _createFeature(node: HTMLElement) {
        const { select, enableBufferSearch } = this.config;
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
        if (select) {
            // select the highlighted node 
            const highlightNode = document.getElementById(select);
            if (highlightNode?.id === node.id) {
                const handle = whenFalseOnce(this.view, "updating", () => {
                    this._updateNode(node, graphic);
                    handle.remove();
                });
                if (!enableBufferSearch)
                    this._updateNode(node, graphic);
            }
        }
    }
    _updateNode(node, graphic) {
        const accordion = node?.parentElement?.parentElement;
        if (accordion?.tagName?.toUpperCase() === "CALCITE-ACCORDION-ITEM") {
            // expand it
            this._selectAccordionSection(accordion, graphic);
            accordion.setAttribute("active", "true");
            this._scrollToFeature(node?.parentElement);
        } else {
            this._scrollToFeature(node?.parentElement);
        }
        node.click();
    }
    clear() {
        this.featureResults = null;
        this._toggle = false;
        if (this?._clusterLayers?.length > 0) {
            this._clusterLayers.forEach(cluster => {
                const layer = cluster?.layer;
                if (layer && cluster?.reduction)
                    layer.set("featureReduction", cluster.reduction);
            })
        }
    }
    showToggle(): boolean {
        // show toggle buttons if we have more than 1 sections? 
        return this?.featureResults?.length > 1;
    }
    findAccordionItem(results: esri.HitTestResult) {
        let found = false;
        const { groupResultsByLayer } = this.config;
        results?.results?.forEach(result => {
            // User has clicked a feature on the map
            // Check to see if we have a matching item in list and 
            // if so active the section and scroll 
            const graphic = result.graphic;
            if (graphic && graphic.attributes) {
                const layer = result?.graphic?.layer as esri.FeatureLayer;

                if (graphic?.isAggregate) {
                    // we'll reenable on clear 
                    if (layer.get("featureReduction")) {
                        const reduction = layer.get("featureReduction");
                        this._clusterLayers.push({
                            reduction,
                            layer
                        })
                        layer.set("featureReduction", null);
                    }
                }
                const idField = layer?.objectIdField || null;
                const val = graphic.attributes[idField];
                this?.featureResults?.forEach((featureResult) => {
                    if (!groupResultsByLayer || (featureResult.title === layer.title)) {
                        // find the graphic
                        featureResult.features?.forEach(f => {

                            if (f.attributes[idField] === val) {
                                const node = document.getElementById(`${layer.id}${val}`);
                                if (node?.parentElement) {
                                    found = true;
                                    this.zoom = false;
                                    this._selectAccordionSection(node.parentElement, graphic);
                                    this._findActiveSectionForFeature(node.parentElement);

                                    this._scrollToFeature(node?.parentElement);
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
            if (node?.classList.contains('accordion-section')) {
                const firstChild = node?.firstChild || null;
                if (firstChild && !firstChild?.getAttribute("active")) {
                    firstChild.setAttribute("active", "true");
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

        if (node) node.classList.add(selectedClassName);
        if (graphic) this.selectedItem = graphic;
    }

    styleLayerHeader(container) {
        const { showResultCount, theme } = this.config;

        container.addEventListener("calciteAccordionItemRegister", (e) => {

            const shadowRoot = e?.target?.shadowRoot;
            const style = document.createElement("style");
            const styles = [];
            styles.push(`
            .accordion-item-header{ 
                display:flex;
                background:${theme === "light" ? "#f8f8f8" : "#404040"} !important;
                align-items:flex-start !important;
            }`);
            if (showResultCount) {
                styles.push(` 
                .accordion-item-header-text { 
                 flex-direction: unset!important;
                } 
                .accordion-item-subtitle{
                 width:auto !important;
                 text-align:center;padding:0.25em 0.5em;
                 font-size:12px; 
                 color:${theme === "light" ? "#6d6d6d" : "#fff"} !important;
                 background-color:${theme === "light" ? "#fff" : "#4a4a4a"} !important;
                }
                `);
            }

            if (container?.classList?.contains("solo-section")) {
                styles.push(`.accordion-item-header{display:none !important;}`);
            }

            if (styles?.length > 0) {
                style.innerHTML = styles?.join(" ");
                shadowRoot?.prepend(style);
            }

        })
    }

    _scrollToFeature(node) {
        if (!node) return;
        // Detect ios safari 
        const scrollLayer = document.getElementById("feature-container");

        const element = node;
        if (this._detectIOSSafari()) {
            let position;

            if (!element || !scrollLayer) return;
            const top = element.offsetTop - scrollLayer.scrollTop;
            if (element.offsetTop < scrollLayer.scrollTop) {
                // top of element is above top of view - scroll to top of element
                position = element.offsetTop;
            } else if (element.scrollHeight + top < scrollLayer.offsetHeight) {
                // element is in view - don't need to scroll
                return;
            } else if (element.scrollHeight > scrollLayer.offsetHeight) {
                // element is bigger than view - scroll to top of element
                position = element.offsetTop;
            } else {
                // element partially cut-off - scroll remainder into view
                const difference = scrollLayer.offsetHeight - (element.scrollHeight + top);
                position = scrollLayer.scrollTop - difference;
            }
            // custom function for iOS
            this.scrollToElement(scrollLayer, position, 200);
        } else {
            node?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'start'
            });
        }
    }
    scrollToElement(scrollLayer, destination, duration) {
        if (duration <= 0) {
            return;
        }
        const difference = destination - scrollLayer.scrollTop;
        const perTick = (difference / duration) * 10;

        setTimeout(() => {
            scrollLayer.scrollTop = scrollLayer.scrollTop + perTick;
            if (scrollLayer.scrollTop === destination) {
                return;
            }
            this.scrollToElement(scrollLayer, destination, duration - 10);
        }, 10);
    }
    _detectIOSSafari() {
        const isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        return isSafari && iOS ? true : false;
    }

}
export default GroupedAccordion;
