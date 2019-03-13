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
        _setSize: number;
        atEnd: () => boolean;
        _pageSize: number;
        _offset: number;
    };
    _loadMore: () => void;
    _onLoad: () => void;
    _renderData: () => void;
}

class AutoLoadMore extends WidgetBase {
    // Widget Properties set from the Mendix modeler
    domNode: HTMLElement;
    targetName: string;
    scrollbar: boolean;

    private targetWidget: ListView;
    private targetNode: HTMLElement | null;
    private listNode: HTMLUListElement;
    private autoLoadClass: string;
    private isScrolling: boolean;
    private timeout: number;

    postCreate() {
        this.onScroll = this.onScroll.bind(this);
        this.loadMore = this.loadMore.bind(this);
        this.preventEventOverload = this.preventEventOverload.bind(this);

        this.autoLoadClass = "mx-listview-auto-load-more";
        this.targetNode = this.findTargetNode(this.targetName, this.domNode);
        if (this.targetNode) {
            this.targetWidget = registry.byNode(this.targetNode);
            this.listNode = this.targetNode.querySelector("ul") as HTMLUListElement;
            if (this.isValidWidget(this.targetWidget)) this.transformListView(this.targetNode);
            if (this.scrollbar) this.addStyleOverflowScroll();

            if (this.listNode) {
                document.addEventListener("scroll", this.preventEventOverload);
            }
        }
    }

    private preventEventOverload(): void {
        if (!this.timeout) {
            this.timeout = setTimeout(() => { this.timeout = 0; }, 200);
            this.onScroll();
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
                && (typeof targetWidget._datasource._setsize !== "undefined"
                    || typeof targetWidget._datasource._setSize !== "undefined")) {
                return true;
            } else {
                this.renderAlert("This Mendix version is incompatible with the auto load more widget");
            }
        } else {
            this.renderAlert(`Supplied target name "${this.targetName}" is not of the type listview`);
        }

        return false;
    }

    private addStyleOverflowScroll(): void {
        domStyle.set(this.listNode, "overflow-y", "scroll");
    }

    private transformListView(targetNode: HTMLElement): void {
        dojoAspect.after(this.targetWidget, "_onLoad", () => {
            if (!this.targetWidget._datasource.atEnd()) {
                domClass.add(targetNode, this.autoLoadClass);
                if (this.scrollbar) domStyle.set(this.listNode, "height", `${this.listNode.offsetHeight}px`);
                dojoAspect.after(this.targetWidget, "_renderData", () => { this.afterRenderData(targetNode); });
                this.targetWidget._loadMore();
            }
        });
    }

    private afterRenderData(targetNode: HTMLElement): void {
        const setSize = typeof this.targetWidget._datasource._setsize !== "undefined"
            ? this.targetWidget._datasource._setsize
            : this.targetWidget._datasource._setSize;

        if (this.targetWidget._datasource._pageSize >= setSize) {
            domClass.remove(targetNode, this.autoLoadClass);
            domStyle.set(this.listNode, "height", "auto");
        }
    }

    private onScroll(): void {
        if (!this.isScrolling && !this.targetWidget._datasource.atEnd()) {
            this.isScrolling = true;
            window.requestAnimationFrame(this.loadMore);
        }
    }

    private loadMore(): void {
        let scrollPercentage = 0;
        const li = this.listNode as HTMLElement;
        if (this.scrollbar) {
            scrollPercentage = Math.floor(li.scrollTop / (li.scrollHeight - li.clientHeight)) * 100;
        } else if (li.getBoundingClientRect().top < 0) {
            const boundTop = li.getBoundingClientRect().top - window.innerHeight / 2;
            scrollPercentage = Math.floor(Math.abs(boundTop) / li.getBoundingClientRect().height * 100);
        }
        if (scrollPercentage >= 60 && this.targetWidget) {
            (mendix.lang as any).runOrDelay(() => { this.targetWidget._loadMore(); }, () => {
                const sourceCount = this.targetWidget._datasource._offset + this.targetWidget._datasource._pageSize;
                return sourceCount === this.listNode.children.length;
            });
        }
        this.isScrolling = false;
    }

    private renderAlert(message: string): void {
        domConstruct.place(
            `<div class='alert alert-danger widget-auto-load-more-alert'>${message}</div>`, this.domNode, "only"
        );
    }
}

// Declare widget prototype the Dojo way
// Thanks to https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/dojo/README.md
// tslint:disable : only-arrow-functions
dojoDeclare("AutoLoadMore.widget.AutoLoadMore", [WidgetBase], function(Source: any) {
    const result: any = {};
    for (const property in Source.prototype) {
        if (property !== "constructor" && Source.prototype.hasOwnProperty(property)) {
            result[property] = Source.prototype[property];
        }
    }
    return result;
}(AutoLoadMore));
