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
import { tsx } from 'esri/widgets/support/widget';
import * as promiseUtils from 'esri/core/promiseUtils';
import Feature from 'esri/widgets/Feature';
import Handles from 'esri/core/Handles';
import esri = __esri;
import Accordion, { ActionButton, AccordionProps } from './Accordion';

const CSS = {
	base: 'accordion',
	basejs: 'js-accordion',
	single: 'single',
	section: 'accordion-section',
	active: 'is-active',
	title: 'accordion-title',
	titleArea: 'title-area',
	titleText: 'title-text',
	content: 'accordion-content',
	button: 'btn',
	transparentButton: 'btn-transparent',
	accordionIcon: 'accordion-icon',
	paddingTrailer: 'padding-right-quarter',
	right: 'right',
	actions: 'accordion-actions',
	templateContent: 'template',
	scrollable: "scrollable-content",
	actionBar: 'action-bar'
};
export interface ActionButton {
	icon: string;
	id: string;
	name: string;
	class?: string;
	handleClick: (name: string, graphic: esri.Graphic) => void;
}
interface FeatureAccordionProps extends AccordionProps {
	features: esri.Graphic[];
}

@subclass('app.FeatureAccordion')
class FeatureAccordion extends declared(Accordion) {
	//--------------------------------------------------------------------------
	//
	//  Properties
	//
	//--------------------------------------------------------------------------

	@property() features: esri.Graphic[];

	@property() sectionCount: number;
	@property() selectedItem: esri.Graphic;
	@property() hoveredItem: esri.Graphic;
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
	constructor(props: FeatureAccordionProps) {
		super();
	}
	render() {
		const count = this.features && this.features.length || 0;
		const { resultsPanelPreText, resultsPanelPostText } = this.config;
		const preText = resultsPanelPreText && count > 0 ? this.createPreText() : null;
		const postText = resultsPanelPostText && count > 0 ? this.createPostText() : null;

		return (
			<div afterCreate={this.updateCalcite} class={this.classes(CSS.scrollable)}>
				{preText}
				<div class={this.classes(CSS.base, CSS.basejs)}>
					{this.features &&
						this.features.map((graphic, i) => this._renderFeatureWidget(graphic, this.features.length, i))}
				</div>
				{postText}
			</div>
		);
	}
	_renderFeatureWidget(graphic: esri.Graphic, count: number, index: number) {
		// Add active class to all sections if there are less than 2. If there are
		// more than 2 just add to the first feature

		return count && count > 0 ? (
			<div key="feature-content">
				<section
					data-feature={graphic}
					afterCreate={this._createFeature}
					bind={this}
					key={`section${index}`}
					class={this.classes(CSS.section, count <= 2 || (count > 2 && index === 0) ? CSS.active : null, count === 1 ? CSS.single : null)}
				>
					<h4 class={CSS.title}>
						<span class={this.classes(CSS.accordionIcon)}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="14"
								height="14"
								viewBox="0 0 32 32"
								class="svg-icon"
							>
								<path d="M28 9v5L16 26 4 14V9l12 12L28 9z" />
							</svg>
						</span>
						<span class={CSS.titleArea} />
					</h4>

					<div key={`btn${index}`} class={this.classes(CSS.content)}>
						<nav class={this.classes(CSS.actionBar)}>
							{this.actionBarItems &&
								this.actionBarItems.length > 0 &&
								this.actionBarItems.map((item) => this.createActionItem(item, graphic))}
						</nav>
						<div class={CSS.templateContent} />
					</div>
				</section>
			</div>
		) : null;
	}
	_createFeature(node: HTMLElement) {
		if (node instanceof HTMLElement) {
			const titleNode = node.querySelector(`.${CSS.titleArea}`);
			const container = node.querySelector(`.${CSS.templateContent}`) as HTMLElement;

			titleNode &&
				titleNode.parentElement &&
				titleNode.parentElement.addEventListener('click', () => this._selectAccordionSection(node, graphic));
			container && container.addEventListener('click', () => this._selectAccordionSection(node, graphic));
			container && container.addEventListener("mouseover", promiseUtils.debounce(() => {
				this.hoveredItem = graphic;
			}));
			const graphic = node['data-feature'];

			const feature = new Feature({
				graphic,
				defaultPopupTemplateEnabled: true,
				map: this.view.map,
				spatialReference: this.view.spatialReference,
				visibleElements: {
					title: false
				},
				container
			});

			const handleContent = feature.viewModel.watch("content", () => {
				handleContent.remove();
				const empty = this.checkContent(feature);
				if (empty) {
					if (container.parentElement && container.parentElement.parentElement) {
						container.parentElement.parentElement.classList.add("no-content");
					}
				}
			})
			const handle = feature.watch('title', () => {
				let title: string = `<span class='title-text'>${feature.get('title')}</span>`;
				handle.remove();
				if (graphic && graphic.attributes && graphic.attributes.lookupDistance && this.config.includeDistance) {
					title += this.convertUnitText(graphic.attributes.lookupDistance, this.config.units);
				}
				titleNode.innerHTML = title;
				feature.graphic.setAttribute('app-accordion-title', feature.get('title'));
			});
		}
	}

	_selectAccordionSection(node: HTMLElement, graphic: esri.Graphic) {
		const selectedClassName = 'accordion-section-selected';
		//only apply selection style if more than one feature is selected
		if (this.features && this.features.length && this.features.length > 1) {
			const mainNodes = document.getElementsByClassName(selectedClassName);
			for (let j = 0; j < mainNodes.length; j++) {
				mainNodes[j].classList.remove(selectedClassName);
			}
			if (node && node.parentElement) {
				node.parentElement.classList.add(selectedClassName);
			}
		}
		this.selectedItem = graphic;
	}

	clear() {
		this.features = null;
	}
	showToggle(): boolean {
		return this.features && this.features.length && this.features.length > 2;
	}

}
export default FeatureAccordion;
