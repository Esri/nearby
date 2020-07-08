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

import { getLookupLayers, getSearchGeometry } from './utilites/lookupLayerUtils';

import { addMapComponents } from './utilites/esriWidgetUtils';
import { displayError } from './utilites/errorUtils';
import { whenTrue, whenDefinedOnce, whenFalseOnce, init, watch } from 'esri/core/watchUtils';
import DisplayLookupResults from './components/DisplayLookupResults';
import Header from './components/Header';
import Footer from './components/Footer';
import MapPanel from './components/MapPanel';

import i18n = require('dojo/i18n!./nls/resources');

import esri = __esri;
const CSS = {
	loading: 'configurable-application--loading'
};

import { setPageLocale, setPageDirection, setPageTitle } from 'ApplicationBase/support/domHelper';
import ConfigurationSettings from "./ConfigurationSettings";
import DetailPanel from './components/DetailPanel';
import LookupGraphics = require('./components/LookupGraphics');
import FeatureLayer from 'esri/layers/FeatureLayer';
class LocationApp {
	_appConfig: ConfigurationSettings = null;
	telemetry: Telemetry = null;
	searchWidget: Search = null;
	view: esri.MapView;
	mapPanel: MapPanel = null;
	_detailPanel: DetailPanel = null;
	_clearButton: HTMLButtonElement = null;
	footer: Footer = null;
	_handles: Handles = new Handles();
	_searchFeature: Graphic;
	_results: Graphic[] = null;
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


		this._updateMapVisibility(base.config);

		setPageLocale(base.locale);
		setPageDirection(base.direction);

		this.base = base;


		const { config, results, portal } = base;

		config.helperServices = { ...base.portal.helperServices };

		const { webMapItems } = results;

		// create and insert the shared theme styles 
		this._createSharedTheme();
		this._appConfig = new ConfigurationSettings(config);
		this._handles.add(init(this._appConfig, ["theme", "applySharedTheme"], () => {
			this.handleThemeUpdates();
		}), "configuration");


		// Setup Telemetry
		if (config.telemetry) {
			const { prod, qaext, devext } = config.telemetry;
			let options = prod;
			if (portal.customBaseUrl.indexOf('mapsdevext') !== -1) {
				// use devext credentials
				options = devext;
			} else if (portal.customBaseUrl.indexOf('mapsqa') !== -1) {
				// or qa
				options = qaext;
			}
			const { disabled, debug, amazon } = options;
			this.telemetry = new Telemetry({
				portal,
				disabled,
				debug,
				amazon
			});
			this.telemetry.logPageView();
		}

		// Get web map
		const allItems = webMapItems.map((item) => {
			return item;
		});
		let validWebMapItems = [];
		allItems.forEach((response) => {
			if (response?.error) {
				return;
			}
			validWebMapItems.push(response.value);
		});
		const item = validWebMapItems[0];

		if (!item) {
			const error = 'Could not load an item to display';
			displayError({
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
			// watch properties that determine how results are displayed
			this._handles.add(init(this._appConfig, ["searchUnits", "includeDistance", "interactiveResults", "groupResultsByLayer"], () => {
				if (this._results) {
					this._displayResults(this._results);
				}
			}), "configuration");

			this.view.popup.autoOpenEnabled = false;
			this.view.popup.actions = null;
			document.body.classList.remove(CSS.loading);
			this._addWidgets();
			this._addHeader(item);
			this._addFooter();

		});
	}
	_addFooter() {

		const { hideMap } = this._appConfig;

		this.footer = new Footer({
			container: 'bottomNav',
			hideMap,
			mapPanel: this.mapPanel,
			config: this._appConfig
		});
		// dark background: #242424 color "#d1d1d1"
		this._handles.add(init(this._appConfig, "hideMap", () => {
			this._updateMapVisibility(this._appConfig);
		}), "configuration");
		if (this.mapPanel && !hideMap) {
			whenTrue(this.mapPanel, "isMobileView", (value) => {
				this._detailPanel && this._detailPanel.hidePanel();
			})
		}
	}
	_addHeader(item: esri.PortalItem) {
		// Add a page header
		this._appConfig.title = this._appConfig.title || item.title;
		setPageTitle(this._appConfig.title);
		// Add info button 
		this._detailPanel = new DetailPanel({
			config: this._appConfig,
			view: this.view,
			container: document.getElementById('detailPanel')
		});
		// If there is a value in session storage don't open panel when app loads
		const detailPanelShown = sessionStorage && sessionStorage.getItem("detailPanelShow") ? true : false;
		if (!detailPanelShown) {
			this._detailPanel.showPanel();
			sessionStorage && sessionStorage.setItem("detailPanelShow", "true");
		}

		new Header({
			config: this._appConfig,
			detailPanel: this._detailPanel,
			container: 'header'
		});
	}
	async _addWidgets() {
		// Add esri widgets to the app (legend, home etc)
		addMapComponents({
			view: this.view,
			config: this._appConfig,
			portal: this.base.portal
		});

		this._setupFeatureSearch();
	}
	async _setupFeatureSearch() {
		// Create the panel that contains the slider

		const RefineResults = await import("./components/RefineResults");
		if (!RefineResults) {
			return;
		}
		const container = document.getElementById("distanceOptions");

		if (this._appConfig?.sliderRange?.default && !isNaN(this._appConfig?.sliderRange?.default)) {
			this._appConfig.sliderRange.default = this._appConfig.sliderRange.default;
		}

		const refineResultsPanel = new RefineResults.default({
			config: this._appConfig,
			container
		});

		this._handles.add(init(this._appConfig, ["sliderRange", "searchUnits", "precision", "inputsEnabled"], (value, oldValue, propertyName) => {
			refineResultsPanel.updateSliderProps(propertyName, value);
		}), "configuration");

		refineResultsPanel.watch("value", (value) => {
			this._appConfig.sliderRange.default = value;

			this.lookupResults && this.lookupResults.clearResults();
			if (this._searchFeature) {
				this._generateSearchResults();
			}
			this._updateUrlParam();
		});


		const lookupGraphics = new LookupGraphics({
			view: this.view,
			config: this._appConfig
		});
		this._handles.add(init(this._appConfig, ["drawBuffer", "mapPinLabel", "mapPin"], (value, oldValue, propertyName) => {
			lookupGraphics.updateGraphics(propertyName, value);
		}), "configuration");
		this.lookupResults = new DisplayLookupResults({
			lookupGraphics,
			config: this._appConfig,
			view: this.view,
			mapPanel: this.mapPanel,
			portal: this.base.config.portal,
			container: 'resultsPanel',
			footer: this.footer ? this.footer : null
		});

		this._handles.add(init(this._appConfig, ["lookupLayers", "hideLayers"], async () => {

			// Get configured lookup layers or if none are configured get
			// all the feature layers in the map

			let parsedLayers = this._appConfig.lookupLayers?.layers ? this._appConfig.lookupLayers.layers : null;

			if (!Array.isArray(parsedLayers) || !parsedLayers.length) {
				parsedLayers = null;
			}
			const lookupLayers = await getLookupLayers({
				view: this.view,
				lookupLayers: parsedLayers,
				hideFeaturesOnLoad: this._appConfig.hideLayers
			});

			this.lookupResults.lookupLayers = lookupLayers;
			if (this._results) {
				this._displayResults(this._results);
			}
		}), "configuration")
		this._addSearchWidget();

		// Wait for view model 
		this._handles.add(init(this._appConfig, ["showDirections"], () => {
			if (this._appConfig.showDirections && !this.lookupResults?.directions) {
				this._createDirections();
				if (this._results) {
					// refresh the results to show directions
					this._displayResults(this._results);
				}
			}
		}), "configuration");


		this._cleanUpHandles();
	}
	private async _createDirections() {
		if (this.lookupResults.directions) return;
		const { url } = this.base.config.helperServices.route;
		const Directions = await import('esri/widgets/Directions');
		const container = document.createElement("div");
		container.setAttribute("role", "alertdialog");
		const directions = new Directions.default({
			routeServiceUrl: url,
			container
		});
		// add directions to the view's popup 
		whenDefinedOnce(directions, "viewModel", () => {
			directions.view = this.view;
			directions.viewModel.routeParameters.directionsLengthUnits = this._appConfig.searchUnits;
			directions.viewModel.routeParameters.returnDirections = true;
			directions.viewModel.load().catch((e) => {
				if (e && e.message) {
					console.log("Problem loading directions:", e.message);
				}
			});
		});
		this.lookupResults.directions = directions;
	}
	private _addSearchWidget(): void {

		const container = document.getElementById("search") as HTMLElement;
		const { searchConfiguration, find, findSource } = this._appConfig;
		let sources = searchConfiguration?.sources;
		if (sources) {
			sources.forEach((source) => {
				if (source?.layer?.url) {
					source.layer = new FeatureLayer(source?.layer?.url);
				}
			});
		}
		const searchProperties: esri.widgetsSearchProperties = {
			...{
				view: this.view,
				resultGraphicEnabled: false,
				autoSelect: false,
				popupEnabled: false,
				container: "search"
			}, ...searchConfiguration
		};
		if (searchProperties?.sources?.length > 0) {
			searchProperties.includeDefaultSources = false;
		}

		this.searchWidget = new Search(searchProperties);
		// If there's a find url param search for it when view is done updating once
		if (find) {
			whenFalseOnce(this.view, "updating", () => {

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
				if (!searchConfiguration) {
					this.searchWidget.viewModel.allSources.forEach((source) => {
						source.withinViewEnabled = true;
					});
				}
			}
		});
		// in progress migrate search logic from lookup 
		// to nearby and work on rest of the props
		this.searchWidget.on('search-clear', () => {
			this._cleanUpResults();
			container.classList.remove("hide-search-btn");
			this._clearButton?.classList.add("hide");
			// Remove find url param
			this._updateUrlParam();
			this._searchFeature = null;
		});

		this.searchWidget.on('search-complete', async (results) => {
			this._cleanUpResults();

			if (results.numResults > 0) {
				// Add find url param
				container.classList.add("hide-search-btn");
				this._displayResults(results);
			}
		});
		// Search for location where user clicked on the map 
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
					whenFalseOnce(this.mapPanel, "isMobileView", () => {
						this._getSelectedAccordionItem(results);
					});
				}
			}
			this._clearButton?.classList.remove("hide");
		});
		// add clear search button to map view 
		this._clearButton = document.createElement("button");
		this._clearButton.innerHTML = i18n.tools.clearLocation;
		this._clearButton.classList.add("btn");
		this._clearButton.classList.add("clear-btn");
		this._clearButton.classList.add('hide');
		this._clearButton.classList.add("app-button");
		this._clearButton.addEventListener("click", () => {
			this._clearButton.classList.add("hide");
			this.searchWidget && this.searchWidget.clear();
		});
		this.view.ui.add(this._clearButton, 'manual');

	}
	async _displayResults(results) {
		this._clearButton?.classList.remove("hide");
		const index = results && results.activeSourceIndex ? results.activeSourceIndex : null;
		this._results = results;
		this._updateUrlParam(index);

		// Get search geometry and add address location to the map
		const feature = await getSearchGeometry({
			config: this.base.config,
			view: this.view,
			results
		});
		this._searchFeature = feature;
		this._generateSearchResults();
	}
	_getSelectedAccordionItem(results) {

		if (this.lookupResults.accordion) {
			this.lookupResults.accordion.findAccordionItem(results)
		};
	}
	_performSearch(mapPoint) {
		this.searchWidget.search(mapPoint).then((response: any) => {
			if (response?.numResults < 1) {
				this._displayNoResultsMessage(mapPoint);
			}
			if (response?.numErrors > 0) {
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
		this.lookupResults && this.lookupResults.queryFeatures(location);
	}

	private _cleanUpResults() {
		// Clear the lookup results displayed in the side panel
		this.lookupResults && this.lookupResults.clearResults();
		this._results = null;
		this.view.graphics.removeAll();
		this.mapPanel && this.mapPanel.clearResults();
		if (!this.mapPanel.isMobileView) {
			this.view.popup.autoOpenEnabled = false;
		}
	}

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
				if (this._appConfig.sliderRange?.default) {
					params.set('sliderDistance', this._appConfig.sliderRange.default as any);
				}
				params.set('find', encodeURIComponent(this.searchWidget.searchTerm));
			} else {
				params.delete('find');
				params.delete('findSource');
				params.delete('sliderDistance');
			}
			if (params && params.toString()) {
				window.history.replaceState({}, '', `${location.pathname}?${params}`);
			} else {
				window.history.replaceState({}, '', `${location.pathname}`);
			}
		}
	}
	private _createSharedTheme() {
		// use shared theme colors for header and buttons 
		const sharedTheme = this.base?.portal?.portalProperties?.sharedTheme;
		if (!sharedTheme) {
			return;
		}
		const { header, button } = sharedTheme;
		const styles = [];

		// Build and insert style
		styles.push(header?.background ?
			`.shared-theme #detailPanel svg{color:${header.background};}
			.shared-theme .app-header{background:${header.background};}
			.shared-theme .text-fade:after {
				background: linear-gradient(to left, ${header.background}, 40%, transparent 90%);
			  }
			  html[dir="rtl"] .shared-theme .text-fade:after {
				background: linear-gradient(to right, ${header.background} 40%, transparent 90%);
			  }
			`
			: null);
		styles.push(
			header?.text
				? `.shared-theme .app-header a{color:${header.text};}
				.shared-theme .app-header{color:${header.text};}
				.shared-theme .toolbar-buttons{color:${header.text}}`
				: null
		);
		styles.push(
			button?.background
				? `.shared-theme .esri-icon-close:before, .shared-theme .esri-icon-search:before, 
				.shared-theme .esri-clear-search,.shared-theme .esri-search__submit-button{
					color:${button?.background}
				}
					.shared-theme .app-button:hover, 
					.shared-theme .app-button{
						background:${button?.background};
						border-color:${button?.background};
					} 
					.shared-theme #detailPanel .svg-icon{
						color:${button?.background};
					}`
				: null
		);
		styles.push(
			button?.text
				? `.shared-theme .app-button, .shared-theme .app-button:hover{
					color:${button?.text};
				}`
				: null
		);
		const style = document.createElement('style');
		style.appendChild(document.createTextNode(styles.join('')));
		document.getElementsByTagName('head')[0].appendChild(style);

	}
	handleThemeUpdates() {
		// Check for a preferred color scheme and then
		// monitor updates to that color scheme and the
		// configuration panel updates.
		const { theme, applySharedTheme } = this._appConfig;
		if (theme) {
			const style = document.getElementById("esri-stylesheet") as any;
			style.href = style.href.indexOf("light") !== -1 ? style.href.replace(/light/g, theme) : style.href.replace(/dark/g, theme);
			// add light/dark class
			document.body.classList.add(theme === "light" ? "light" : "dark");

			document.body.classList.remove(theme === "light" ? "dark" : "light");
		}
		applySharedTheme ? document.body.classList.add("shared-theme") : document.body.classList.remove("shared-theme");

	}

	_updateMapVisibility(config) {
		// Hide the map when it is configured to display 
		// without a map option 
		const hide = config.hideMap;
		const hideMapClass = "no-map";
		const mapClassList = document.body.classList;
		hide ? mapClassList.add(hideMapClass) : mapClassList.remove(hideMapClass);
	}
	_cleanUpHandles() {
		// Remove configuration handles after load
		// if the app isn't within the config experience. 
		if (!this._appConfig.withinConfigurationExperience) {
			this._handles.remove("configuration");
		}
	}
}
export = LocationApp;
