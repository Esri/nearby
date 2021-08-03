
import { subclass, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';
import DetailPanel from './DetailPanel';
import { tsx } from 'esri/widgets/support/widget';
import { setPageTitle } from 'TemplatesCommonLib/baseClasses/support/domHelper';
import { init } from "esri/core/watchUtils";

import ConfigurationSettings from '../ConfigurationSettings';
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
	sharedTheme: any,
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
	config: ConfigurationSettings;
	@property() detailPanel: DetailPanel;
	@property() sharedTheme: any;
	//--------------------------------------------------------------------------
	//
	//  Public Methods
	//
	//--------------------------------------------------------------------------
	constructor(props: HeaderProps) {
		super(props);
		this._onTitleUpdate = this._onTitleUpdate.bind(this);
	}
	postInitialize() {
		this.own(init(this, "config.title", this._onTitleUpdate));

	}
	render() {
		const { title, titleLink, headerBackground, headerColor, theme, enableHeaderBackground, enableHeaderColor, showIntroduction } = this.config;
		const customStyle = this._createCustomStyle();
		const titleNode = titleLink ? (
			<a target="_blank" rel="noopener noreferer" href={titleLink}>
				{title}
			</a>
		) : (
			title
		);
		const headerClasses = (headerBackground && enableHeaderBackground) || (headerColor && enableHeaderColor) ? [CSS.calciteStyles.topNavTitle] : [CSS.calciteStyles.ellipsis, CSS.calciteStyles.topNavTitle]
		const color = theme === "light" ? "inverse" : "neutral";
		const infoButton = showIntroduction && this.detailPanel ? <div class="info-button" key="info-button">
			<calcite-button
				appearance="transparent"
				color={color}
				bind={this}
				id="infoButton"
				onclick={this._showDetailPanel}
				aria-label={this.config.appBundle.tools.info}
				icon-start="information-f"
			>
			</calcite-button>
		</div > : null;
		return (
			<header theme={theme} style={customStyle} class={this.classes(CSS.calciteStyles.topNav, CSS.theme)}>
				<h1 title={title} class={this.classes(headerClasses)}>{titleNode}</h1>
				{infoButton}
			</header>
		);
	}
	_createCustomStyle() {
		const hasSharedTheme = document.body.classList.contains("shared-theme");

		const { headerBackground, applySharedTheme, enableHeaderBackground, enableHeaderColor, headerColor, theme } = this.config;


		// Default theme colors 
		let backgroundColor = theme === "light" ? "#4a4a4a" : "#323232";
		let textColor = "#fff";

		// Overwrite defaults above with shared themes 
		if (hasSharedTheme && applySharedTheme) {
			const { header } = this.sharedTheme;
			backgroundColor = header?.background ? header.background : backgroundColor;
			textColor = header?.text ? header.text : textColor;
		}

		// These always win (overwrite theme and shared theming)
		backgroundColor = headerBackground && enableHeaderBackground ? headerBackground : backgroundColor;

		textColor = headerColor && enableHeaderColor ? headerColor : textColor;
		const calciteVariable = theme === "dark" ? `--calcite-ui-text-1` : `--calcite-ui-foreground-1`;
		return `
		${calciteVariable}:${textColor};
		background-color:${backgroundColor};
		fill:${textColor};
		color:${textColor};`;

	}
	_showDetailPanel(e) {
		// add class to detail panel to add close button and position at top of panel
		const node = this.detailPanel.container as HTMLElement;

		if (node && !node.classList.contains("hide")) {
			this.detailPanel.hidePanel();
		} else {
			this.detailPanel.showPanel();
		}

	}

	private _onTitleUpdate() {
		if (this?.config?.title) {
			setPageTitle(this.config.title);
		}
	};
}
export = Header;
