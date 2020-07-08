
import { subclass, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';
import Handles from 'esri/core/Handles';
import { tsx, renderable } from 'esri/widgets/support/widget';
import { getDistances } from '../utilites/geometryUtils';
import { resolve } from 'esri/core/promiseUtils';
import { whenFalseOnce } from 'esri/core/watchUtils';
import { hideLookuplayers, clearLookupLayers } from '../utilites/lookupLayerUtils';
import FeatureFilter from 'esri/views/layers/support/FeatureFilter';
import FeatureEffect from 'esri/views/layers/support/FeatureEffect';
import GroupedAccordion, { FeatureResults } from './GroupedAccordion';
import { ActionButton } from "./Accordion";
import Expand from 'esri/widgets/Expand';
import MapPanel from './MapPanel';
import Footer from './Footer';
import i18n = require('dojo/i18n!../nls/resources');
import esri = __esri;
import ConfigurationSettings = require('../ConfigurationSettings');
import LookupGraphics = require('./LookupGraphics');

type State = 'init' | 'loading' | 'ready';

export interface DisplayLookupResultsProps extends esri.WidgetProperties {
	view: esri.MapView;
	lookupGraphics?: LookupGraphics;
	lookupLayers?: esri.FeatureLayer[];
	config: ConfigurationSettings;
	mapPanel: MapPanel;
	portal: __esri.Portal,
	footer?: Footer;
	directions?: esri.Directions;
}
const CSS = {
	calciteStyles: {
		clearBtn: 'btn-transparent',
		smallBtn: 'btn-small',
		button: 'btn',
		right: 'right',
		leaderFull: 'margin-left-1',
		leaderHalf: 'leader-half',
		trailer0: 'trailer-0',
		panel: 'panel',
		panelNoBorder: 'panel-no-border',
		panelNoPadding: 'panel-no-padding',

	},
	togglePanel: 'toggle-panel',
	toggle: 'toggleOpen',
	messageText: 'message-text',
	openItems: 'open-items',
	collapseItems: 'collapse-items',
	toggleContentTools: 'toggle-content-tools',
	toggleContentBtn: 'toggle-content-btn',
	collapse: 'collapse',
	expand: 'expand'
};
const expandSVG = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26"><polygon points="23.6 14.95 23.6 23.63 14.94 23.63 14.94 22.19 21.16 22.19 13.83 14.81 14.84 13.8 22.17 21.18 22.17 14.95 23.6 14.95" /><polygon points="11.06 3.83 11.06 2.4 2.4 2.4 2.4 11.07 3.83 11.07 3.83 4.84 11.27 12.41 12.28 11.4 4.84 3.83 11.06 3.83" /><path d="M24,1a1,1,0,0,1,1,1V24a1,1,0,0,1-1,1H2a1,1,0,0,1-1-1V2A1,1,0,0,1,2,1H24m0-1H2A2,2,0,0,0,0,2V24a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2V2a2,2,0,0,0-2-2Z" /></svg>;
const collapseSVG = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26"><polygon points="14.88 23.48 14.88 14.81 23.54 14.81 23.54 16.25 17.32 16.25 25.47 24.41 24.46 25.42 16.31 17.26 16.31 23.48 14.88 23.48" /><polygon points="2.75 9.97 2.75 11.4 11.4 11.4 11.4 2.73 9.97 2.73 9.97 8.96 1.82 0.8 0.81 1.81 8.96 9.97 2.75 9.97" /><path d="M24,1a1,1,0,0,1,1,1V24a1,1,0,0,1-1,1H2a1,1,0,0,1-1-1V2A1,1,0,0,1,2,1H24m0-1H2A2,2,0,0,0,0,2V24a2,2,0,0,0,2,2H24a2,2,0,0,0,2-2V2a2,2,0,0,0-2-2Z" /></svg>;
@subclass('app.DisplayLookupResults')
class DisplayLookupResults extends (Widget) {
	//--------------------------------------------------------------------------
	//
	//  Properties
	//
	//--------------------------------------------------------------------------
	@property()
	accordion: GroupedAccordion;

	@property()
	location: esri.Graphic;

	@property()
	view: esri.MapView;

	@property() lookupGraphics = null;
	@property()
	config: ConfigurationSettings;

	@property() mapPanel: MapPanel;
	@property() footer: Footer;
	@property()
	empty: boolean = true;
	@property() lookupLayers: esri.FeatureLayer[] = null;
	@property() expand: esri.Expand[] = [];
	@property() directions: esri.Directions = null;

	@property()
	portal: __esri.Portal;
	@property()
	@renderable()
	state: State = 'init';
	//--------------------------------------------------------------------------
	//
	// Variables
	//
	//--------------------------------------------------------------------------
	_featureResults: FeatureResults[] = null;

	_viewPoint: esri.Viewpoint = null;
	_accordion: GroupedAccordion = null;
	_handles: Handles = new Handles();
	_toggle: boolean = false;

	//--------------------------------------------------------------------------
	//
	//  Public Methods
	//
	//--------------------------------------------------------------------------
	constructor(props: DisplayLookupResultsProps) {
		super(props);
	}

	render() {
		const loader =
			this.state === 'loading' ? (
				<div key="loader" class="loader is-active padding-leader-3 padding-trailer-3">
					<div key="loaderBars" class="loader-bars" />
					<div key="loaderText" class="loader-text">
						{i18n.load.label}...
					</div>
				</div>
			) : null;
		const ready = this.state === 'ready' || false;


		// No Results 
		let errorText: string = null;
		if (this.empty && ready) {
			errorText = this.config.noResultsMessage || i18n.noFeatures;
			this._featureResults = null;
			if (this.mapPanel && this.mapPanel.isMobileView) {
				// Add no results message to the map in mobile view
				this.mapPanel.message = errorText;
			}
		}

		// feature or group there
		const accordion = ready ? (
			<div key="accordion">
				<p key="errorText" class={CSS.messageText} innerHTML={errorText} />
				<div key="detailAccordion" bind={this} afterCreate={!this.empty ? this._addDetailAccordion : null} />
			</div>
		) : null;

		const togglePanel = this._featureResults ? this.createTogglePanel() : null;

		return (
			<div key="loader">
				{loader}
				{togglePanel}
				{accordion}
			</div>
		);
	}

	_addDetailAccordion(container: HTMLElement) {
		const { _featureResults, view } = this;
		const eventHandler = this._handleActionItem.bind(this);
		let actionItems: ActionButton[] = [];
		if (this.config.showDirections) { // check status
			if (this?.directions?.viewModel?.state === "ready") {
				actionItems.push({
					icon: 'icon-ui-map-pin',
					id: 'directions',
					name: this.directions && this.directions.label ? this.directions.label : 'Directions',
					handleClick: eventHandler
				});
			}
		}
		this.accordion = new GroupedAccordion({
			actionBarItems: actionItems,
			featureResults: _featureResults,
			config: this.config,
			view,
			container
		});

		this.accordion.watch("hoveredItem", () => {
			if (this.accordion.hoveredItem && this.accordion.hoveredItem.graphic) {
				let location = this.accordion.hoveredItem.graphic.geometry;
				if (location && location.type !== "point") {
					location = location.extent.center;
				}
				const title = this.accordion.hoveredItem.title;
				if (title) {
					this.view.popup.dockEnabled = false;
					this.view.popup.dockOptions.buttonEnabled = false;
					this.view.popup.open({
						location,
						content: `<div style="text-align:center;padding-top:10px;">${title}</div>`
					});
					const puContainer = this.view.popup.container as HTMLElement;
					puContainer.classList.add("no-title");
					const container = this.accordion.hoveredItem.container as HTMLElement;

					container && container.addEventListener("mouseleave", () => {
						this.view.popup.close();
						puContainer.classList.remove("no-title");
					});
				}
				this._highlightFeature(this.accordion.hoveredItem.graphic);
			}
		});
		this.accordion.watch('selectedItem', () => {
			this._clearDirections();
			if (this.accordion.selectedItem) {
				this._highlightFeature(this.accordion.selectedItem);
				this.accordion.zoom && this._zoomToFeature(this.accordion.selectedItem);
				this.mapPanel.selectedItemTitle =
					this.accordion.selectedItem.attributes['app-accordion-title'] || null;

			}
			this.accordion.selectedItem = null;
		});
	}
	async _handleActionItem(name: string, selected: esri.Graphic) {

		const start = this._createStop(this.location);
		const stop = this._createStop(selected);
		if (this.directions && this.directions.viewModel) {
			this._clearDirections();
			this.directions.viewModel.stops.addMany([start, stop]);
			await this.directions.viewModel.getDirections() as any;
			if (this.config.hideMap) {
				const results = await this.directions.getDirections();
				// add directions widget to new popup and open 
				const printPage = document.getElementById("printPanel");
				printPage.classList.remove("hide");
				// add button 
				const closebutton = document.createElement("button");
				closebutton.classList.add("btn");
				closebutton.classList.add("btn-transparent");
				closebutton.classList.add("right");
				closebutton.setAttribute("aria-label", i18n.tools.close);
				closebutton.title = i18n.tools.close;
				closebutton.addEventListener("click", () => {
					printPage.classList.add("hide");
				});
				closebutton.innerHTML = `<svg class="svg-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M18.404 16l9.9 9.9-2.404 2.404-9.9-9.9-9.9 9.9L3.696 25.9l9.9-9.9-9.9-9.898L6.1 3.698l9.9 9.899 9.9-9.9 2.404 2.406-9.9 9.898z" /></svg>`;
				printPage.appendChild(closebutton);
				printPage.appendChild(this.directions.container as HTMLElement);

			} else {
				// In mobile view switch to map after directions are calcuated. 
				if (this.view && this.view.container && getComputedStyle(this.view.container).display === "none") {
					const mainNodes = document.getElementsByClassName('icon-ui-maps');
					for (let j = 0; j < mainNodes.length; j++) {
						const node = mainNodes[j];
						node.classList.remove('icon-ui-maps');
						node.classList.add('icon-ui-table');
						node.innerHTML = i18n.tools.results;
					}
					this.footer && this.footer.showMap();
				}
				const expand = new Expand({
					content: this.directions.container,
					expandTooltip: this.directions.label,
					expanded: true,
					mode: "floating",
					expandIconClass: "esri-icon-directions",
					group: "bottom-right"
				});
				this.expand.push(expand);
				this.view.ui.add(expand, 'bottom-right');
			}

		}
	}
	_createStop(graphic: esri.Graphic): esri.Graphic {
		let returnGraphic: esri.Graphic = graphic.clone();
		const type = graphic.geometry.type;
		if (type === "polygon") {
			const geometry = graphic.geometry as esri.Polygon;
			returnGraphic.geometry = geometry.centroid;
		} else if (type === "polyline") {
			const geometry = graphic.geometry as esri.Polyline;
			returnGraphic.geometry = geometry.extent.center;
		}
		return returnGraphic;
	}
	async queryFeatures(location: esri.Graphic) {
		this.location = location;
		this.lookupGraphics.graphic = location;
		this.state = 'loading';
		const promises = [];
		if (!location) {
			this.state = 'init';
			this._featureResults = [];
			resolve();
		} else {

			this.lookupGraphics.addGraphics();
			this.lookupLayers.forEach((layer) => {
				promises.push(this._queryFeatureLayers(layer, location.geometry));
			});
		}

		return Promise.all(promises).then((results) => {

			this._featureResults = [];
			const { groupResultsByLayer } = this.config;
			// Reverse the results so the order matches the legend but  
			// if singleLocationPolygons is true display the polygon result at the top
			if (!this.config.singleLocationPolygons) {
				results.reverse();
			}
			// Loop through the feaures 
			results.forEach(result => {
				// do we have features? 
				if (result.features && result.features.length && result.features.length > 0) {
					if (groupResultsByLayer) {
						const sortedFeatures = result.features;
						this._sortFeatures(sortedFeatures);
						this._featureResults.push({
							title: result.title,
							features: sortedFeatures
						});
					} else {
						// all features shown as individual results
						let features = [];
						results.forEach(result => { features.push(...result.features) });
						this._sortFeatures(features);
						this._featureResults = [{
							features,
							title: null,
							grouped: false
						}];
					}
				}
			});
			this.empty = this._featureResults ? this._featureResults.every(result => {
				return result.features && result.features.length && result.features.length > 0 ? false : true;
			}) : true;
			this.state = 'ready';
		}, () => {
			this.state = "init";
		});
	}
	private async _queryFeatureLayers(layer: esri.FeatureLayer, location) {

		const layerView: esri.FeatureLayerView = await this.view.whenLayerView(layer);
		// Perform query first time layer is done updating	

		if (layerView.updating) {
			await whenFalseOnce(layerView, "updating");
		}
		const queryLayer = this._getQueryLayer(layerView);
		const query: esri.Query = this._createQuery(layerView, location);

		return queryLayer.queryFeatures(query).then(results => {
			if (results.features && results.features.length && results.features.length > 0) {
				this._applyLayerEffectAndFilter(layerView, query);
			} else {
				// hide other layers 
				query.where = "1=0";
				this._applyLayerEffectAndFilter(layerView, query);
			}

			return resolve({
				features: results.features,
				title: layer.get("title") ? layer.get("title") : null,
				id: layer.get("id") ? layer.get("id") : null
			})
		});

	}
	private _createQuery(layer: esri.FeatureLayerView, location: esri.Geometry): esri.Query {
		const { relationship, searchUnits, singleLocationPolygons } = this.config;
		const type = layer.layer.geometryType;
		// we need return geom since we have to get distances and zoom to selected 
		const query = layer.layer.createQuery();
		// Find features that are within x distance of search geometry
		query.geometry = location;

		// Always set with points and lines but also set for 
		// polygons that don't have singleLocationPolygons set to true
		query.distance = type === "polygon" && singleLocationPolygons ? 0 : this.config.sliderRange.default;
		query.units = searchUnits;
		query.spatialRelationship = relationship;
		return query;
	}
	private _getFeatureCount(results) {
		let count: number = 0;
		results && results.forEach(result => {
			if (result.features && result.features.length) {
				count += result.features.length;
			}
		});
		const countString = `${i18n.count}: ${count}`;
		return count < 2 || !this.config.showResultCount ? null : <span class={this.classes('total-count')}>{countString}</span>;
	}
	private _clearDirections() {
		if (this.directions && this.directions.viewModel) {
			this.directions.viewModel.stops.removeAll();
			this.directions.viewModel.reset();
			if (this.expand) {
				this.expand.forEach((expand) => {
					this.view.ui.remove(expand);
				});
			}
		}
		if (this.config.hideMap) {
			const printPage = document.getElementById("printPanel");
			printPage.classList.add("hide");

			printPage.innerHTML = null;
		}
	}
	private _getQueryLayer(layerView: esri.FeatureLayerView): esri.FeatureLayer | esri.FeatureLayerView {
		//return layerView.layer;
		const unsupportedIds = ["4742", "8042", "8086", "4757"];
		const { view } = this;

		if (this.config.hideMap || this.config.hideLayers) {
			return layerView.layer;
		}
		if (!layerView.visible) {
			return layerView.layer;
		}
		if (view && view.container && getComputedStyle(this.view.container).display === "none") {
			return layerView.layer;
		} else if (view && view.spatialReference && (!view.spatialReference.isGeographic && !view.spatialReference.isWGS84 && !view.spatialReference.isWebMercator)) {
			return layerView.layer;
		} else if (view && view.spatialReference && view.spatialReference.wkid && unsupportedIds.indexOf(view.spatialReference.wkid.toString()) !== -1) {
			return layerView.layer;
		} else {
			return layerView.layer;
		}
	}
	private _applyLayerEffectAndFilter(layerView: esri.FeatureLayerView, query) {

		const { geometry, units, spatialRelationship, where } = query;
		const props: __esri.FeatureFilterProperties = {
			geometry,
			spatialRelationship,
			where
		};
		if (this.config?.sliderRange?.default) {
			props.distance = this.config.sliderRange.default;
			if (units) {
				props.units = units;
			}
		}

		const filter = new FeatureFilter(props);
		const effect = new FeatureEffect({ filter });
		layerView.filter = filter;

		layerView.effect = effect;
	}
	_sortFeatures(features) {
		const { includeDistance, searchUnits, sliderRange } = this.config;
		if (includeDistance && this.location && sliderRange) {
			// add distance val to the features and sort array by distance
			getDistances({
				location: this.location.geometry,
				distance: sliderRange?.default,
				unit: searchUnits,
				features
			});

			// sort the features based on the distance
			features.sort((a, b) => {
				const alookup = a.attributes.lookupDistance ? parseFloat(a.attributes.lookupDistance.replace(/[,]/g, '')) : null;
				const blookup = b.attributes.lookupDistance ? parseFloat(b.attributes.lookupDistance.replace(/[,]/g, '')) : null;
				return alookup - blookup;
			});
		}
	}
	public clearResults() {
		this._toggle = false;
		this.empty = true;

		this.lookupGraphics.clearGraphics();
		this.accordion && this.accordion.clear();
		this._featureResults = null;
		if (this.config.hideLayers) {
			hideLookuplayers(this.lookupLayers, this.view);
		} else {
			clearLookupLayers(this.lookupLayers, this.view);
		}

		this._clearDirections();
		this.clearHighlights();
		this.state = 'init';
	}
	clearHighlights() {
		this._handles.removeAll();
	}
	_highlightFeature(graphic: esri.Graphic) {
		this.clearHighlights();

		this.view.whenLayerView(graphic.layer).then((layerView: esri.FeatureLayerView) => {
			// highlight feature
			this._handles.add(layerView.highlight(graphic));
		});
	}


	_zoomToFeature(graphic: esri.Graphic) {
		this.view.goTo(graphic);
		this._highlightFeature(graphic);
	}

	destroy() {
		this.clearResults();
		this.clearHighlights();
	}

	createTogglePanel() {
		const count = this._getFeatureCount(this._featureResults);
		const toggleLinks = this._createToggleLinks();
		return count || toggleLinks ? (<div class={this.classes(CSS.togglePanel)}>
			{toggleLinks}
			{count}
		</div>) : null;

	}
	_createToggleLinks() {
		const buttonLabel = this._toggle ? i18n.tools.collapse : i18n.tools.open;
		const buttonImage = this._toggle ? collapseSVG : expandSVG;
		return this.accordion && this.accordion.showToggle() ? (
			<label
				class={this.classes()}
			>
				<button
					aria-label={buttonLabel}
					bind={this}
					key={buttonLabel}
					class={this.classes(
						CSS.calciteStyles.button,
						CSS.toggleContentBtn,
						CSS.calciteStyles.clearBtn,
						CSS.calciteStyles.smallBtn,
						CSS.expand
					)}
					onclick={
						this._toggleItems}
				>
					{buttonImage}
				</button>
				{buttonLabel}
			</label >
		) : null;
	}
	_toggleItems() {
		this._toggle = !this._toggle;
		const elements = document.getElementsByClassName('accordion-section');
		for (let i = 0; i < elements.length; i++) {
			this._toggle ? elements[i].classList.add("is-active") : elements[i].classList.remove("is-active");
		}
	}
}

export default DisplayLookupResults;
