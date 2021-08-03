
import { subclass, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';
import { displayError } from '../utilites/errorUtils';
import { tsx } from 'esri/widgets/support/widget';
import { ApplicationConfig } from 'TemplatesCommonLib/interfaces/applicationBase';
import ApplicationBase from 'TemplatesCommonLib/baseClasses/ApplicationBase';
import { createMapFromItem, createView, getConfigViewProperties } from 'TemplatesCommonLib/baseClasses/support/itemUtils';

import esri = __esri;

const CSS = {
	miniMap: {
		panel: 'mini-map-panel'
	},
	tabletShow: 'tablet-show',
	tabletHide: 'tablet-hide',
	configApp: 'configurable-application__view-container',
	hide: 'hide',
	theme: 'app-header',
	btnOpenMap: 'btn-open-map',
	appButton: 'app-button',

	calciteStyles: {
		leader: 'leader-0',
		trailer: 'trailer-0',
		paddingLeft: 'padding-left-0',
		paddingRight: 'padding-right-0',
		right: 'right',
		panel: 'panel',
	}
};

interface MapPanelProps extends esri.WidgetProperties {
	base: ApplicationBase;
	config: ApplicationConfig;
	item: esri.PortalItem;
	mainMapAccessoryClassName?: string;
	selectedItemTitle?: string;
	isMobileView?: boolean;
}
@subclass('app.MapPanel')
class MapPanel extends (Widget) {
	//--------------------------------------------------------------------------
	//
	//  Properties
	//
	//--------------------------------------------------------------------------

	@property() base: ApplicationBase;
	@property() item: __esri.PortalItem;
	@property() config: ApplicationConfig;
	@property() view: esri.MapView;
	@property() mainMapAccessoryClassName: string = 'main-map-content';

	@property() selectedItemTitle: string = null;

	@property()
	isMobileView: boolean = false;


	@property()
	message: string;

	//--------------------------------------------------------------------------
	//
	// Variables
	//
	//--------------------------------------------------------------------------
	_initialExtent: esri.Extent;

	//--------------------------------------------------------------------------
	//
	//  Public Methods
	//
	//--------------------------------------------------------------------------
	constructor(props: MapPanelProps) {
		super(props);
		const { config } = props;
		this.config = config;
	}

	render() {
		const { theme, panelSize } = this.config;
		let themeClass = theme === "dark" ? "calcite-theme-dark" : "calcite-theme-light";
		const allClasses = [
			CSS.calciteStyles.paddingRight,
			CSS.calciteStyles.paddingLeft,
			CSS.calciteStyles.trailer,
			CSS.calciteStyles.leader,
			CSS.calciteStyles.trailer
		];
		let panelClassNum = 14;
		if (panelSize === "s") {
			panelClassNum = 18;
		} else if (panelSize === "l") {
			panelClassNum = 12;
		}

		const mainMapClasses = [`column-${panelClassNum}`];
		const miniMapClasses = [CSS.miniMap.panel, CSS.calciteStyles.panel];
		const mapPositionClasses = this.isMobileView
			? this.classes(...allClasses, ...miniMapClasses)
			: this.classes(...mainMapClasses, ...allClasses);
		const mapTabletClass = this.isMobileView ? this.classes(CSS.tabletShow) : null;
		const alertMessage =
			this.isMobileView && this.message ? (
				<calcite-alert
					class={this.classes(themeClass)}
					icon=""
					auto-dismiss-duration="medium"
					active=""
					scale="m"
					color="blue"
				>
					<div slot="message">{this.message}</div>
				</calcite-alert>
			) : null;
		return (
			<div role="application" class={mapPositionClasses}>
				<div class={this.classes(CSS.configApp)}>
					<div class={mapTabletClass} bind={this} afterCreate={this._createMap} />
				</div>
				{alertMessage}
			</div>
		);
	}

	private async _createMap(container) {
		const portalItem: esri.PortalItem = this.base.results.applicationItem.value;
		const appProxies = portalItem?.applicationProxies ? portalItem.applicationProxies : null;
		const defaultViewProperties = getConfigViewProperties(this.config);
		const components = ["attribution"];
		const mapContainer = {
			container
		};
		const viewProperties = {
			...defaultViewProperties,
			ui: { components },
			...mapContainer
		};

		try {
			const map = (await createMapFromItem({ item: this.item, mapParams: { ground: "world-elevation" }, appProxies })) as esri.WebMap;
			this.view = (await createView({ ...viewProperties, map })) as esri.MapView;

			const ariadesc = this.config?.mapA11yDesc || portalItem?.snippet || portalItem?.description || null;
			if (ariadesc) {
				document.getElementById('mapDescription').innerHTML = ariadesc;
				const rootNode = document.getElementsByClassName('esri-view-surface');
				this.view.container.setAttribute("aria-describedby", 'mapDescription')
				for (let k = 0; k < rootNode.length; k++) {
					rootNode[k].setAttribute('aria-describedby', 'mapDescription');
				}
			}

			if (!this.config.mapZoom) {
				this.view.ui.remove("zoom");
			}

			this.view.highlightOptions.fillOpacity = 0;


			const handler = this.view.watch('extent', () => {
				handler.remove();
				this._initialExtent = this.view.extent.clone();
			});

		} catch (error) {
			const title = (this.item && this.item.title) || ' the application';
			displayError({ title: 'Error', message: `Unable to load ${title} ` });
		}
	}

	public clearResults() {
		this.message = null;
	}
	public resetExtent() {
		if (this._initialExtent)
			this.view.goTo(this._initialExtent).catch(() => { });
	}

}
export = MapPanel;
