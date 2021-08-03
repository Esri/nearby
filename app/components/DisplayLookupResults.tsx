
import { subclass, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';
import Handles from 'esri/core/Handles';
import { tsx, messageBundle } from 'esri/widgets/support/widget';
import { getDistances } from '../utilites/geometryUtils';
import { resolve, eachAlways, reject } from 'esri/core/promiseUtils';
import { hideLookuplayers, clearLookupLayers } from '../utilites/lookupLayerUtils';
import FeatureFilter from 'esri/views/layers/support/FeatureFilter';
import FeatureEffect from 'esri/views/layers/support/FeatureEffect';
import GroupedAccordion, { FeatureResults } from './GroupedAccordion';
import { ActionButton } from "./Accordion";
import Expand from 'esri/widgets/Expand';
import MapPanel from './MapPanel';
import Footer from './Footer';
import esri = __esri;
import ConfigurationSettings from '../ConfigurationSettings';
import LookupGraphics from './LookupGraphics';
import { init, whenTrueOnce } from 'esri/core/watchUtils';
import esriRequest from "esri/request";
import ShareUtils = require('../utilites/shareUtils');



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
	togglePanel: 'toggle-panel',
	toggle: 'toggleOpen',
	messageText: 'message-text',
	toggleContentTools: 'toggle-content-tools',
	toggleContentBtn: 'toggle-content-btn'
};
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
	state: State = 'init';
	@property()
	directionsReady: boolean = false;
	@property()
	elevationReady: boolean = false;
	@property()
	elevationProfile: __esri.ElevationProfile = null;

	@property()
	@messageBundle("nearby/app/t9n/common")
	messages = null;
	//--------------------------------------------------------------------------
	//
	// Variables
	//
	//--------------------------------------------------------------------------
	_featureResults: FeatureResults[] = null;
	_eventHandler: any = null;
	_viewPoint: esri.Viewpoint = null;
	_handles: Handles = new Handles();
	_toggle: boolean = false;
	_shareUtils: ShareUtils = null;
	//--------------------------------------------------------------------------
	//
	//  Public Methods
	//
	//--------------------------------------------------------------------------
	constructor(props: DisplayLookupResultsProps) {
		super(props);
	}
	postInitialize() {
		this.own([init(this, "directions.viewModel.state", () => {
			if (this?.directions?.viewModel?.state !== "ready") return;
			this.directionsReady = true;
		}), init(this, "elevationProfile", () => {
			this._clearElevation();
			if (this?.config?.showElevationProfile) {
				this.elevationReady = true;
			}
		})]);
		if (this.config.useDirectionsApp) {
			this.directionsReady = true;
		}
		if (this.config.shareSelected && this?.view) {
			this._shareUtils = new ShareUtils({ view: this.view });
		}
	}
	render() {
		const ready = this.state === 'ready' ? true : false;
		const loader =
			this.state === 'loading' ? (
				<div key="loader" class="loader">
					<calcite-loader
						scale="s"
						inline=""
						active=""
					></calcite-loader>
					<span style="margin:0 10px">{this.messages.load.label}...</span>
				</div>

			) : null;
		// No Results 
		let errorText = null;
		if (this.empty && ready) {
			errorText = this.config.noResultsMessage || this.messages.noFeatures;
			this._featureResults = [];
			if (this.mapPanel && this.mapPanel.isMobileView) {
				// Add no results message to the map in mobile view
				this.mapPanel.message = errorText;
			}
			errorText = (<div><p key="errorText" class={CSS.messageText} innerHTML={errorText} /></div>);
		}
		const accordion = (
			<div key="accordion">
				<div key="detailAccordion" bind={this} afterCreate={this._addDetailAccordion} />
			</div>
		);

		const togglePanel = this._featureResults ? this.createTogglePanel() : null;

		return (
			<div key="loader">
				{loader}
				{errorText}
				{togglePanel}
				{accordion}
			</div>
		);
	}

	_addDetailAccordion(container: HTMLElement) {
		const { _featureResults, view } = this;
		this._eventHandler = this._handleActionItem.bind(this);
		this.accordion = new GroupedAccordion({
			featureResults: _featureResults,
			config: this.config,
			view,
			container
		});
		whenTrueOnce(this, "config.shareSelected", () => {
			const shareButton = this._updateSingleShare();
			if (!shareButton) return;
			if (this.config.shareSelected) {
				this.accordion.actionBarItems.push(shareButton);
			}
		});
		whenTrueOnce(this, "elevationReady", () => {
			const elevationProfileButton = this._updateProfile();
			if (elevationProfileButton) {
				this.accordion.actionBarItems.push(elevationProfileButton);
			}
		});

		whenTrueOnce(this, "directionsReady", () => {
			const directionsButton = this._updateDirections();
			if (directionsButton) {
				this.accordion.actionBarItems.push(directionsButton);
			}
		});
		this.accordion.watch("hoveredItem", () => {
			if (this.accordion.hoveredItem && this.accordion.hoveredItem.graphic) {
				let location = this.accordion.hoveredItem.graphic.geometry;
				if (location && location.type !== "point") {
					location = location.extent.center;
				}
				const mobileView = window?.innerWidth < 720 ? true : false;
				const title = this.accordion.hoveredItem.title;
				// only do this if both map and results are visible 

				if (title && !mobileView) {
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
				} else {
					this.view.popup.dockEnabled = true;
					this.view.popup.dockOptions.buttonEnabled = true;

				}
				this._highlightFeature(this.accordion.hoveredItem.graphic);
			}
		});
		this.accordion.watch('selectedItem', () => {
			this._clearDirections();
			this._clearElevation();
			if (this.accordion.selectedItem) {
				this._highlightFeature(this.accordion.selectedItem);
				this.accordion.zoom && this._zoomToFeature(this.accordion.selectedItem);
				this.mapPanel.selectedItemTitle =
					this.accordion.selectedItem.attributes['app-accordion-title'] ?? null;
			}
			this.accordion.selectedItem = null;
		});
	}
	async _handleActionItem(e: MouseEvent, name: string, selected: esri.Graphic) {

		if (name === "directions") {
			if (this.directions && this.directions.viewModel && !this.config.useDirectionsApp) {
				const start = this._createStop(this.location);
				const stop = this._createStop(selected);
				this._clearDirections();
				this.directions.viewModel.stops.addMany([start, stop]);
				await this.directions.viewModel.getDirections() as any;
				if (this.config.hideMap) {
					await this.directions.getDirections();
					// add directions widget to new popup and open 
					const printPage = document.getElementById("printPanel");
					printPage.classList.remove("hide");
					// add button 
					const closebutton = document.createElement("button");
					closebutton.classList.add("btn");
					closebutton.classList.add("btn-transparent");
					closebutton.classList.add("right");
					closebutton.setAttribute("aria-label", this.config.bundle.close);
					closebutton.title = this.config.bundle.close;
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
							node.innerHTML = this.messages.tools.results;
						}
						this.footer && this.footer.showMap();
					}
					const expand = new Expand({
						content: this.directions.container,
						collapseTooltip: `${this.messages.toggle} ${this.directions.label}`,
						expandTooltip: `${this.messages.toggle} ${this.directions.label}`,
						id: "directions-expand",
						mode: "floating",
						expandIconClass: "esri-icon-directions",
						group: "action-item-group",
						view: this.view
					});

					this._toggleExpandContainers();
					this.expand.push(expand);
					expand.expand();
					this.view.ui.add(expand, 'bottom-right');
				}

			} else if (this.config.useDirectionsApp) {
				if (selected?.geometry.type === "point") {
					const g = selected.geometry as __esri.Point;
					const origin = encodeURIComponent(`${g.latitude},${g.longitude}`);

					if ((navigator.platform.indexOf("iPhone") != -1)
						|| (navigator.platform.indexOf("iPod") != -1)
						|| (navigator.platform.indexOf("iPad") != -1))
						window.open(`maps://www.google.com/maps/dir/?api=1&travelmode=driving&layer=traffic&destination=${origin}`);
					else
						window.open(`https://www.google.com/maps/dir/?api=1&travelmode=driving&layer=traffic&destination=${origin}`);
				}
				/*	// origin can be address or lat,long
				const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}`;
				window.open(url, "_blank");*/
			}
		}
		if (name === "elevationProfile") {
			if (!this.elevationReady) return;
			if (this.view && this.view.container && getComputedStyle(this.view.container).display === "none") {
				this.footer?.showMap();
			}
			this._clearElevation();
			this.elevationProfile.input = selected;
			const expand = new Expand({
				content: this.elevationProfile,
				mode: "floating",
				id: "elevation-profile-expand",
				expandIconClass: "esri-icon-line-chart",
				group: "action-item-group",
				view: this.view
			});
			if (this.elevationProfile?.label) {
				expand.expandTooltip = "";
				expand.collapseTooltip = `${this.messages.toggle} ${this.elevationProfile.label}`;
			}

			this._toggleExpandContainers();
			this.expand.push(expand);
			expand.expand();
			this.view.ui.add(expand, 'bottom-right');

		}

		if (name === "copyLink") {
			let nav = navigator as any;
			const button = e.target as HTMLButtonElement;
			if (nav?.canShare && nav?.canShare({ url: window.location.href }) && this.isMobile()) {
				const url = await this._shareUtils?.generateUrl(selected);
				nav.share({
					url,
					title: document.title
				}).catch((error) => { console.log("Error", error) })
			} else if (nav?.clipboard) {
				try {
					// Safari treats user activation differently:
					// https://bugs.webkit.org/show_bug.cgi?id=222262.
					nav.clipboard.write([
						new ClipboardItem({
							'text/plain': this._shareUtils?.generateUrl(selected).then((result) => {
								return new Blob([result]);
							})
						}),
					]);
				} catch {
					// Chromium
					const url = await this._shareUtils?.generateUrl(selected);
					await nav.clipboard.writeText(url);
				}
				//await nav.clipboard.writeText(url);
			} else {
				const url = await this._shareUtils?.generateUrl(selected);

				const dummy = document.createElement('input');
				document.body.appendChild(dummy);
				dummy.value = url;
				dummy.setSelectionRange(0, dummy.value.length);
				dummy.focus();
				dummy.select();

				document.execCommand('copy');
				document.body.removeChild(dummy);
			}
			this._updateButtonText(button);


		}
	}
	isMobile() {
		return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}
	_updateButtonText(button) {
		if (!button) return;
		const origAppearance = button.appearance;
		const origText = button.innerText;
		button.appearance = "solid";
		setTimeout(() => {
			button.innerText = origText;
			button.appearance = origAppearance;

		}, 3000);

		button.innerText = "Link Copied"
	}
	_toggleExpandContainers() {
		this.expand?.forEach(expandItem => {
			if (expandItem?.expanded)
				expandItem.collapse();
		});
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
		returnGraphic.attributes = {};
		return returnGraphic;
	}
	async queryFeatures(location: esri.Graphic) {
		this.location = location;
		this.lookupGraphics.graphic = location;
		this.state = 'loading';

		if (!location) {
			this.state = 'init';
			this._featureResults = [];
			resolve();
		} else {
			await this.lookupGraphics.addGraphicsAndZoom(location);

			const resultArray = [];
			eachAlways(this.lookupLayers.map(layer => {
				return this._queryFeatureLayers(layer, location.geometry).then((results: any) => {
					if (this.config.groupResultsByLayer) {
						const { features, title } = results;
						const layerIndex = this.view.map.allLayers.indexOf(layer);
						if (features?.length < 1) {
							this.empty = true;
							return;
						}
						this.empty = false;

						this._sortAndDistance(features);

						resultArray.push({
							title,
							features,
							layerIndex
						});

						this._featureResults = resultArray;

						this.accordion.set("featureResults", this._featureResults);
						return;
					} else {
						if (results.features?.length < 1) {
							this.empty = true;
							return;
						};
						this.empty = false;
						results.features.forEach(feature => {
							resultArray.push(feature);
						});

						this._featureResults = [{
							title: null,
							grouped: false,
							features: resultArray
						}];
						return;
					}
				}).catch(() => {
					this.empty = true;
					return;
				});
			})).then(() => {
				if (!this.config?.groupResultsByLayer) {
					if (this._featureResults?.length > 0) {
						this._sortAndDistance(this._featureResults[0].features);
					}
					this.accordion.set("featureResults", this._featureResults);
				}
				this.empty = (this._featureResults?.length === 0 || !this._featureResults) ? true : false;
				this.state = "ready";
				this.accordion.state = "ready";

			}).catch(() => {
				this.empty = true;
				this.state = "init";
			});

		}
	}
	private async _queryFeatureLayers(layer: esri.FeatureLayer, location) {
		const controller = new AbortController();
		try {
			const layerView: esri.FeatureLayerView = await this.view.whenLayerView(layer);
			// Perform query first time layer is done updating	

			layerView.effect = null;
			layerView.filter = null;

			const queryLayer = this._getQueryLayer(layerView);

			// from server 
			const query: esri.Query = this._createQuery(layerView, location);

			const results = await queryLayer.queryFeatures(query, { signal: controller.signal });

			if (results?.features?.length < 1) query.where = "1=0";
			this._applyLayerEffectAndFilter(layerView, query);
			return resolve({
				features: results.features,
				title: layer.get("title") ? layer.get("title") : null,
				id: layer.get("id") ? layer.get("id") : null
			});
		} catch (error) {
			return reject();
		}

	}
	private _createQuery(layer: esri.FeatureLayerView, location: esri.Geometry): esri.Query {
		const { relationship, searchUnits, singleLocationPolygons, enableBufferSearch } = this.config;
		const type = layer.layer.geometryType;
		// we need return geom since we have to get distances and zoom to selected 
		const query = layer.layer.createQuery();
		// Find features that are within x distance of search geometry
		query.geometry = enableBufferSearch ? location as any : this.view.extent;

		// Always set with points and lines but also set for 
		// polygons that don't have singleLocationPolygons set to true
		if (enableBufferSearch) {
			query.distance = (type === "polygon" && singleLocationPolygons) ? 0 : this.config.sliderRange.default;
			query.units = searchUnits;
		}

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
		const countString = `${this.messages.count}: ${count}`;
		return count < 2 || !this.config.showResultCount ? null : <span class={this.classes('total-count')}>{countString}</span>;
	}
	private _clearElevation() {
		if (this?.config?.showElevationProfile && this.elevationProfile) {
			if (this.elevationProfile?.input) {
				this.elevationProfile.input = null;
			}
			if (this.expand) {
				this.expand.forEach((expand) => {
					if (expand?.id === "elevation-profile-expand") {
						this.view.ui.remove(expand);
					}
				});
			}
		}
	}
	private _clearDirections() {
		if (this.directions && this.directions.viewModel) {
			this.directions.viewModel.stops.removeAll();
			this.directions.viewModel.reset();
			if (this.expand) {
				this.expand.forEach((expand) => {
					if (expand?.id === "directions-expand") {
						this.view.ui.remove(expand);
					}
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

		const unsupportedIds = ["4742", "8042", "8086", "4757"];
		const { view } = this;
		const { hideMap, hideLayers, find, select, level, center } = this.config;
		if (hideMap || hideLayers) {
			return layerView.layer;
		}
		if (!layerView.visible) {
			return layerView.layer;
		}
		if (layerView?.layer?.definitionExpression) {
			return layerView.layer;
		}
		if (view && view.container && getComputedStyle(this.view.container).display === "none") {
			return layerView.layer;
		} else if (view && view.spatialReference && (!view.spatialReference.isGeographic && !view.spatialReference.isWGS84 && !view.spatialReference.isWebMercator)) {
			return layerView.layer;
		} else if (view && view.spatialReference && view.spatialReference.wkid && unsupportedIds.indexOf(view.spatialReference.wkid.toString()) !== -1) {
			return layerView.layer;
		} else if (view?.scale >= layerView?.layer?.minScale || view.scale <= layerView?.layer?.maxScale) {
			// Use layer if there is a scale dependency applied
			return layerView.layer;
		} else if (center && level && select) {
			return layerView.layer;
		}
		else {
			return layerView;
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
		if (effect?.includedEffect || effect?.excludedEffect) {
			layerView.effect = effect;
		}
	}
	_sortAndDistance(features) {
		const { includeDistance, searchUnits, sliderRange } = this.config;
		if (includeDistance && this.location && sliderRange) {
			// add distance val to the features and sort array by distance
			getDistances({
				location: this.location?.geometry,
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
	private _updateDirections() {
		let actionButton: ActionButton = null;

		if (this.config.showDirections) {
			if (this.directions || this.config.useDirectionsApp) {
				if (this?.directions?.viewModel?.state === "ready" || this.config.useDirectionsApp) {
					actionButton = {
						icon: 'road-sign',
						id: 'directions',
						name: this.directions && this.directions.label ? this.directions.label : 'Directions',
						handleClick: this._eventHandler
					};
				}
			}
		}
		return actionButton;
	}
	private _updateProfile() {
		let actionButton: ActionButton = null;
		if (this.config.showElevationProfile) {
			actionButton = {
				icon: 'graph-time-series',
				id: 'elevationProfile',
				name: this.config.appBundle.tools.elevation,
				handleClick: this._eventHandler
			};
		}
		return actionButton;
	}
	private _updateSingleShare() {
		let actionButton: ActionButton = null;
		if (this.config.shareSelected) {
			actionButton = {
				icon: 'copyToClipboard',
				id: 'copyLink',
				name: "Copy link",
				tip: "Copy link to result",
				handleClick: this._eventHandler
			};
		}
		return actionButton;
	}
	public clearResults() {
		this._toggle = false;
		this.empty = true;

		this.lookupGraphics.clearGraphics();
		this.accordion && this.accordion.clear();
		this._featureResults = [];
		this.config.hideLayers ? hideLookuplayers(this.lookupLayers, this.view) : clearLookupLayers(this.lookupLayers, this.view);

		this._clearDirections();
		this._clearElevation();
		this.clearHighlights();
		this._clearUrlParams();
		this.state = 'init';
	}
	_clearUrlParams() {
		const url = new URL(window.location.href);
		if (url && url.searchParams) {
			url.searchParams.delete("center");
			url.searchParams.delete("select");
			url.searchParams.delete("level");
			url.searchParams.delete("find");
		}
		if (url?.searchParams && url?.searchParams.toString()) {
			window.history.replaceState({}, '', `${location.pathname}?${url?.searchParams.toString()}`);
		} else {
			window.history.replaceState({}, '', `${location.pathname}`);
		}

	}
	clearHighlights() {
		this._handles.removeAll();
		if (this?.view?.popup) this.view.popup.features = null;
	}
	_highlightFeature(graphic: esri.Graphic) {
		this.clearHighlights();

		this.view.whenLayerView(graphic.layer).then((layerView: esri.FeatureLayerView) => {
			// highlight feature
			this._handles.add(layerView.highlight(graphic));
		});
	}


	_zoomToFeature(graphic: esri.Graphic) {
		this.view.goTo(graphic).catch(() => { });
		this._highlightFeature(graphic);
	}

	destroy() {
		this.clearResults();
		this.clearHighlights();
	}
	createTogglePanel() {
		const { theme } = this.config;
		let themeClass = theme === "dark" ? "calcite-theme-dark" : "calcite-theme-light";
		const count = this._getFeatureCount(this._featureResults);
		const toggleLinks = this._createToggleLinks();
		return count || toggleLinks ? (<div class={this.classes(CSS.togglePanel)}>
			<div class={this.classes("total-count", "results")}>
				<calcite-icon class={this.classes(themeClass)} scale="s" textLabel={this.messages.tools.results} icon="table">
				</calcite-icon>
				{this.messages.tools.results}

			</div>
			<div>
				{toggleLinks}
				{count}
			</div>
		</div>) : null;

	}
	_createToggleLinks() {
		const { theme } = this.config;
		let themeClass = theme === "dark" ? "calcite-theme-dark" : "calcite-theme-light";
		const buttonLabel = this._toggle ? this.messages.tools.collapse : this.messages.tools.open;
		const buttonIcon = this._toggle ? "contract" : "expand";

		return this?.accordion?.showToggle() ? (
			<calcite-button
				aria-label={buttonLabel}
				bind={this}
				class={this.classes(themeClass)}
				color="neutral"
				scale="m"
				appearance="transparent"
				key={buttonLabel}

				onclick={
					this._toggleItems}
			>
				{buttonLabel}
				<calcite-icon icon={buttonIcon} scale="s"></calcite-icon>
			</calcite-button>

		) : null;

	}
	private async _shorten(url: string): Promise<string> {
		return esriRequest("https://arcg.is/prod/shorten", {
			query: {
				longUrl: url,
				f: "json"
			}
		}).then((response) => {
			return response?.data?.data?.url || null;
		}).catch(() => {
			return null;
		});
	}
	_toggleItems() {
		this._toggle = !this._toggle;
		const elements = document.getElementsByTagName("calcite-accordion-item");
		for (let i = 0; i < elements.length; i++) {

			this._toggle ? elements[i]?.setAttribute("active", "true") : elements[i].removeAttribute("active")
		}
	}
}

export default DisplayLookupResults;


