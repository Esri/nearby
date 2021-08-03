
import { subclass, property } from 'esri/core/accessorSupport/decorators';
import Widget from 'esri/widgets/Widget';
import Share from '../components/Share/Share';
import ShareFeatures from '../components/Share/Share/ShareFeatures';
import { whenOnce } from 'esri/core/watchUtils';
import Handles from 'esri/core/Handles';
import { tsx, messageBundle } from 'esri/widgets/support/widget';

import esri = __esri;
import ConfigurationSettings from '../ConfigurationSettings';
import MapPanel from './MapPanel';
type State = 'ready' | 'loading';

const CSS = {
	calciteStyles: {
		right: 'right',
		left: 'left',
		fontSize2: 'font-size--2',
		paddingTrailer: 'padding-right-1',
		panel: 'panel',
		panelNoPadding: 'panel-no-padding',
		btn: 'btn',
		btnFill: 'btn-fill',
		btnTransparent: 'btn-transparent',
		phoneHide: 'phone-hide'
	},
	svgIcon: 'svg-icon',
	detailsHeader: 'details-header',
	detailsTitle: 'details-title',
	detailsContent: 'details-content',
	hide: 'hide',
	filter: "filter",
	details: 'detail'
};

export interface DetailPanelProps extends esri.WidgetProperties {
	config: ConfigurationSettings;
	mapPanel: MapPanel,
	view: esri.MapView;
}

@subclass('app.DetailPanel')
class DetailPanel extends (Widget) {
	//--------------------------------------------------------------------------
	//
	//  Properties
	//
	//--------------------------------------------------------------------------
	@property()
	config: ConfigurationSettings = null;
	@property() shareWidget: Share = null;
	@property() view: esri.MapView = null;
	@property()
	@messageBundle("nearby/app/t9n/common")
	messages = null;
	private _handles: Handles = new Handles();
	private _resultsPanel: HTMLElement = document.getElementById("resultsPanel");
	//----------------------------------
	//
	//  state - readOnly
	//
	//----------------------------------
	@property({
		dependsOn: ['view.ready'],
		readOnly: true
	})
	get state(): State {
		const ready = this.get('view.ready');
		return ready ? 'ready' : 'loading';
	}
	@property()
	mapPanel: any = null;
	constructor(props: DetailPanelProps) {
		super(props);
	}
	initialize() {

		const setupShare = 'setup-share';
		this._handles.add(
			whenOnce(this, 'view.ready', () => {
				const shareFeatures = new ShareFeatures({
					copyToClipboard: true,
					embedMap: false
				});

				this.shareWidget = new Share({
					view: this.view,
					shareFeatures,
					container: document.createElement('div'),
					isDefault: true
				});

				this._handles.remove(setupShare);
			}),
			setupShare
		);
	}
	destroy() {
		this._handles.removeAll();
		this._handles = null;
	}

	render() {
		const { share, theme } = this.config;
		const title = this._getTitle();
		const content = this._getContent();
		const mapViewMobile = this?.mapPanel?.isMobileView ? "map-view-mobile" : null;
		const socialShare =
			share && this.shareWidget ? (
				<div
					bind={this.shareWidget.container}
					afterCreate={this._attachToNode}
					class={this.classes(CSS.calciteStyles.phoneHide)}
				/>
			) : null;
		return (
			<div bind={this} class={this.classes(mapViewMobile, CSS.calciteStyles.panel, CSS.calciteStyles.panelNoPadding)}>
				<div class={CSS.detailsHeader}>
					<span class={this.classes(CSS.detailsTitle)}>{title}</span>
					<calcite-button
						bind={this}
						aria-label={this.config.bundle.close}
						onclick={this.hidePanel}
						appearance="transparent"
						color={theme === "light" ? "neutral" : "inverse"}
						icon-start="x"
					>
					</calcite-button>
				</div>
				<p class={this.classes(CSS.detailsContent)} innerHTML={content} />
				{socialShare}
			</div>
		);
	}
	public hidePanel() {
		const container = this.container as HTMLElement;
		container.classList.add("hide");

		this._resultsPanel.classList.remove("hide");
		if (this?.mapPanel?.isMobileView) {
			this.mapPanel?.container?.classList.remove("hide");
		}
	}
	public showPanel() {
		const container = this.container as HTMLElement;
		container.classList.remove("hide");
		this._resultsPanel.classList.add("hide");
		if (this?.mapPanel?.isMobileView) {
			this.mapPanel?.container?.classList.add("hide");
		}
	}

	_attachToNode(this: HTMLElement, node: HTMLElement): void {
		const content: HTMLElement = this;
		node.appendChild(content);
	}

	_getTitle() {
		let title = this.config.introductionTitle;
		if (!title) {
			// no title specified use default? 
			title = this.messages.onboarding.title;
		}

		return title;
	}
	_getContent() {
		let content = this.config.introductionContent;

		if (!content) {
			content = this.messages.onboarding.content;
		}
		return content;
	}

}

export default DetailPanel;
