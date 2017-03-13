import * as dojoDeclare from "dojo/_base/declare";
import * as WidgetBase from "mxui/widget/_WidgetBase";
import * as dojoAspect from "dojo/aspect";
import * as domStyle from "dojo/dom-style";
import * as domClass from "dojo/dom-class";
import * as domConstruct from "dojo/dom-construct";
import * as registry from "dijit/registry";

import "./ui/AutoLoadMore.css";

interface ListView extends mxui.widget._WidgetBase {
    _datasource: {
        _setsize: number;
        atEnd: () => boolean;
        _pageSize: number;
    };
    _loadMore: () => void;
    _onLoad: () => void;
    _renderData: () => void;
}

class AutoLoadMore extends WidgetBase {
    // Widget Properties set from the Mendix modeler
    targetName: string;

    private targetWidget: ListView;
    private targetNode: HTMLElement | null;
    private autoLoadClass: string;
    private isScrolling: boolean;

    postCreate() {
        this.autoLoadClass = "mx-listview-auto-load-more";
        this.targetNode = this.findTargetNode(this.targetName, this.domNode);
        if (this.targetNode) {
            this.targetWidget = registry.byNode(this.targetNode);
            if (this.isValidWidget(this.targetWidget)) {
                this.transformListView(this.targetNode, this.targetWidget, this.autoLoadClass);
            }
            this.targetNode.addEventListener("scroll", () => this.onScroll());
        }
    }

    private findTargetNode(targetName: string, domNode: HTMLElement): HTMLElement | null {
        let queryNode = domNode.parentNode as HTMLElement;
        let targetNode: HTMLElement | null = null;
        while (!targetNode) {
            targetNode = queryNode.querySelector(`.mx-name-${targetName}`) as HTMLElement;
            if (window.document.isEqualNode(queryNode)) break;
            queryNode = queryNode.parentNode as HTMLElement;
        }

        if (!targetNode) {
            this.renderAlert(`Unable to find listview with the name "${targetName}"`);
        }

        return targetNode;
    }

    private isValidWidget(targetWidget: ListView): boolean {
        if (targetWidget && targetWidget.declaredClass === "mxui.widget.ListView") {
            if (targetWidget._onLoad
                && targetWidget._loadMore
                && targetWidget._renderData
                && targetWidget._datasource
                && targetWidget._datasource.atEnd
                && typeof targetWidget._datasource._pageSize !== "undefined"
                && typeof targetWidget._datasource._setsize !== "undefined") {
                    return true;
            } else {
                this.renderAlert("This Mendix version is incompatible with the auto load more widget");
            }
        } else {
            this.renderAlert(`Supplied target name "${this.targetName}" is not of the type listview`);
        }

        return false;
    }

    private transformListView(targetNode: HTMLElement, targetWidget: ListView, customClass: string) {
        dojoAspect.after(targetWidget, "_onLoad", () => {
            if (!targetWidget._datasource.atEnd()) {
                domClass.add(targetNode, customClass);
                domStyle.set(targetNode, "height", `${targetNode.offsetHeight}px`);
                targetWidget._loadMore();

                dojoAspect.after(targetWidget, "_renderData", () => {
                    if (targetWidget._datasource._pageSize >= targetWidget._datasource._setsize) {
                        domClass.remove(targetNode, customClass);
                        domStyle.set(targetNode, "height", "auto");
                    }
                });
            }
        });
    }

    private onScroll() {
        if (!this.isScrolling && !this.targetWidget._datasource.atEnd()) {
            window.setTimeout(window.requestAnimationFrame(() => this.loadMore()), 0);
            this.isScrolling = true;
        }
    }

    private loadMore() {
        const { clientHeight, scrollHeight, scrollTop } = this.targetNode as HTMLElement;
        const scrollPercentage = Math.floor(scrollTop / (scrollHeight - clientHeight)) * 100;
        if (scrollPercentage >= 70 && this.targetWidget) {
            this.targetWidget._loadMore();
        }
        this.isScrolling = false;
    }

    private renderAlert(message: string) {
        domConstruct.place(
            `<div class='alert alert-danger widget-auto-load-more-alert'>${message}</div>`, this.domNode, "only"
        );
    }
}

// Declare widget prototype the Dojo way
// Thanks to https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/dojo/README.md
// tslint:disable : only-arrow-functions
dojoDeclare("com.mendix.widget.autoloadmore.AutoLoadMore", [ WidgetBase ], function(Source: any) {
    const result: any = {};
    for (const property in Source.prototype) {
        if (property !== "constructor" && Source.prototype.hasOwnProperty(property)) {
            result[property] = Source.prototype[property];
        }
    }
    return result;
}(AutoLoadMore));
