
import { subclass, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';


import MapPanel from './MapPanel';
import Handles from 'esri/core/Handles';

import { tsx, messageBundle } from 'esri/widgets/support/widget';

import esri = __esri;
import { ApplicationConfig } from 'TemplatesCommonLib/interfaces/applicationBase';


const CSS = {
	grid: 'grid-container',
	mapIcon: 'icon-ui-maps',
	tableIcon: 'icon-ui-table',
	button: 'btn',
	fillButton: 'btn-fill',
	footerButton: 'btn-footer',
	borderLeft: 'border-left',
	appButton: 'app-button',
	tabletShow: 'tablet-show',
	paddingLeft: 'padding-left-0',
	paddingRight: 'padding-right-0',
	phoneColumn: 'phone-column-6',
	tabletColumn: 'tablet-column-12',
	footerColumn: 'footer-column'
};

interface FooterProps extends esri.WidgetProperties {
	mapPanel: MapPanel;
	hideMap: boolean;
	config: ApplicationConfig;
}

@subclass('app.Footer')
class Footer extends (Widget) {
	//--------------------------------------------------------------------------
	//
	//  Properties
	//
	//--------------------------------------------------------------------------

	@property() mapPanel: MapPanel;

	@property() config: ApplicationConfig;
	@property()
	@messageBundle("nearby/app/t9n/common")
	messages = null;
	@property()
	hideMap: boolean;

	@property()
	mapButtonVisible = true;
	//--------------------------------------------------------------------------
	//
	// Variables
	//
	//--------------------------------------------------------------------------

	_handles: Handles = new Handles();
	//--------------------------------------------------------------------------
	//
	//  Public Methods
	//
	//--------------------------------------------------------------------------
	constructor(props: FooterProps) {
		super(props);
	}
	render() {

		const showFooter = this.hideMap ? "hide" : null;
		const mapButton = this.mapButtonVisible ? (
			<calcite-button
				bind={this}
				onclick={this.showMap}
				color="blue"
				icon-start="map"
				appearance="solid"
				width="full"
				text={this.messages.map.label}
			>
				{this.messages.map.label}
			</calcite-button>)
			:
			(<calcite-button bind={this}
				onclick={this.closeMap}
				icon-start="table"
				color="blue"
				width="full"
				appearance="solid"
				text={this.config.appBundle.tools.results}>
				{this.config.appBundle.tools.results}
			</calcite-button>);
		return (
			<div
				class={this.classes(showFooter, CSS.footerColumn, CSS.phoneColumn, CSS.tabletColumn)}>
				<div class={this.classes(CSS.phoneColumn, CSS.tabletColumn, CSS.tabletShow)} >
					{mapButton}
				</div>
			</div>
		)
	}

	closeMap() {
		this.mapButtonVisible = true;
		this.mapPanel.view.container.classList.add('tablet-hide');

		this.mapPanel.set("tabindex", "-1");
		const mainNodes = document.getElementsByClassName('main-map-content');
		for (let j = 0; j < mainNodes.length; j++) {
			mainNodes[j].classList.remove('hide');
			mainNodes[j].classList.remove("hidden");
		}

		this.mapPanel.selectedItemTitle = null;
		if (this.mapPanel.view.popup.visible) {
			// get item and scroll to selected 
			this.mapPanel.view.popup.close();
		}

		this.mapPanel.isMobileView = false;
		document.getElementById('mapDescription').innerHTML = this.config.appBundle.map.description;
	}
	showMap() {
		this.mapButtonVisible = false;
		const mainNodes = document.getElementsByClassName('main-map-content');

		for (let j = 0; j < mainNodes.length; j++) {
			mainNodes[j].classList.add('hide');
			mainNodes[j].classList.add("hidden");
		}
		this.mapPanel.isMobileView = true;
		this.mapPanel.set("tabindex", "0");

		this.mapPanel.view.container.classList.remove('tablet-hide');
		//update the maps describedby item
		document.getElementById('mapDescription').innerHTML = this.config.appBundle.map.miniMapDescription;
		// if view size increases to greater than tablet close button if not already closed
		const resizeListener = () => {
			this.closeMap();
			window.removeEventListener("resize", resizeListener);
		}
		window.addEventListener("resize", resizeListener);
	}

}
export = Footer;
