define(["require", "exports", "tslib", "esri/core/watchUtils", "./utils/replace", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "./Share/ShareViewModel", "esri/core/Handles"], function (require, exports, tslib_1, watchUtils, replace_1, decorators_1, Widget, widget_1, ShareViewModel, Handles) {
    "use strict";
    //----------------------------------
    //
    //  CSS Classes
    //
    //----------------------------------
    var CSS = {
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
    var Share = /** @class */ (function (_super) {
        tslib_1.__extends(Share, _super);
        function Share(value) {
            var _this = _super.call(this, value) || this;
            //----------------------------------
            //
            //  Private Variables
            //
            //----------------------------------
            _this._shareLinkElementIsOpen = null;
            _this._handles = new Handles();
            // Tooltips
            _this._linkCopied = false;
            //  DOM Nodes //
            // URL Input & Iframe Input
            _this._iframeInputNode = null;
            _this._urlInputNode = null;
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
            _this.view = null;
            //----------------------------------
            //
            //  shareModalOpened
            //
            //----------------------------------
            _this.shareModalOpened = true;
            //----------------------------------
            //
            //  shareItems
            //
            //----------------------------------
            _this.shareItems = null;
            //----------------------------------
            //
            //  shareFeatures
            //
            //----------------------------------
            _this.shareFeatures = null;
            //----------------------------------
            //
            //  shareUrl - readOnly
            //
            //----------------------------------
            _this.shareUrl = null;
            //----------------------------------
            //
            //  defaultObjectId
            //
            //----------------------------------
            _this.defaultObjectId = null;
            //----------------------------------
            //
            //  attachmentIndex
            //
            //----------------------------------
            _this.attachmentIndex = null;
            //----------------------------------
            //
            //  isDefault
            //
            //----------------------------------
            _this.isDefault = null;
            //----------------------------------
            //
            //  iconClass and label - Expand Widget Support
            //
            //----------------------------------
            _this.iconClass = CSS.icons.widgetIcon;
            //----------------------------------
            //
            //  viewModel
            //
            //----------------------------------
            _this.viewModel = new ShareViewModel();
            _this.shareMessages = null;
            return _this;
        }
        //----------------------------------
        //
        //  Lifecycle
        //
        //----------------------------------
        Share.prototype.postInitialize = function () {
            var _this = this;
            this.own([
                watchUtils.whenTrue(this, 'view.ready', function () {
                    _this.own([
                        watchUtils.watch(_this, 'shareUrl', function () {
                            _this.scheduleRender();
                        })
                    ]);
                }),
                watchUtils.watch(this, ['defaultObjectId', 'attachmentIndex'], function () {
                    _this._removeCopyTooltips();
                })
            ]);
            this.label = this.shareMessages.widgetLabel;
        };
        Share.prototype.destroy = function () {
            this._iframeInputNode = null;
            this._urlInputNode = null;
        };
        Share.prototype.render = function () {
            var shareModalNode = this._renderShareModal();
            return widget_1.tsx("div", { class: CSS.base }, shareModalNode);
        };
        Share.prototype._copyUrlInput = function () {
            this._urlInputNode.focus();
            this._urlInputNode.setSelectionRange(0, this._urlInputNode.value.length);
            document.execCommand('copy');
            this._linkCopied = true;
            this.scheduleRender();
        };
        Share.prototype._toggleShareLinkNode = function () {
            if (!this._shareLinkElementIsOpen) {
                this._shareLinkElementIsOpen = true;
                this._generateUrl();
            }
            else {
                this._shareLinkElementIsOpen = false;
                this._removeCopyTooltips();
            }
            this.scheduleRender();
        };
        Share.prototype._processShareItem = function (event) {
            var _this = this;
            var shareKey = 'share-key';
            if (this.isDefault) {
                this._generateUrl();
            }
            this._handles.add(watchUtils.whenOnce(this, 'shareUrl', function () {
                _this._handles.remove(shareKey);
                var node = event.srcElement;
                var shareItem = node['data-share-item'];
                var urlTemplate = shareItem.urlTemplate;
                var portalItem = _this.get('view.map.portalItem');
                var title = portalItem && portalItem.title ? replace_1.replace(_this.shareMessages.urlTitle, { title: portalItem.title }) : replace_1.replace(_this.shareMessages.urlTitle, { title: "" });
                var summary = portalItem && portalItem.snippet ? replace_1.replace(_this.shareMessages.urlSummary, { summary: portalItem.snippet }) : replace_1.replace(_this.shareMessages.urlSummary, { summary: "" });
                _this._openUrl(_this.shareUrl, title, summary, urlTemplate);
            }), shareKey);
        };
        Share.prototype._generateUrl = function () {
            this.viewModel.generateUrl();
        };
        Share.prototype._removeCopyTooltips = function () {
            this._linkCopied = false;
            this.scheduleRender();
        };
        Share.prototype._openUrl = function (url, title, summary, urlTemplate) {
            var urlToOpen = replace_1.replace(urlTemplate, {
                url: encodeURI(url),
                title: title,
                summary: summary
            });
            window.open(urlToOpen);
        };
        // Render Nodes
        Share.prototype._renderShareModal = function () {
            var modalContainerNode = this._renderModalContainer();
            return widget_1.tsx("div", null, modalContainerNode);
        };
        Share.prototype._renderModalContainer = function () {
            var modalContentNode = this._renderModalContent();
            return widget_1.tsx("div", null, modalContentNode);
        };
        Share.prototype._renderModalContent = function () {
            var sendALinkContentNode = this._renderSendALinkContent();
            return widget_1.tsx("div", { class: CSS.shareModal.main.mainContainer }, sendALinkContentNode);
        };
        Share.prototype._renderShareItem = function (shareItem) {
            var name = shareItem.name, className = shareItem.className;
            return (widget_1.tsx("div", { class: this.classes(CSS.shareModal.main.mainShare.shareItem, name), key: name },
                widget_1.tsx("div", { class: className, "aria-label": name, onclick: this._processShareItem, onkeydown: this._processShareItem, tabIndex: 0, bind: this, "data-share-item": shareItem, role: "button" })));
        };
        Share.prototype._renderShareItems = function () {
            var _this = this;
            var shareServices = this.shareItems;
            var shareIcons = CSS.shareModal.main.mainShare.shareIcons;
            // Assign class names of icons to share item
            shareServices.forEach(function (shareItem) {
                for (var icon in shareIcons) {
                    if (icon === shareItem.id) {
                        shareItem.className = shareIcons[shareItem.id];
                    }
                }
            });
            return shareServices.toArray().map(function (shareItems) { return _this._renderShareItem(shareItems); });
        };
        Share.prototype._renderShareItemContainer = function () {
            var shareServices = this.shareFeatures.shareServices;
            var shareItemNodes = shareServices ? this._renderShareItems() : null;
            var shareItemNode = shareServices ? (shareItemNodes.length ? [shareItemNodes] : null) : null;
            var shareLink = this._renderShareLinkNode();
            return (widget_1.tsx("div", null, shareServices ? (widget_1.tsx("div", { class: CSS.shareModal.main.mainShare.shareContainer, key: "share-container" },
                widget_1.tsx("div", { class: CSS.shareModal.main.mainShare.shareItemContainer },
                    shareItemNode,
                    shareLink))) : null));
        };
        Share.prototype._renderShareLinkNode = function () {
            return (widget_1.tsx("div", { onclick: this._toggleShareLinkNode, onkeydown: this._toggleShareLinkNode, tabIndex: 0, bind: this, class: this.classes(CSS.shareModal.main.mainShare.shareItem, CSS.shareLinkContainer) },
                widget_1.tsx("div", { class: this.classes(CSS.icons.link), title: this.shareMessages.sendLink, "aria-label": this.shareMessages.sendLink, role: "button" })));
        };
        Share.prototype._renderCopyUrl = function () {
            var _a;
            var copyToClipboard = this.shareFeatures.copyToClipboard;
            var toolTipClasses = (_a = {},
                _a[CSS.shareModal.calciteStyles.tooltip] = this._linkCopied,
                _a[CSS.shareModal.calciteStyles.tooltipTop] = this._linkCopied,
                _a);
            return (widget_1.tsx("div", { class: CSS.sendLinkContainer }, copyToClipboard ? (widget_1.tsx("div", { class: CSS.shareModal.main.mainCopy.copyContainer, key: "copy-container" },
                widget_1.tsx("div", { class: CSS.shareModal.main.mainUrl.inputGroup },
                    widget_1.tsx("h2", { class: CSS.shareModal.main.mainHeader }, "Send a link to this page"),
                    widget_1.tsx("div", { bind: this, onclick: this._toggleShareLinkNode, onkeydown: this._toggleShareLinkNode, class: this.classes(CSS.shareModal.close, CSS.icons.closeIcon), title: this.shareMessages.close, label: this.shareMessages.close, "aria-label": "close-modal", tabindex: "0" }),
                    widget_1.tsx("div", { class: CSS.shareModal.main.mainCopy.copyClipboardContainer },
                        widget_1.tsx("input", { type: "text", class: this.classes(CSS.shareModal.main.mainUrl.urlInput), bind: this, value: this.viewModel.state === 'ready' ? this.shareUrl : "loading...", afterCreate: widget_1.storeNode, "data-node-ref": "_urlInputNode", readOnly: true }),
                        widget_1.tsx("button", { class: this.classes(CSS.shareModal.main.mainCopy.copyClipboardUrl, toolTipClasses), bind: this, onclick: this._copyUrlInput, onkeydown: this._copyUrlInput, title: this.shareMessages.copy, label: this.shareMessages.copy, "aria-label": this.shareMessages.copied }, this.shareMessages.copy))))) : null));
        };
        Share.prototype._renderSendALinkContent = function () {
            var copyUrlNode = this._renderCopyUrl();
            var shareServicesNode = this._renderShareItemContainer();
            return (widget_1.tsx("article", { class: CSS.mainLinkContainer },
                shareServicesNode,
                this._shareLinkElementIsOpen ? copyUrlNode : null));
        };
        tslib_1.__decorate([
            decorators_1.aliasOf('viewModel.view')
        ], Share.prototype, "view", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf('viewModel.shareModalOpened')
        ], Share.prototype, "shareModalOpened", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf('viewModel.shareItems')
        ], Share.prototype, "shareItems", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf('viewModel.shareFeatures')
        ], Share.prototype, "shareFeatures", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf('viewModel.shareUrl')
        ], Share.prototype, "shareUrl", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf('viewModel.defaultObjectId')
        ], Share.prototype, "defaultObjectId", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf('viewModel.attachmentIndex')
        ], Share.prototype, "attachmentIndex", void 0);
        tslib_1.__decorate([
            decorators_1.aliasOf('viewModel.isDefault')
        ], Share.prototype, "isDefault", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Share.prototype, "iconClass", void 0);
        tslib_1.__decorate([
            decorators_1.property()
        ], Share.prototype, "label", void 0);
        tslib_1.__decorate([
            decorators_1.property({
                type: ShareViewModel
            })
        ], Share.prototype, "viewModel", void 0);
        tslib_1.__decorate([
            decorators_1.property(),
            widget_1.messageBundle("nearby/app/components/Share/Share/t9n/resources")
        ], Share.prototype, "shareMessages", void 0);
        tslib_1.__decorate([
            widget_1.accessibleHandler()
        ], Share.prototype, "_copyUrlInput", null);
        tslib_1.__decorate([
            widget_1.accessibleHandler()
        ], Share.prototype, "_toggleShareLinkNode", null);
        tslib_1.__decorate([
            widget_1.accessibleHandler()
        ], Share.prototype, "_processShareItem", null);
        Share = tslib_1.__decorate([
            decorators_1.subclass('Share')
        ], Share);
        return Share;
    }((Widget)));
    return Share;
});
