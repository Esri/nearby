
import { subclass, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';


import MapPanel from './MapPanel';
import Handles from 'esri/core/Handles';
import i18n = require('dojo/i18n!../nls/resources');
import { renderable, tsx } from 'esri/widgets/support/widget';

import esri = __esri;
import { ApplicationConfig } from 'ApplicationBase/interfaces';


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
	@renderable()
	hideMap: boolean;

	@property()
	@renderable()
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
		const mapButton = this.mapButtonVisible ? (<button bind={this} onclick={this.showMap} class={this.classes(CSS.button, CSS.fillButton, CSS.appButton, CSS.mapIcon)}>{i18n.map.label}</button>
		) :
			(<button bind={this} onclick={this.closeMap} class={this.classes(CSS.button, CSS.fillButton, CSS.appButton, CSS.tableIcon)}>{i18n.tools.results}</button>
			);
		return (
			<div
				class={this.classes(showFooter, CSS.footerColumn, CSS.phoneColumn, CSS.tabletColumn)}>
				<div class={this.classes(CSS.paddingLeft, CSS.paddingRight, CSS.phoneColumn, CSS.tabletColumn, CSS.tabletShow)} >
					{mapButton}
				</div>;
			</div>
		)
	}

	closeMap() {
		this.mapButtonVisible = true;
		this.mapPanel.view.container.classList.add('tablet-hide');
		const mainNodes = document.getElementsByClassName('main-map-content');
		for (let j = 0; j < mainNodes.length; j++) {
			mainNodes[j].classList.remove('hide');
		}

		this.mapPanel.selectedItemTitle = null;
		if (this.mapPanel.view.popup.visible) {
			// get item and scroll to selected 
			this.mapPanel.view.popup.close();
		}

		this.mapPanel.isMobileView = false;
		document.getElementById('mapDescription').innerHTML = i18n.map.description;
	}
	showMap() {
		this.mapButtonVisible = false;
		const mainNodes = document.getElementsByClassName('main-map-content');
		for (let j = 0; j < mainNodes.length; j++) {
			mainNodes[j].classList.add('hide');
		}
		this.mapPanel.isMobileView = true;
		this.mapPanel.view.container.classList.remove('tablet-hide');
		//update the maps describedby item
		document.getElementById('mapDescription').innerHTML = i18n.map.miniMapDescription;
		// if view size increases to greater than tablet close button if not already closed
		const resizeListener = () => {
			this.closeMap();
			window.removeEventListener("resize", resizeListener);
		}
		window.addEventListener("resize", resizeListener);
	}

}
export = Footer;
