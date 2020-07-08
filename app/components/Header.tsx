
import { subclass, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';
import DetailPanel from './DetailPanel';
import i18n = require('dojo/i18n!../nls/resources');
import { tsx, renderable } from 'esri/widgets/support/widget';
import { setPageTitle } from 'ApplicationBase/support/domHelper';
import { init } from "esri/core/watchUtils";

import ConfigurationSettings = require('../ConfigurationSettings');
import esri = __esri;



const CSS = {
	theme: 'app-header',
	calciteStyles: {
		buttonLink: 'btn-link',
		right: 'right',
		iconDesc: 'icon-ui-description',
		fade: 'fade-in',
		topNavLink: 'top-nav-link',
		topNav: 'top-nav',
		topNavTitle: 'top-nav-title',
		ellipsis: 'text-fade'
	}
};

interface HeaderProps extends esri.WidgetProperties {
	config: ConfigurationSettings,
	detailPanel: DetailPanel
}

@subclass('app.Header')
class Header extends (Widget) {
	//--------------------------------------------------------------------------
	//
	//  Properties
	//
	//--------------------------------------------------------------------------

	@property()
	@renderable(["title", "titleLink"])
	config: ConfigurationSettings;
	@property() detailPanel: DetailPanel;
	//--------------------------------------------------------------------------
	//
	//  Public Methods
	//
	//--------------------------------------------------------------------------
	constructor(props: HeaderProps) {
		super(props);
	}
	postInitialize() {
		const handle = init(this, "config.title", this._onTitleUpdate);

		this.own(handle);
	}
	render() {
		const { title, titleLink } = this.config;

		const titleNode = titleLink ? (
			<a target="_blank" rel="noopener" href={titleLink}>
				{title}
			</a>
		) : (
				title
			);
		const infoButton = this.detailPanel ? <div class="right">
			<button bind={this} onclick={this._showDetailPanel} aria-label={i18n.tools.info} title={i18n.tools.info} class={this.classes(CSS.theme, CSS.calciteStyles.topNavTitle, CSS.calciteStyles.buttonLink, CSS.calciteStyles.iconDesc)}></button>
		</div> : null;


		return (
			<header class={this.classes(CSS.calciteStyles.topNav, CSS.theme)}>
				<div class={this.classes(CSS.calciteStyles.fade)}>
					<h1 title={title} class={this.classes(CSS.calciteStyles.topNavTitle, CSS.calciteStyles.ellipsis)}>{titleNode}</h1>
				</div>
				{infoButton}

			</header>
		);
	}
	_showDetailPanel(e) {
		// add class to detail panel to add close button and position at top of panel
		const node = this.detailPanel.container as HTMLElement;
		node.classList.add("info-triggered");

		// Show panel unless we click button with panel already open
		if (node && !node.classList.contains("hide")) {
			this.detailPanel.hidePanel();
		} else {
			this.detailPanel.showPanel();
		}
	}

	private _onTitleUpdate() {
		setPageTitle(this.config.title);
	};
}
export = Header;
