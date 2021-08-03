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
import Telemetry, { TelemetryInstance } from "./telemetry/telemetry";
import Alert from ".//components/Alert";

import ApplicationBase from 'TemplatesCommonLib/baseClasses/ApplicationBase';
import Search from 'esri/widgets/Search';
import Graphic from 'esri/Graphic';
import Handles from 'esri/core/Handles';

import { getLookupLayers, getSearchGeometry } from './utilites/lookupLayerUtils';

import { addMapComponents } from './utilites/esriWidgetUtils';
import { whenTrue, whenDefinedOnce, whenFalseOnce, init, watch, when, whenTrueOnce, once } from 'esri/core/watchUtils';
import DisplayLookupResults from './components/DisplayLookupResults';
import Header from './components/Header';
import Footer from './components/Footer';
import MapPanel from './components/MapPanel';


import esri = __esri;
const CSS = {
	loading: 'configurable-application--loading'
};

import { setPageLocale, setPageDirection } from 'TemplatesCommonLib/baseClasses/support/domHelper';
import ConfigurationSettings from "./ConfigurationSettings";
import DetailPanel from './components/DetailPanel';
import LookupGraphics from './components/LookupGraphics';
import FeatureLayer from 'esri/layers/FeatureLayer';
import { eachAlways } from "esri/core/promiseUtils";
import { fromJSON } from "esri/geometry/support/jsonUtils";
import FilterPanel from "./components/FilterPanel";
import ElevationLayer from "esri/layers/ElevationLayer";
import Point from "esri/geometry/Point";



class LocationApp {
	_appConfig: ConfigurationSettings = null;
	telemetry: Telemetry = null;
	searchWidget: Search = null;
	view: esri.MapView;
	mapPanel: MapPanel = null;
	_detailPanel: DetailPanel = null;
	_mapButton: HTMLCalciteButtonElement = null;
	footer: Footer = null;
	_handles: Handles = new Handles();
	_searchFeature: Graphic;
	_defaultViewRotation: number = 0;
	_results: Graphic[] = null;
	_filterPanel: FilterPanel = null;
	// DisplayLookupResults is the component that handles displaying the popup content
	// using the Feature widget for the features that match the lookup search requirements
	lookupResults: DisplayLookupResults;
	//----------------------------------
	//  ApplicationBase
	//----------------------------------
	base: ApplicationBase = null;
	_telemetry: TelemetryInstance = null;
	page: any = null;
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

		const { config, results } = base;

		config.helperServices = { ...base.portal.helperServices };

		const { webMapItems } = results;

		// create and insert the shared theme styles 
		this._appConfig = new ConfigurationSettings(config);
		this._createSharedTheme();

		this._handleTelemetry();
		this._handles.add([init(this._appConfig, "enableBufferSearch", () => {
			this._appConfig.enableBufferSearch && !this._appConfig.singleLocationPolygons ? document.body.classList.add("buffer") : document.body.classList.remove("buffer");
		}), init(this._appConfig, ["theme", "applySharedTheme"], () => {
			this.handleThemeUpdates();
		}), init(this._appConfig, ["coverPage"], (newValue, oldValue, propertyName) => {
			this._createPage();
		}), init(this._appConfig, "panelSize", (newValue, oldValue, propertyName) => {
			// update panel size 
			const { panelSize } = this._appConfig;
			const small = "column-6";
			const medium = "column-10";
			const large = "column-12";
			const nodes = document.querySelectorAll(`.size-panel`);
			nodes.forEach(node => {
				node.classList.remove(small, medium, large);
				if (panelSize === "s") {
					node.classList.add(small);
				} else if (panelSize === "m") {
					node.classList.add(medium);
				} else {
					node.classList.add(large);
				}
			});
		})], "configuration");

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
			console.error("Could not load an item to display");
			// show error page 
			document.location.href = `../../shared/unavailable/index.html?appid=${this.base.config?.appid ?? null}`;
			return;
		}
		const { title } = this._appConfig;
		this._appConfig.title = title || item.title || null;
		this._createMap(item);
	}

	private _handleCustomCSS(): void {
		const customCSSStyleSheet = document.getElementById("customCSS");

		if (customCSSStyleSheet) {
			customCSSStyleSheet.remove();
		}

		const styles = document.createElement("style");
		styles.id = "customCSS";
		const styleTextNode = document.createTextNode(
			this._appConfig.customCSS
		);
		styles.appendChild(styleTextNode);
		document.head.appendChild(styles);
	}
	async _createMap(item) {

		this.mapPanel = await new MapPanel({
			item,
			config: this._appConfig,
			base: this.base,
			container: 'mapPanel'
		});
		this._handles.add(this.mapPanel.watch("isMobileView", (isMobile) => {
			// enable popup in mobile view 
			this.view.popup.autoOpenEnabled = isMobile;
			(isMobile) ? this.mapPanel?.set("tabindex", "-1") : this.mapPanel?.set("tabindex", "0");
		}), "popupvis");
		const panelHandle = this.mapPanel.watch('view', () => {
			panelHandle.remove();
			this.view = this.mapPanel.view;
			this._defaultViewRotation = this.view.rotation || 0;

			// watch properties that determine how results are displayed
			this._handles.add([init(this._appConfig, ["searchUnits", "includeDistance", "interactiveResults", "groupResultsByLayer"], () => {
				if (this._results) {
					const copyResults = this._results;
					this._cleanUpResults();
					this._displayResults(copyResults);
				}
			}), init(this._appConfig, "extentSelectorConfig, extentSelector", () => {
				if (this._appConfig?.extentSelectorConfig && this._appConfig?.extentSelector) {
					const { constraints } = this._appConfig.extentSelectorConfig;

					const geometry = constraints?.geometry;
					if (geometry) {
						const extent = fromJSON(geometry);
						if (extent && (extent?.type === "extent" || extent?.type === "polygon")) {
							constraints.geometry = extent;
							this.view.goTo(extent, false).catch(() => { });

							this.searchWidget?.viewModel?.allSources?.forEach((source) => {
								source.filter = {
									geometry: extent
								}
							});

						}
					} else {
						constraints.geometry = null;
						this.searchWidget?.viewModel?.allSources?.forEach((source) => {
							source.filter = null;
						});
					}
					this.view.constraints = constraints;
					this._setMapViewRotation();
				} else {
					if (this.view) {
						this.view.rotation = this._defaultViewRotation;
						this.view.constraints.geometry = null;
						this.view.constraints.minZoom = -1;
						this.view.constraints.maxZoom = -1;
						this.view.constraints.minScale = 0;
						this.view.constraints.maxScale = 0;
					}

					this?.mapPanel?.resetExtent();
				}
			}),], "configuration");


			this.view.popup.autoOpenEnabled = false;
			this.view.popup.actions = null;
			document.body.classList.remove(CSS.loading);

			this._handles.add(init(this._appConfig, "customCSS", (newValue, oldValue, propertyName) => {
				this._handleCustomCSS();
			}));

			this.view.when(() => {
				this._addWidgets();
				this._addHeader(item);
				this._addFooter();
			});
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

		// Add info button 
		this._detailPanel = new DetailPanel({
			config: this._appConfig,
			view: this.view,
			mapPanel: this.mapPanel,
			container: document.getElementById('detailPanel')
		});
		init(this._appConfig, "showIntroduction", (value) => {
			if (!this._detailPanel) { return; }
			value ? this._detailPanel.showPanel() : this._detailPanel.hidePanel();
		});

		new Header({
			config: this._appConfig,
			sharedTheme: this.base?.portal?.portalProperties?.sharedTheme,
			detailPanel: this._detailPanel,
			container: 'header'
		});
	}
	private async _createPage() {
		const Page = await import("./components/Page/Page");
		const { coverPage, coverPageConfig } = this._appConfig;
		const appContainer = document.getElementById("appMain");

		if (coverPage && !this.page) {
			const container = document.createElement("div");
			const props = { portal: this.base.portal, container, ...coverPageConfig }
			this.page = new Page.default(props);
			appContainer.classList.add("hide");
			// watch for config updates 
			this._handles.add(watch(this._appConfig, "coverPageConfig", () => {
				if (!this.page) return;
				const { coverPageConfig } = this._appConfig
				const keys = Object.keys(coverPageConfig);
				keys.forEach(key => {
					this.page.set(key, coverPageConfig[key]);
				})
			}), "page");
		} else {
			appContainer?.classList.remove("hide");
			this._handles.remove("page");
			this.page?.destroy();
			this.page = null;
		}

	}
	private async _addWidgets() {
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
		const modules = await eachAlways([import("./components/RefineResults"), import("./components/SearchPanel")]);
		const [RefineResults, SearchPanel] = modules.map((module) => module.value);
		const { enableBufferSearch } = this._appConfig;
		if (!RefineResults && !SearchPanel) {
			return;
		}
		const container = document.getElementById("distanceOptions");
		// Get url param if applied 
		if (this?.base?.config?.sliderDistance && this._appConfig?.enableBufferSearch) {
			this._appConfig.sliderRange.default = this.base.config.sliderDistance;
		}

		this._filterPanel = new FilterPanel({
			config: this._appConfig,
			view: this.view,
			container: document.getElementById('filterPanel')
		});

		const refineResultsPanel = new RefineResults.default({
			config: this._appConfig,
			container
		});
		const searchPanel = new SearchPanel.default({
			config: this._appConfig,
			view: this.view,
			filterPanel: this._filterPanel,
			container: document.getElementById("searchPanel")
		});
		when(searchPanel, "state", () => {
			if (searchPanel?.state !== "ready") { return; }
			this.searchWidget = searchPanel.searchWidget;

			this.searchWidget.on('search-clear', () => {
				this._cleanUpResults();
				container.classList.remove("hide-search-btn");
				if (this._appConfig.enableBufferSearch) {
					this._mapButton?.classList.add("hide");
				}
				// Remove find url param
				this._updateUrlParam();
				this._searchFeature = null;
			});
			this.searchWidget.on('search-complete', async (results) => {
				// find url param
				this._cleanUpResults();
				if (results.numResults > 0) {
					// Add find url param
					container.classList.add("hide-search-btn");
					this._displayResults(results);

				} else {
					console.log("No results found");
				}
			});
			this.view.on('click', async (e) => {
				this._searchByGeometry(e.mapPoint);
			});
			this._handles.add(init(this._appConfig, "enableBufferSearch", () => {
				this._addMapButton();
			}), "configuration");
			const { select, level, center, enableBufferSearch, find } = this._appConfig;
			if (select && level && center) {
				const location = center.split(",");
				if (location?.length > 1) {
					const point = new Point({ longitude: location[0], latitude: location[1] })
					enableBufferSearch ? this._searchByGeometry(point) : this._searchThisExtent(point);
				}
			} else if (find && !enableBufferSearch) {
				this._hideExtentSearchButton()
			}
		})
		// get the search widget from the panel 
		whenDefinedOnce(this._filterPanel, "filterList", () => {
			// Apply filter expressions from URL params 
			if (this?.base?.config?.filter) {
				const filters = this.base.config.filter?.split(";");
				filters?.forEach(filter => {
					const expression = filter.split(",");
					const expressions = this._filterPanel?.filterList?.layerExpressions;
					expressions?.forEach(exp => {
						const id = expression[0] || null;
						const expressionId = expression[1] !== null ? expression[1] : null;
						if (id === exp.id) {
							exp.expressions?.forEach(le => {
								const e = le as any;
								if (e.id?.toString() === expressionId?.toString()) {
									le.checked = true;
								}
							})
						}
					});
				});
			}

			this._handles.add(this._filterPanel?.filterList.watch("output", (output) => {
				const { id } = output;

				const expression = this._filterPanel.addDefaultExpression(output);

				this._cleanUpResults();
				this._updateUrlParam();
				const layer = this.view.map.findLayerById(id) as FeatureLayer;
				if (layer) {
					layer.definitionExpression = expression;
					if (!this._searchFeature) return;
					this._generateSearchResults();
				}

			}));
			this._filterPanel?.filterList.on("filterListReset", (resetLayerExpressions) => {
				resetLayerExpressions?.forEach(layerExpression => {
					const { id } = layerExpression;
					const layer = this?.view?.map.findLayerById(id) as FeatureLayer;
					if (layer) {
						// Check for default layer expression
						layer.definitionExpression = this._filterPanel.findDefaultExpression(layerExpression);
						this._cleanUpResults();
						this._generateSearchResults();
						this._updateUrlParam();
					}
				});

			});
		})


		this._handles.add(init(this._appConfig, ["enableFilter", "filterConfig", "theme", "sliderRange", "searchUnits", "precision", "inputsEnabled"], (value, oldValue, propertyName) => {
			if (propertyName === "enableFilter" || propertyName === "theme" || propertyName === "filterConfig") {
				searchPanel?.updateFilterProps(propertyName, value);
			} else {
				refineResultsPanel.updateSliderProps(propertyName, value);
			}

		}), "configuration");


		refineResultsPanel.watch("value", (value) => {
			this._cleanUpResults();
			this._appConfig.sliderRange.default = value;
			if (!this._searchFeature) return;
			this._generateSearchResults();
			this._updateUrlParam();
		});


		const lookupGraphics = new LookupGraphics({
			view: this.view,
			config: this._appConfig
		});
		this._handles.add(init(this._appConfig, ["drawBuffer", "mapPinLabelSize", "mapPinSize", "mapPinIcon", "mapPinLabel", "mapPinLabelColor", "mapPinColor", "mapPin"], (value, oldValue, propertyName) => {
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

			let updatedLayers = [];
			if (!Array.isArray(parsedLayers) || !parsedLayers.length) {
				updatedLayers = parsedLayers = null;

			} else {

				// Remove any dups from LookupLayers

				updatedLayers = parsedLayers?.filter((thing, index) => {
					const _thing = JSON.stringify(thing);
					return index === parsedLayers.findIndex(obj => {
						return JSON.stringify(obj) === _thing;
					});
				});

			}
			const lookupLayers = await getLookupLayers({
				view: this.view,
				lookupLayers: updatedLayers,
				hideFeaturesOnLoad: this._appConfig.hideLayers
			});

			this.lookupResults.lookupLayers = lookupLayers;
			if (this._results) {
				this._displayResults(this._results);
			}
		}), "configuration")

		// Wait for view model 
		this._handles.add([init(this._appConfig, "showDirections,useDirectionsApp", () => {
			if (this._appConfig.showDirections && !this.lookupResults?.directions && !this._appConfig.useDirectionsApp) {
				this._createDirections();
				if (this._results) {
					// refresh the results to show directions
					this._displayResults(this._results);
				}
			}
		}), init(this._appConfig, "shareSelected", () => {
			if (this._appConfig.shareSelected) {
				if (this._results) {
					// refresh the results to show directions
					this._displayResults(this._results);
				}
			}
		}), init(this._appConfig, "showElevationProfile", (value) => {
			if (!value && this?.lookupResults?.elevationProfile) {
				if (this.lookupResults.elevationProfile?.input) {
					this.lookupResults.elevationProfile.input = null;
				}
				this.lookupResults.elevationProfile = null;
			} else {
				this._createElevationProfile();
			}
			if (this._results) {
				// refresh the results to show elevation
				this._displayResults(this._results);
			}
		})], "configuration");

		this._cleanUpHandles();
	}
	private async _createDirections() {
		if (this.lookupResults.directions && !this.base.config.useDirectionsApp) return;
		const portalItem: esri.PortalItem = this.base?.results?.applicationItem?.value;

		const appProxies = portalItem?.applicationProxies ? portalItem.applicationProxies : null;
		appProxies && appProxies.forEach((proxy) => {
			const { url } = this.base.config.helperServices.route;
			if (proxy.sourceUrl === url) {
				this.base.config.helperServices.route.url = proxy.proxyUrl;
			}
		});

		const { url } = this.base.config.helperServices.route;
		const Directions = await import('esri/widgets/Directions');
		const container = document.createElement("div");
		container.setAttribute("role", "dialog");
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

	private async _createElevationProfile() {

		if (!this.lookupResults.elevationProfile && this._appConfig.showElevationProfile) {
			const ElevationProfile = await import('esri/widgets/ElevationProfile');
			const epWidget = new ElevationProfile.default({
				view: this.view,
				visibleElements: {
					clearButton: false,
					sketchButton: false,
					selectButton: false
				}
			});
			this.lookupResults.elevationProfile = epWidget;
		}
		if (this?.view?.map?.ground && this._appConfig.showElevationProfile) {
			if (this.view.map.ground?.layers?.length === 0) {
				const url = this.base?.config?.helperServices?.defaultElevationLayers?.length > 0 && this.base?.config?.helperServices?.defaultElevationLayers[0]?.url ? this.base?.config?.helperServices?.defaultElevationLayers[0]?.url : "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer";
				this.view.map.ground.layers.add(new ElevationLayer({
					url
				}));
			}
		}


	}

	async _displayResults(results) {
		if (this._appConfig.enableBufferSearch) {
			this._mapButton?.classList.remove("hide");
		}

		this._results = results;

		// Get search geometry and add address location to the map
		const searchProps = {
			config: this.base.config,
			view: this.view,
			results
		}
		const feature = await getSearchGeometry(searchProps);

		this._searchFeature = feature;

		this._generateSearchResults();
	}
	_getSelectedAccordionItem(results) {
		if (this.lookupResults.accordion) {
			this.lookupResults.accordion.findAccordionItem(results)
		};
	}

	private async _generateSearchResults() {
		const location = this._searchFeature ? this._searchFeature : null;
		this._detailPanel?.hidePanel();

		this.lookupResults?.queryFeatures(location);
		this._updateUrlParam();
	}

	private _cleanUpResults() {
		// Clear the lookup results displayed in the side panel
		this.lookupResults?.clearResults();
		this._results = null;
		this.mapPanel?.clearResults();
		if (!this.mapPanel.isMobileView) {
			this.view.popup.autoOpenEnabled = false;
		}
	}

	private _updateUrlParam() {
		if ('URLSearchParams' in window) {
			const params = new URLSearchParams(document.location.search);
			let index = 0;

			this?.searchWidget?.results?.some((result) => {
				if (result?.results?.length > 0) {
					index = result.sourceIndex;
					return true;
				} else {
					return false;
				}
			});
			// Create and add filter expressions to the url 
			const expressions = [];
			this._filterPanel?.filterList?.layerExpressions?.forEach(expression => {
				expression?.expressions?.forEach((layerExp: any) => {
					if (layerExp?.checked) {
						expressions.push(`${expression.id},${layerExp?.id}`);
					}
				});
			});
			// Apply Filter params 
			if (expressions?.length > 0) {
				params.set("filter", (expressions.join(";")));
			} else {
				params.delete("filter");
			}

			const searchTerm = this?.searchWidget?.searchTerm ? encodeURIComponent(this.searchWidget.searchTerm) : null;

			if (searchTerm) {
				if (index && (index > 0 || index === 0)) {
					params.set('findSource', index.toString());
				} else {
					params.delete('findSource');
				}
				params.set('find', encodeURIComponent(this.searchWidget.searchTerm));
			} else {
				params.delete('find');
				params.delete('findSource');
			}
			// Apply slider filter 
			if (this._appConfig?.sliderRange?.default && this._appConfig?.enableBufferSearch) {
				params.set('sliderDistance', this._appConfig.sliderRange.default as any);
			} else {
				params.delete('sliderDistance');
			}
			if (params && params.toString()) {
				window.history.replaceState({}, '', `${location.pathname}?${params}`);
			} else {
				window.history.replaceState({}, '', `${location.pathname}`);
			}
		}
	}
	private _hasTheme() {
		const sharedTheme = this.base?.portal?.portalProperties?.sharedTheme;
		return (!sharedTheme) ? false : true;
	}
	private _createSharedTheme() {
		// use shared theme colors for header and buttons 
		const sharedTheme = this.base?.portal?.portalProperties?.sharedTheme;
		if (!sharedTheme) {
			return;
		}
		const { header, button } = sharedTheme;
		const { theme, headerColor, enableHeaderColor } = this._appConfig;

		const styles = [];

		// Build and insert style
		styles.push(header?.background && header?.background !== "no-color" ?
			`.shared-theme #detailPanel svg{color:${header.background};}
			.shared-theme .app-header{background:${header.background};}
			`
			: null);
		styles.push(
			header?.text && header?.text !== "no-color"
				? `.shared-theme #infoButton{--calcite-ui-foreground-1:${headerColor && enableHeaderColor ? headerColor : header.text};}
				.shared-theme .app-header a{color:${header.text};}
				.shared-theme .app-header{color:${header.text};}
				.shared-theme #header > div > calcite-button > calcite-icon {fill:${header.text};color:${header.text}}`
				: null
		);
		styles.push(
			button?.text && button?.text !== "no-color"
				? `	[theme=${theme}] .shared-theme calcite-button,:root .shared-theme calcite-button{
					--calcite-ui-foreground-1:${button?.text};
					--calcite-ui-brand-press:${button?.background}}
				`
				: null
		);
		styles.push(
			button?.background && button?.background !== "no-color"
				? `.shared-theme #filterButton{--calcite-ui-text-3:${button.background};--calcite-ui-brand-press:${button.background}}
				.shared-theme #filterButton:hover{--calcite-ui-text-1:${button.background};}
				.shared-theme .esri-icon-close:before, .shared-theme .esri-icon-search:before,
				.shared-theme .esri-clear-search,.shared-theme .esri-search__submit-button{
					color:${button?.background}
				}
				.shared-theme #detailPanel .svg-icon{
						color:${button?.background};
				}
				 [theme=${theme}] .shared-theme calcite-button,:root .shared-theme calcite-button{
					--calcite-ui-brand:${button.background};
				  	--calcite-ui-brand-hover:${button.background}};
				`
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
			document.body.classList.add(theme === "light" ? "calcite-theme-light" : "calcite-theme-dark");
			document.body.classList.add(theme === "light" ? "light" : "dark");

			document.body.classList.remove(theme === "light" ? "dark" : "light");
			document.body.classList.remove(theme === "light" ? "calcite-theme-dark" : "calcite-theme-light");

		}
		if (applySharedTheme && this._hasTheme()) {
			document.body.classList.add("shared-theme");
		} else {
			document.body.classList.remove("shared-theme");
		}
	}

	async createTelemetry() {
		// add alert to container
		const { portal } = this.base;
		const appName = this.base.config?.telemetry?.name;
		this._telemetry = await Telemetry.init({ portal, config: this._appConfig, appName });
		this._telemetry?.logPageView(`${window.location.pathname}${window.location.search}`);
	}
	private async _searchByGeometry(point) {
		const { enableBufferSearch } = this._appConfig;
		if (this.lookupResults.empty && enableBufferSearch) {
			this.searchWidget.search(point);
			this._searchFeature = new Graphic({ geometry: point });

		} else {
			// Results exist and user is clicking 
			// on the map point. We'll find the feature
			// then show the result in list  
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
		if (this._appConfig.enableBufferSearch) {
			this._mapButton?.classList.remove("hide");
		}

	}
	private _addMapButton() {
		// add clear search button to map view 
		if (this._mapButton) {
			this.view.ui.remove(this._mapButton);
			this._mapButton = null;
		}
		this._mapButton = document.createElement("calcite-button");
		this._mapButton.id = "mapSearchButton";
		this._mapButton.color = "blue";
		this._mapButton.classList.add("clear-btn");
		if (this._appConfig.enableBufferSearch) {
			this._mapButton.innerHTML = this.base.config.appBundle.tools.clearLocation;
			this._mapButton.classList.add('hide');
			this._mapButton.addEventListener("click", () => {
				this._mapButton.classList.add("hide");
				this.searchWidget && this.searchWidget.clear();
			});

		} else {
			// add a "search here button"
			this._mapButton.innerHTML = this.base.config.appBundle.tools.searchThisLocation;
			this._mapButton.addEventListener("click", () => {
				this._searchThisExtent(this?.view?.extent?.center);
			});

		}
		this.view.ui.add(this._mapButton, 'manual');
	}
	private _searchThisExtent(point) {
		// kick off new search using this extent
		this.searchWidget && this.searchWidget.clear();
		const searchHandle = this.searchWidget.on("search-clear", () => {
			searchHandle.remove();
			this._mapButton.classList.remove('hide');
		});
		this.searchWidget.search(point);
		this._searchFeature = new Graphic({ geometry: point });
		// hide the button until the extent changes 
		this._hideExtentSearchButton();

	}
	private _hideExtentSearchButton() {
		if (this?._appConfig?.enableBufferSearch) return;

		once(this.view, ["navigating", "interacting", "scale"], () => {
			this?._mapButton?.classList.remove("hide");
		});
		this?._mapButton?.classList.add("hide");
	}
	private _handleTelemetry() {
		// Wait until both are defined 
		eachAlways([whenDefinedOnce(this._appConfig, "googleAnalytics"),
		whenDefinedOnce(this._appConfig, "googleAnalyticsKey"),
		whenDefinedOnce(this._appConfig, "googleAnalyticsConsentMsg"),
		whenDefinedOnce(this._appConfig, "googleAnalyticsConsent")]

		).then(() => {

			const alertContainer = document.createElement("container");
			document.body.appendChild(alertContainer);
			new Alert({ config: this._appConfig, container: alertContainer });

			this.createTelemetry();
			this._handles.add([
				watch(this._appConfig, ["googleAnalytics", "googleAnalyticsConsent", "googleAnalyticsConsentMsg", "googleAnalyticsKey"], (newValue, oldValue, propertyName) => {
					this.createTelemetry();
				})
			]);

		})
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
	_setMapViewRotation() {

		const view = this.view;
		const mapRotation = this._appConfig?.extentSelectorConfig?.mapRotation ?? this._defaultViewRotation ?? null;
		if (!view?.constraints?.rotationEnabled) { // if rotation is disabled
			view.constraints.rotationEnabled = true; // set rotation to enabled
			view.rotation = mapRotation // set rotation value
			view.constraints.rotationEnabled = false; // set rotation back to disabled
		} else {
			if (view)
				view.rotation = mapRotation;
		}
	}
}
export = LocationApp;
