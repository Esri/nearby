
import esri = __esri;
import ConfigurationSettings from '../ConfigurationSettings';
import { init, watch, whenTrue, whenTrueOnce } from "esri/core/watchUtils";
import { eachAlways } from "esri/core/promiseUtils";
import Handles from 'esri/core/Handles';
import Expand from "esri/widgets/Expand";
import { getBasemaps, resetBasemapsInToggle } from 'TemplatesCommonLib/functionality/basemapToggle';


interface esriWidgetProps {
	config: ConfigurationSettings;
	view: esri.MapView;
	portal: esri.Portal;
	propertyName?: string;
}
export interface esriMoveWidgetProps {
	view: esri.MapView;
	className: string;
	mobile?: boolean;
	config: ConfigurationSettings;
}
export async function addMapComponents(props: esriWidgetProps): Promise<void> {
	const { config } = props;
	this._handles = new Handles();

	this._handles.add([init(config, ["home", "homePosition"], (newValue, oldValue, propertyName) => {
		props.propertyName = propertyName;
		addHome(props);
	}),
	init(config, "bookmarks, bookmarksPosition", (newValue, oldValue, propertyName) => {
		props.propertyName = propertyName
		addBookmarks(props);
	}),
	init(config, ["mapZoom", "mapZoomPosition"], (newValue, oldValue, propertyName) => {
		props.propertyName = propertyName;
		addZoom(props);
	}),
	init(config, ["screenshot", "screenshotPosition"], (newValue, oldValue, propertyName) => {
		props.propertyName = propertyName;
		addScreenshot(props);
	}),
	init(config, ["legend", "legendConfig", "legendPosition", "legendOpenAtStart"], (newValue, oldValue, propertyName) => {
		props.propertyName = propertyName;
		addLegend(props);
	}),
	init(config, ["scalebar", "scalebarPosition"], (newValue, oldValue, propertyName) => {
		props.propertyName = propertyName;
		addScaleBar(props);
	}),
	init(config, ["nextBasemap", "basemapTogglePosition", "basemapSelector", "basemapToggle"], (newValue, oldValue, propertyName) => {
		props.propertyName = propertyName;
		addBasemap(props);
	})], "configuration");
	if (!config.withinConfigurationExperience) {
		this._handles.remove("configuration");
	}
}

export async function addBasemap(props: esriWidgetProps) {

	const { view, config, propertyName } = props;
	const { basemapTogglePosition, basemapToggle } = config;
	const node = view.ui.find("basemapWidget") as __esri.BasemapToggle;
	const { originalBasemap, nextBasemap } = await getBasemaps(props);
	// If basemapToggle isn't enabled remove the widget if it exists and exit 
	if (!basemapToggle) {
		if (node) {
			view.ui.remove(node);
			node.destroy();
		}
		return;
	}
	const BasemapToggle = await import("esri/widgets/BasemapToggle");
	if (!BasemapToggle) return;
	// Move the basemap toggle widget if it exists 
	if (propertyName === "basemapTogglePosition" && node) {
		view.ui.move(node, basemapTogglePosition);
	}
	// Add the basemap toggle widget if its enabled or if a different basemap was 
	// specified
	if (propertyName === "basemapToggle" && !node) {

		const bmToggle = new BasemapToggle.default({
			view,
			nextBasemap,
			id: "basemapWidget"
		});
		resetBasemapsInToggle(bmToggle, originalBasemap, nextBasemap);
		view.ui.add(bmToggle, basemapTogglePosition);
	} else if (node && (propertyName === "nextBasemap" || propertyName === "basemapSelector")) {
		if (propertyName === "nextBasemap" || propertyName === "basemapSelector") {
			resetBasemapsInToggle(node, originalBasemap, nextBasemap);
		}
	}
}
export async function addBookmarks(props: esriWidgetProps) {

	const { view, config, propertyName } = props;
	const { bookmarks, bookmarksPosition } = config;

	const node = view.ui.find("bookmarksExpand") as __esri.Expand;
	// check to see if the web map has bookmarks 
	const map = view.map as __esri.WebMap;
	const mapContainsBookmarks = map?.bookmarks?.length > 0 ? true : false;
	if (!bookmarks || !mapContainsBookmarks) {
		if (node) view.ui.remove(node);
		return;
	}

	const Bookmarks = await import("esri/widgets/Bookmarks");
	// move the node if it exists 
	const group = _getPosition(bookmarksPosition);
	if (propertyName === "bookmarksPosition" && node) {
		view.ui.move(node, bookmarksPosition);
		node.group = group;
	} else if (propertyName === "bookmarks") {
		const content = new Bookmarks.default({
			view
		});

		const bookmarksExpand = new Expand({
			id: "bookmarksExpand",
			content,
			group,
			mode: "floating",
			view
		});
		content.watch("label", () => {
			const tip = `${config.appBundle.toggle} ${content.label}`;
			if (bookmarksExpand) {
				bookmarksExpand.collapseTooltip = tip;
				bookmarksExpand.expandTooltip = tip;
			}
		});
		view.ui.add(bookmarksExpand, bookmarksPosition);
	}
}
export async function addHome(props: esriWidgetProps) {

	const { view, config, propertyName } = props;
	const { home, homePosition } = config;
	const Home = await import('esri/widgets/Home');
	const node = _findNode("esri-home");

	if (!home) {
		if (node) view.ui.remove(node);
		return;
	}
	if (node && !home) view.ui.remove(node);

	if (propertyName === "homePosition" && node) {
		view.ui.move(node, homePosition);
	} else if (propertyName === "home") {
		view.ui.add(new Home.default({ view }), homePosition);
	}
}
export async function addLegend(props: esriWidgetProps) {

	const { view, config, propertyName } = props;
	const { legend, legendPosition, legendOpenAtStart, legendConfig } = config;

	const modules = await eachAlways([import("esri/widgets/Legend"), import("esri/widgets/Expand")]);
	const [Legend, Expand] = modules.map((module) => module.value);
	const node = view.ui.find("legendExpand") as __esri.Expand;

	if (!legend) {
		if (node) view.ui.remove(node);
		return;
	}
	// move the node if it exists 
	if (propertyName === "legendPosition" && node) {
		view.ui.move(node, legendPosition);
	} else if (propertyName === "legend") {
		const content = new Legend.default({
			style: legendConfig.style,
			view
		});

		const legendExpand = new Expand.default({
			id: "legendExpand",
			content,
			mode: "floating",
			group: legendPosition,

			view
		});
		watch(content, "label", () => {
			const label = `${config.appBundle.toggle} ${content.label}`;
			legendExpand.collapseTooltip = label;
			legendExpand.expandTooltip = label;
		});
		view.ui.add(legendExpand, legendPosition);
	} else if (propertyName === "legendOpenAtStart" && node) {
		node.expanded = legendOpenAtStart;
	} else if (propertyName === "legendConfig" && node) {
		const l = node.content as __esri.Legend;
		if (legendConfig?.style) {
			l.style = legendConfig.style;
		}
	}
}
export async function addScaleBar(props: esriWidgetProps) {

	const { view, portal, config, propertyName } = props;
	const { scalebar, scalebarPosition } = config;
	const ScaleBar = await import("esri/widgets/ScaleBar");
	const node = _findNode("esri-scale-bar");
	if (!scalebar) {
		if (node) view.ui.remove(node);
		return;
	}
	// move the node if it exists 
	if (propertyName === "scalebarPosition" && node) {
		view.ui.move(node, scalebarPosition);
	} else if (propertyName === "scalebar") {
		view.ui.add(new ScaleBar.default({
			view,
			unit: portal?.units === "metric" ? portal?.units : "non-metric"
		}), scalebarPosition);
	}
}
export async function addScreenshot(props: esriWidgetProps) {

	const { view, config, propertyName } = props;
	const { screenshot, screenshotPosition, legend } = config;

	const Screenshot = await import("Components/Screenshot/Screenshot");
	const node = view.ui.find("screenshotExpand") as __esri.Expand;
	if (!screenshot) {
		if (node) view.ui.remove(node);
		return;
	}

	// move the node if it exists 
	if (propertyName === "screenshotPosition" && node) {
		view.ui.move(node, screenshotPosition);
	} else if (propertyName === "screenshot") {
		const content = new Screenshot.default({
			view,
			enableLegendOption: legend ? true : false,
			enablePopupOption: false,
			includeLayoutOption: true,
			custom: {
				label: config.appBundle.tools.screenshotResults,
				element: document.getElementById("offscreenResults")
			},
			includePopupInScreenshot: false,
			includeCustomInScreenshot: false,
			includeLegendInScreenshot: false
		});


		const screenshotExpand = new Expand({
			id: "screenshotExpand",
			content,
			mode: "floating",
			view
		});
		init(content, "label", () => {
			screenshotExpand.collapseTooltip = `${config.appBundle.toggle} ${content.label}`;
			screenshotExpand.expandTooltip = `${config.appBundle.toggle} ${content.label}`;
		})
		view.ui.add(screenshotExpand, screenshotPosition);
		whenTrueOnce(screenshotExpand, "expanded", () => {
			const sw = screenshotExpand.content as any;
			if (!sw) return;
			whenTrue(sw, "screenshotModeIsActive", () => {
				// Copy the results to the offscreen widget
				if (sw.includeCustomInScreenshot) {

					const container = sw?.custom?.element;
					if (container) {
						const resultContainer = document.getElementById("feature-container");
						const features = resultContainer.getElementsByClassName("feature-group");
						container.innerHTML = null;
						for (var i = 0; i < features.length; i++) {
							const feature = features[i]?.cloneNode(true);
							container.append(feature);

						}
					}

				}
			});


		});
	}
}
export async function addZoom(props: esriWidgetProps) {
	const { view, config, propertyName } = props;
	const { mapZoom, mapZoomPosition } = config;

	const Zoom = await import("esri/widgets/Zoom");
	const node = _findNode("esri-zoom");
	if (!mapZoom) {
		if (node) view.ui.remove(node);
		return;
	}
	if (node && !mapZoom) view.ui.remove(node);

	if (propertyName === "mapZoomPosition" && node) {
		view.ui.move(node, mapZoomPosition);
	} else if (propertyName === "mapZoom" && !node) {
		view.ui.add(new Zoom.default({ view }), mapZoomPosition);
	}
}

async function _getBasemap(id: string) {
	const Basemap = await import("esri/Basemap");
	if (!Basemap) { return; }

	let basemap = Basemap.default.fromId(id);

	if (!basemap) {
		basemap = await new Basemap.default({
			portalItem: {
				id
			}
		}).loadAll();
	}
	return basemap as any;
}

function _findNode(className: string): HTMLElement {

	const mainNodes = document.getElementsByClassName(className);
	let node = null;
	for (let j = 0; j < mainNodes.length; j++) {
		node = mainNodes[j] as HTMLElement;
	}
	return node ? node : null;

}
function _getPosition(position) {
	// object or string 
	let groupName = null;
	if (typeof position === "string") {
		groupName = position
	} else if (position?.position) {
		groupName = position.position;
	}
	return groupName;
}