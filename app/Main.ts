/*
  Copyright 2017 Esri
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

import ApplicationBase from 'ApplicationBase/ApplicationBase';
import Telemetry from 'telemetry/telemetry.dojo';
import Search from 'esri/widgets/Search';
import Graphic from 'esri/Graphic';
import Handles from 'esri/core/Handles';

import * as lookupLayerUtils from './utilites/lookupLayerUtils';

import * as esriWidgetUtils from './utilites/esriWidgetUtils';
import * as errorUtils from './utilites/errorUtils';
import watchUtils = require('esri/core/watchUtils');
import * as geometryUtils from './utilites/geometryUtils';
import DisplayLookupResults from './components/DisplayLookupResults';
import Header from './components/Header';
import Footer from './components/Footer';
import MapPanel from './components/MapPanel';
import * as promiseUtils from 'esri/core/promiseUtils';

import i18n = require('dojo/i18n!./nls/resources');

import esri = __esri;
const CSS = {
	loading: 'configurable-application--loading'
};

import { setPageLocale, setPageDirection, setPageTitle } from 'ApplicationBase/support/domHelper';

import FeatureLayer = require('esri/layers/FeatureLayer');
import DetailPanel from './components/DetailPanel';

class LocationApp {

	telemetry: Telemetry = null;
	searchWidget: Search = null;
	view: esri.MapView;
	mapPanel: MapPanel = null;
	_detailPanel: DetailPanel = null;
	footer: Footer = null;
	_handles: Handles = new Handles();
	_searchFeature: Graphic;
	// DisplayLookupResults is the component that handles displaying the popup content
	// using the Feature widget for the features that match the lookup search requirements
	lookupResults: DisplayLookupResults;
	//----------------------------------
	//  ApplicationBase
	//----------------------------------
	base: ApplicationBase = null;

	//--------------------------------------------------------------------------
	//
	//  Public Methods
	//
	//--------------------------------------------------------------------------

	public init(base: ApplicationBase): void {
		if (!base) {
			console.error('ApplicationBase is not defined');
			return;
		}
		this._applySharedTheme(base);

		setPageLocale(base.locale);
		setPageDirection(base.direction);

		this.base = base;

		const { config, results, portal } = base;

		config.helperServices = { ...base.portal.helperServices };

		const { webMapItems } = results;


		if (config.noMap) {
			document.body.classList.add('no-map');
		}
		// Setup Telemetry
		if (config.telemetry) {
			let options = config.telemetry.prod;
			if (portal.customBaseUrl.indexOf('mapsdevext') !== -1) {
				// use devext credentials
				options = config.telemetry.devext;
			} else if (portal.customBaseUrl.indexOf('mapsqa') !== -1) {
				// or qa
				options = config.telemetry.qaext;
			}
			this.telemetry = new Telemetry({
				portal,
				disabled: options.disabled,
				debug: options.debug,
				amazon: options.amazon
			});
			this.telemetry.logPageView();
		}

		// Get web map
		const allItems = webMapItems.map((item) => {
			return item;
		});
		let validWebMapItems = [];
		allItems.forEach((response) => {
			if (response && response.error) {
				return;
			}
			validWebMapItems.push(response.value);
		});
		const item = validWebMapItems[0];

		if (!item) {
			const error = 'Could not load an item to display';
			errorUtils.displayError({
				title: 'Error',
				message: error
			});
			this.telemetry.logError({
				error
			});
			return;
		}
		this._createMap(item);
	}
	async _createMap(item) {
		const { config } = this.base;
		this.mapPanel = await new MapPanel({
			item,
			base: this.base,
			container: 'mapPanel'
		});
		this._handles.add(this.mapPanel.watch("isMobileView", (isMobile) => {
			// enable popup in mobile view 
			this.view.popup.autoOpenEnabled = isMobile;
		}), "popupvis");
		const panelHandle = this.mapPanel.watch('view', () => {
			panelHandle.remove();
			this.view = this.mapPanel.view;
			this.view.popup.autoOpenEnabled = false;
			this.view.popup.actions = null;
			document.body.classList.remove(CSS.loading);
			this._addWidgets(config);
			this._addHeader(item);
			if (!this.base.config.noMap) {
				this._addFooter();
			}

		});
	}
	_addFooter() {
		const { config } = this.base;

		this.footer = new Footer({
			container: 'bottomNav',
			mapPanel: this.mapPanel,
			config
		});
		if (this.mapPanel) {

			watchUtils.whenTrue(this.mapPanel, "isMobileView", (value) => {
				this._detailPanel && this._detailPanel.hidePanel();
			})
		}
	}
	_addHeader(item: esri.PortalItem) {
		const { config } = this.base;
		let { detailTitle, detailContent, socialSharing } = config;
		// Add a page header
		config.title = config.title || item.title;
		setPageTitle(config.title);

		// localize onboarding if custom text isn't set
		const defaultTitle = "Welcome!";
		const defaultContent = "Search for an address to learn more about the location and its surrounding area.<br />If you don't know the address, use one of these search methods: <ul><li>Click the search box and type in an address or choose <b>Use current location</b></li><li>Click within the map</li></ul><br /> Results will include information about features of interest.";

		if (!detailTitle || (detailTitle && detailTitle === defaultTitle)) {
			detailTitle = i18n.onboarding.title;
		} else {
			detailTitle = detailTitle;
		}

		if (!detailContent || (detailContent && detailContent.trim() == defaultContent.trim())) {
			detailContent = i18n.onboarding.content;
		} else {
			detailContent = detailContent;
		}
		//detailContent = !detailContent ? i18n.onboarding.content : detailContent;
		//	}

		if (detailTitle || detailContent || socialSharing) {
			this._detailPanel = new DetailPanel({
				title: detailTitle || null,
				content: detailContent,
				view: this.view,
				sharing: socialSharing,
				container: document.getElementById('detailPanel')
			});
			// If there is a value in session storage don't open panel when app loads
			const detailPanelShown = sessionStorage && sessionStorage.getItem("detailPanelShow") ? true : false;
			if (!detailPanelShown) {
				this._detailPanel.showPanel();
				sessionStorage && sessionStorage.setItem("detailPanelShow", "true");
			}
		}

		const header = new Header({
			config,
			detailPanel: this._detailPanel,
			container: 'header'
		});
	}
	async _addWidgets(config) {
		// Add esri widgets to the app (legend, home etc)
		esriWidgetUtils.addMapComponents({
			view: this.view,
			config,
			portal: this.base.portal
		});

		this._setupFeatureSearch();
	}
	async _setupFeatureSearch() {
		const { config } = this.base;
		// Create the panel that contains the slider and 
		// optionally the filter 

		const RefineResults = await import("./components/RefineResults");
		if (!RefineResults) {
			return;
		}
		const container = document.getElementById("distanceOptions");
		if (config.distance && !isNaN(config.distance)) {
			config.distance = parseFloat(config.distance);
		}
		const refineResultsPanel = new RefineResults.default({
			base: this.base,
			container
		});
		refineResultsPanel.watch("value", (value) => {
			this.base.config.distance = value;
			this.lookupResults && this.lookupResults.clearResults();
			if (this._searchFeature) {
				this._generateSearchResults();
			}
			this._updateUrlParam();
		});

		// Get configured lookup layers or if none are configured get
		// all the feature layers in the map
		let parsedLayers = config.lookupLayers ? JSON.parse(config.lookupLayers) : null;
		if (!Array.isArray(parsedLayers) || !parsedLayers.length) {
			parsedLayers = null;
		}

		const lookupLayers = await lookupLayerUtils.getLookupLayers({
			view: this.view,
			lookupLayers: parsedLayers,
			hideFeaturesOnLoad: config.hideLookupLayers
		});


		this.lookupResults = new DisplayLookupResults({
			lookupLayers,
			config: this.base.config,
			view: this.view,
			mapPanel: this.mapPanel,
			container: 'resultsPanel',
			footer: this.footer ? this.footer : null
		});
		this._addSearchWidget();

		// Wait for view model 
		if (config.showDirections) {
			const { url } = config.helperServices.route;
			const Directions = await import('esri/widgets/Directions');
			const directions = new Directions.default({
				routeServiceUrl: url,
				container: document.createElement("div")
			});
			// add directions to the view's popup 

			watchUtils.whenDefinedOnce(directions, "viewModel", () => {

				directions.view = this.view;
				directions.viewModel.routeParameters.directionsLengthUnits = config.units;
				directions.viewModel.routeParameters.returnDirections = true;

				directions.viewModel.load().catch((e) => {
					if (e && e.message) {
						console.log("Problem loading directions:", e.message);
					}
				});
			});
			this.lookupResults.directions = directions;
		}
	}

	private _addSearchWidget(): void {
		const { searchConfig, find, findSource } = this.base.config;
		const container = document.getElementById("search") as HTMLElement;
		const searchProperties: esri.widgetsSearchProperties = {
			view: this.view,
			resultGraphicEnabled: false,
			autoSelect: false,
			popupEnabled: false,
			container
		};

		if (searchConfig) {
			console.log("SC", searchConfig);
			const { sources, activeSourceIndex, enableSearchingAll } = searchConfig;
			if (sources) {

				searchProperties.sources = sources.filter((source) => {
					if (source.flayerId && source.url) {
						const layer = this.view.map.findLayerById(source.flayerId);
						source.layer = layer ? layer : new FeatureLayer(source.url);
					}
					if (source.hasOwnProperty('enableSuggestions')) {
						source.suggestionsEnabled = source.enableSuggestions;
					}
					if (source.hasOwnProperty('searchWithinMap')) {
						source.withinViewEnabled = source.searchWithinMap;
					}
					return source;
				});
			}
			if (searchProperties.sources && searchProperties.sources.length && searchProperties.sources.length > 0) {
				searchProperties.includeDefaultSources = false;
			}
			searchProperties.searchAllEnabled =
				enableSearchingAll && enableSearchingAll === false ? false : true;
			if (
				activeSourceIndex != null && activeSourceIndex != undefined &&
				searchProperties?.sources.length >= activeSourceIndex
			) {
				searchProperties.activeSourceIndex = activeSourceIndex;
			}

		}
		this.searchWidget = new Search(searchProperties);

		// If there's a find url param search for it when view is done updating once
		if (find) {
			watchUtils.whenFalseOnce(this.view, "updating", () => {

				this.searchWidget.viewModel.searchTerm = decodeURIComponent(find);
				if (findSource) {
					this.searchWidget.activeSourceIndex = findSource;
				}
				this.searchWidget.viewModel.search();
			});
		}

		const handle = this.searchWidget.viewModel.watch('state', (state) => {

			if (state === 'ready') {
				handle.remove();
				// conditionally hide on tablet
				if (!this.view.container.classList.contains('tablet-show')) {
					this.view.container.classList.add('tablet-hide');
				}
				// force search within map if nothing is configured
				if (!searchConfig) {
					this.searchWidget.viewModel.allSources.forEach((source) => {
						source.withinViewEnabled = true;
					});
				}
			}
		});
		this.searchWidget.on('search-clear', () => {
			this._cleanUpResults();
			container.classList.remove("hide-search-btn");
			//this.clearSearchButton.setAttribute("disabled", "disabled");
			// Remove find url param
			this._updateUrlParam();
			this._searchFeature = null;
		});

		this.searchWidget.on('search-complete', async (results) => {
			this._cleanUpResults();

			if (results.numResults > 0) {
				// Add find url param
				container.classList.add("hide-search-btn");
				const index = results && results.activeSourceIndex ? results.activeSourceIndex : null;

				this._updateUrlParam(index);

				// Get search geometry and add address location to the map
				const feature = await lookupLayerUtils.getSearchGeometry({
					config: this.base.config,
					view: this.view,
					results
				});
				this._searchFeature = feature;
				this._generateSearchResults();
			}
		});
		// We also want to search for locations when users click on the map if 
		// we aren't in 'interactive results' mode 
		this.view.on('click', async (e: esri.MapViewClickEvent) => {
			const point = e.mapPoint;
			if (this.lookupResults.empty) {
				this._performSearch(point);
			} else {
				// User clicked on map do hit test to get feature 
				// and highlight in the results list 
				const screenPoint = this.view.toScreen(point);
				const results = await this.view.hitTest(screenPoint);

				// If we are in mobile view let's wait until we switch out
				this._getSelectedAccordionItem(results);
				if (this.mapPanel.isMobileView) {
					watchUtils.whenFalseOnce(this.mapPanel, "isMobileView", () => {
						this._getSelectedAccordionItem(results);
					});
				}
			}
		});
		// add clear search button to map view 
		const clearButton = document.createElement("button");
		clearButton.innerHTML = i18n.tools.clearLocation;
		clearButton.classList.add("btn");
		clearButton.classList.add("clear-btn");
		clearButton.classList.add('hide');
		clearButton.classList.add("app-button");
		clearButton.addEventListener("click", () => {
			this.searchWidget && this.searchWidget.clear();
		});
		this.view.ui.add(clearButton, 'manual');
		this.lookupResults.watch("empty", (val) => {
			if (!val) {
				clearButton.classList.remove("hide");
			} else {
				clearButton.classList.add("hide");
			}
		});
	}
	_getSelectedAccordionItem(results) {

		if (this.lookupResults.accordion) {
			this.lookupResults.accordion.findAccordionItem(results)
		};
	}
	_performSearch(mapPoint) {
		this.searchWidget.search(mapPoint).then((response: any) => {
			if (response && response.numResults < 1) {
				this._displayNoResultsMessage(mapPoint);
			}
			if (response && response.numErrors && response.numErrors > 0) {
				this._displayNoResultsMessage(mapPoint);
			}
		});
	}
	_displayNoResultsMessage(geometry: esri.Geometry) {
		// display no results message
		this._searchFeature = new Graphic({ geometry });
		this._generateSearchResults();
		this.searchWidget.activeMenu = null;
	}
	private async _generateSearchResults() {

		const location = this._searchFeature ? this._searchFeature : null;
		if (this._detailPanel) {
			this._detailPanel.hidePanel();
		}
		const distance = (this.base.config && this.base.config.distance) || 0;
		this.lookupResults && this.lookupResults.queryFeatures(location, distance);
	}

	private _cleanUpResults() {
		// Clear the lookup results displayed in the side panel
		this.lookupResults && this.lookupResults.clearResults();
		this.view.graphics.removeAll();
		this.mapPanel && this.mapPanel.clearResults();
		if (!this.mapPanel.isMobileView) {
			this.view.popup.autoOpenEnabled = false;
		}
	}
	//_updateUrlParam(searchTerm?, index?) {
	private _updateUrlParam(index?) {
		if ('URLSearchParams' in window) {
			const params = new URLSearchParams(document.location.search);
			const searchTerm = encodeURIComponent(this.searchWidget.searchTerm);
			if (searchTerm) {
				if (index && (index > 0 || index === 0)) {
					params.set('findSource', index);
				} else {
					params.delete('findSource');
				}
				if (this.base.config.distance) {
					params.set('distance', this.base.config.distance);
				}
				params.set('find', encodeURIComponent(this.searchWidget.searchTerm));
			} else {
				params.delete('find');
				params.delete('findSource');
				params.delete('distance');
			}
			if (params && params.toString()) {
				window.history.replaceState({}, '', `${location.pathname}?${params}`);
			} else {
				window.history.replaceState({}, '', `${location.pathname}`);
			}
		}
	}
	private _applySharedTheme(base) {
		const { config } = base;
		// Build and insert style
		const styles = [];
		styles.push(config.headerBackground ? `#detailPanel svg{color:${config.headerBackground};}.app-header{background:${config.headerBackground};}` : null);
		styles.push(
			config.headerColor
				? `.app-header a{color:${config.headerColor};}.app-header{color:${config.headerColor};}.toolbar-buttons{color:${config.headerColor}}`
				: null
		);
		styles.push(
			config.buttonBackground
				? `.esri-icon-close:before, .esri-icon-search:before, .esri-clear-search,.esri-search__submit-button{color:${config.buttonBackground}}.app-button:hover, .app-button{background:${config.buttonBackground}; border-color:${config.buttonBackground};} #detailPanel .svg-icon{color:${config.buttonBackground};}`
				: null
		);
		styles.push(
			config.buttonColor
				? `.app-button, .app-button:hover{color:${config.buttonColor};}`
				: null
		);
		const style = document.createElement('style');
		style.appendChild(document.createTextNode(styles.join('')));
		document.getElementsByTagName('head')[0].appendChild(style);
	}
}
export = LocationApp;
