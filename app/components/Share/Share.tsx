


// esri.core
import Collection = require('esri/core/Collection');
import watchUtils = require('esri/core/watchUtils');

import { replace } from './utils/replace';

// esri.core.accessorSupport
import { subclass, property, aliasOf } from 'esri/core/accessorSupport/decorators';

// esri.views
import MapView = require('esri/views/MapView');
import SceneView = require('esri/views/SceneView');

// esri.widgets
import Widget = require('esri/widgets/Widget');

//esri.widgets.support
import { accessibleHandler, tsx, storeNode, messageBundle } from 'esri/widgets/support/widget';

// View Model
import ShareViewModel = require('./Share/ShareViewModel');

// Share Item
import ShareItem = require('./Share/ShareItem');

// ShareFeatures
import ShareFeatures = require('./Share/ShareFeatures');

// PortalItem
import PortalItem = require('esri/portal/PortalItem');

// esri.coreHandles
import Handles = require('esri/core/Handles');

//----------------------------------
//
//  CSS Classes
//
//----------------------------------

const CSS = {
	base: 'esri-share',
	shareModalStyles: 'esri-share__share-modal',
	shareButton: 'esri-share__share-button',
	shareLinkContainer: 'esri-share__share-link',
	sendLinkContainer: 'esri-share__send-link-container',
	mainLinkContainer: 'esri-share__main-link-container',
	shareModal: {
		close: 'esri-share__close',
		shareIframe: {
			iframeContainer: 'esri-share__iframe-container',
			iframeTabSectionContainer: 'esri-share__iframe-tab-section-container',
			iframeInputContainer: 'esri-share__iframe-input-container',
			iframePreview: 'esri-share__iframe-preview',
			iframeInput: 'esri-share__iframe-input',
			embedContentContainer: 'esri-share__embed-content-container'
		},
		shareTabStyles: {
			tabSection: 'esri-share__tab-section',
			iframeTab: 'esri-share__iframe-tab-section'
		},
		header: {
			container: 'esri-share__header-container',
			heading: 'esri-share__heading'
		},
		main: {
			mainContainer: 'esri-share__main-container',
			mainHeader: 'esri-share__main-header',
			mainHR: 'esri-share__hr',
			mainCopy: {
				copyButton: 'esri-share__copy-button',
				copyContainer: 'esri-share__copy-container',
				copyClipboardUrl: 'esri-share__copy-clipboard-url',
				copyClipboardContainer: 'esri-share__copy-clipboard-container',
				copyClipboardIframe: 'esri-share__copy-clipboard-iframe'
			},
			mainUrl: {
				inputGroup: 'esri-share__copy-url-group',
				urlInput: 'esri-share__url-input',
				linkGenerating: 'esri-share--link-generating'
			},
			mainShare: {
				shareContainer: 'esri-share__share-container',
				shareItem: 'esri-share__share-item',
				shareItemContainer: 'esri-share__share-item-container',
				shareIcons: {
					facebook: 'icon-social-facebook',
					twitter: 'icon-social-twitter',
					email: 'icon-social-contact',
					linkedin: 'icon-social-linkedin',
					pinterest: 'icon-social-pinterest',
					rss: 'icon-social-rss'
				}
			},
			mainInputLabel: 'esri-share__input-label'
		},
		calciteStyles: {
			modifier: 'modifier-class',
			isActive: 'is-active',
			tooltip: 'tooltip',
			tooltipTop: 'tooltip-top'
		}
	},
	icons: {
		widgetIcon: 'esri-icon-share',
		copyIconContainer: 'esri-share__copy-icon-container',
		copy: 'esri-share__copy-icon',
		esriLoader: 'esri-share__loader',
		closeIcon: 'esri-icon-close',
		copyToClipboardIcon: 'icon-ui-duplicate',
		link: 'esri-icon-link'
	}
};

@subclass('Share')
class Share extends (Widget) {
	constructor(value?: any) {
		super(value);
	}
	//----------------------------------
	//
	//  Private Variables
	//
	//----------------------------------

	private _shareLinkElementIsOpen: boolean = null;
	private _handles: Handles = new Handles();

	// Tooltips
	private _linkCopied = false;

	//  DOM Nodes //
	// URL Input & Iframe Input
	private _iframeInputNode: HTMLInputElement = null;
	private _urlInputNode: HTMLInputElement = null;

	//----------------------------------
	//
	//  Properties
	//
	//----------------------------------

	//----------------------------------
	//
	//  view
	//
	//----------------------------------

	@aliasOf('viewModel.view') view: MapView | SceneView = null;

	//----------------------------------
	//
	//  shareModalOpened
	//
	//----------------------------------
	@aliasOf('viewModel.shareModalOpened')
	shareModalOpened: boolean = true;

	//----------------------------------
	//
	//  shareItems
	//
	//----------------------------------

	@aliasOf('viewModel.shareItems')
	shareItems: Collection<ShareItem> = null;

	//----------------------------------
	//
	//  shareFeatures
	//
	//----------------------------------
	@aliasOf('viewModel.shareFeatures')
	shareFeatures: ShareFeatures = null;

	//----------------------------------
	//
	//  shareUrl - readOnly
	//
	//----------------------------------

	@aliasOf('viewModel.shareUrl')
	shareUrl: string = null;

	//----------------------------------
	//
	//  defaultObjectId
	//
	//----------------------------------

	@aliasOf('viewModel.defaultObjectId')
	defaultObjectId: number = null;

	//----------------------------------
	//
	//  attachmentIndex
	//
	//----------------------------------

	@aliasOf('viewModel.attachmentIndex')
	attachmentIndex: number = null;

	//----------------------------------
	//
	//  isDefault
	//
	//----------------------------------

	@aliasOf('viewModel.isDefault')
	isDefault: boolean = null;

	//----------------------------------
	//
	//  iconClass and label - Expand Widget Support
	//
	//----------------------------------

	@property() iconClass = CSS.icons.widgetIcon;
	@property() label;

	//----------------------------------
	//
	//  viewModel
	//
	//----------------------------------

	@property({
		type: ShareViewModel
	})
	viewModel: ShareViewModel = new ShareViewModel();
	@property()
	@messageBundle("nearby/app/components/Share/Share/t9n/resources")
	shareMessages = null;

	//----------------------------------
	//
	//  Lifecycle
	//
	//----------------------------------

	postInitialize() {
		this.own([
			watchUtils.whenTrue(this, 'view.ready', () => {
				this.own([
					watchUtils.watch(this, 'shareUrl', () => {
						this.scheduleRender();
					})
				]);
			}),
			watchUtils.watch(this, ['defaultObjectId', 'attachmentIndex'], () => {
				this._removeCopyTooltips();
			})
		]);
		this.label = this.shareMessages.widgetLabel;
	}

	destroy() {
		this._iframeInputNode = null;
		this._urlInputNode = null;
	}

	render() {
		const shareModalNode = this._renderShareModal();
		return <div class={CSS.base}>{shareModalNode}</div>;
	}

	@accessibleHandler()
	private _copyUrlInput(): void {
		this._urlInputNode.focus();
		this._urlInputNode.setSelectionRange(0, this._urlInputNode.value.length);
		document.execCommand('copy');
		this._linkCopied = true;
		this.scheduleRender();
	}

	@accessibleHandler()
	private _toggleShareLinkNode(): void {
		if (!this._shareLinkElementIsOpen) {
			this._shareLinkElementIsOpen = true;
			this._generateUrl();
		} else {
			this._shareLinkElementIsOpen = false;
			this._removeCopyTooltips();
		}

		this.scheduleRender();
	}

	@accessibleHandler()
	private _processShareItem(event: Event): void {
		const shareKey = 'share-key';

		if (this.isDefault) {
			this._generateUrl();
		}

		this._handles.add(
			watchUtils.whenOnce(this, 'shareUrl', () => {
				this._handles.remove(shareKey);
				const node = event.srcElement as HTMLElement;
				const shareItem = node['data-share-item'] as ShareItem;
				const { urlTemplate } = shareItem;
				const portalItem = this.get<PortalItem>('view.map.portalItem');
				const title = portalItem && portalItem.title ? replace(this.shareMessages.urlTitle, { title: portalItem.title }) : replace(this.shareMessages.urlTitle, { title: "" });
				const summary = portalItem && portalItem.snippet ? replace(this.shareMessages.urlSummary, { summary: portalItem.snippet }) : replace(this.shareMessages.urlSummary, { summary: "" });
				this._openUrl(this.shareUrl, title, summary, urlTemplate);
			}),
			shareKey
		);
	}

	private _generateUrl(): void {
		this.viewModel.generateUrl();
	}

	private _removeCopyTooltips(): void {
		this._linkCopied = false;
		this.scheduleRender();
	}

	private _openUrl(url: string, title: string, summary: string, urlTemplate: string): void {
		const urlToOpen = replace(urlTemplate, {
			url: encodeURI(url),
			title,
			summary
		});
		window.open(urlToOpen);
	}

	// Render Nodes
	private _renderShareModal(): any {
		const modalContainerNode = this._renderModalContainer();
		return <div>{modalContainerNode}</div>;
	}

	private _renderModalContainer(): any {
		const modalContentNode = this._renderModalContent();
		return <div>{modalContentNode}</div>;
	}

	private _renderModalContent(): any {
		const sendALinkContentNode = this._renderSendALinkContent();
		return <div class={CSS.shareModal.main.mainContainer}>{sendALinkContentNode}</div>;
	}

	private _renderShareItem(shareItem: ShareItem): any {
		const { name, className } = shareItem;
		return (
			<div class={this.classes(CSS.shareModal.main.mainShare.shareItem, name)} key={name}>
				<div
					class={className}
					aria-label={name}
					onclick={this._processShareItem}
					onkeydown={this._processShareItem}
					tabIndex={0}
					bind={this}
					data-share-item={shareItem}
					role="button"
				/>
			</div>
		);
	}

	private _renderShareItems(): any[] {
		const shareServices = this.shareItems;
		const { shareIcons } = CSS.shareModal.main.mainShare;
		// Assign class names of icons to share item
		shareServices.forEach((shareItem: ShareItem) => {
			for (const icon in shareIcons) {
				if (icon === shareItem.id) {
					shareItem.className = shareIcons[shareItem.id];
				}
			}
		});

		return shareServices.toArray().map((shareItems) => this._renderShareItem(shareItems));
	}

	private _renderShareItemContainer(): any {
		const { shareServices } = this.shareFeatures;
		const shareItemNodes = shareServices ? this._renderShareItems() : null;
		const shareItemNode = shareServices ? (shareItemNodes.length ? [shareItemNodes] : null) : null;
		const shareLink = this._renderShareLinkNode();
		return (
			<div>
				{shareServices ? (
					<div class={CSS.shareModal.main.mainShare.shareContainer} key="share-container">
						<div class={CSS.shareModal.main.mainShare.shareItemContainer}>
							{shareItemNode}
							{shareLink}
						</div>
					</div>
				) : null}
			</div>
		);
	}

	private _renderShareLinkNode() {
		return (
			<div
				onclick={this._toggleShareLinkNode}
				onkeydown={this._toggleShareLinkNode}
				tabIndex={0}
				bind={this}
				class={this.classes(CSS.shareModal.main.mainShare.shareItem, CSS.shareLinkContainer)}
			>
				<div
					class={this.classes(CSS.icons.link)}
					title={this.shareMessages.sendLink}
					aria-label={this.shareMessages.sendLink}
					role="button"
				/>
			</div>
		);
	}

	private _renderCopyUrl(): any {
		const { copyToClipboard } = this.shareFeatures;
		const toolTipClasses = {
			[CSS.shareModal.calciteStyles.tooltip]: this._linkCopied,
			[CSS.shareModal.calciteStyles.tooltipTop]: this._linkCopied
		};
		return (
			<div class={CSS.sendLinkContainer}>
				{copyToClipboard ? (
					<div class={CSS.shareModal.main.mainCopy.copyContainer} key="copy-container">
						<div class={CSS.shareModal.main.mainUrl.inputGroup}>
							<h2 class={CSS.shareModal.main.mainHeader}>Send a link to this page</h2>
							<div
								bind={this}
								onclick={this._toggleShareLinkNode}
								onkeydown={this._toggleShareLinkNode}
								class={this.classes(CSS.shareModal.close, CSS.icons.closeIcon)}
								title={this.shareMessages.close}
								label={this.shareMessages.close}
								aria-label="close-modal"
								tabindex="0"
							/>
							<div class={CSS.shareModal.main.mainCopy.copyClipboardContainer}>
								<input
									type="text"
									class={this.classes(CSS.shareModal.main.mainUrl.urlInput)}
									bind={this}
									value={this.viewModel.state === 'ready' ? this.shareUrl : `loading...`}
									afterCreate={storeNode}
									data-node-ref="_urlInputNode"
									readOnly
								/>
								<button
									class={this.classes(CSS.shareModal.main.mainCopy.copyClipboardUrl, toolTipClasses)}
									bind={this}
									onclick={this._copyUrlInput}
									onkeydown={this._copyUrlInput}
									title={this.shareMessages.copy}
									label={this.shareMessages.copy}
									aria-label={this.shareMessages.copied}
								>
									{this.shareMessages.copy}
								</button>
							</div>
						</div>
					</div>
				) : null}
			</div>
		);
	}

	private _renderSendALinkContent(): any {
		const copyUrlNode = this._renderCopyUrl();
		const shareServicesNode = this._renderShareItemContainer();
		return (
			<article class={CSS.mainLinkContainer}>
				{shareServicesNode}
				{this._shareLinkElementIsOpen ? copyUrlNode : null}
			</article>
		);
	}
}

export = Share;
