/*
  Copyright 2019 Esri
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
/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
import { subclass, declared, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';
import Accessor from 'esri/core/Accessor';
import DetailPanel from './DetailPanel';
import i18n = require('dojo/i18n!../nls/resources');
import { tsx } from 'esri/widgets/support/widget';

import esri = __esri;
import { ApplicationConfig } from 'ApplicationBase/interfaces';

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
		ellipsis: 'text-ellipsis'
	}
};

interface HeaderProps extends esri.WidgetProperties {
	config: ApplicationConfig,
	detailPanel: DetailPanel
}

@subclass('app.Header')
class Header extends declared(Widget, Accessor) {
	//--------------------------------------------------------------------------
	//
	//  Properties
	//
	//--------------------------------------------------------------------------

	@property() config: ApplicationConfig;
	@property() detailPanel: DetailPanel;
	//--------------------------------------------------------------------------
	//
	//  Public Methods
	//
	//--------------------------------------------------------------------------
	constructor(props: HeaderProps) {
		super();
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
					<h1 class={this.classes(CSS.calciteStyles.topNavTitle, CSS.calciteStyles.ellipsis)}>{titleNode}</h1>
					{infoButton}
				</div>
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
}
export = Header;
