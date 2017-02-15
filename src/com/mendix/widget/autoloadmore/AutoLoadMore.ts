import * as dojoDeclare from "dojo/_base/declare";
import * as WidgetBase from "mxui/widget/_WidgetBase";

import * as dojoAspect from "dojo/aspect";
import * as domStyle from "dojo/dom-style";
import * as domClass from "dojo/dom-class";
import * as registry from "dijit/registry";

import "./ui/AutoLoadMore.css";

interface ListView extends mxui.widget._WidgetBase {
    _datasource: { _setSize: number, atEnd: () => boolean };
    _loadMore: () => void;
    _onLoad: () => void;
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
        this.targetNode = this.findTargetListView(this.targetName, this.domNode);
        if (this.targetNode) {
            this.targetWidget = registry.byNode(this.targetNode);
            const isValid = this.verifyWidget();
            if (isValid) {
                this.transformListView(this.targetNode, this.targetWidget, this.autoLoadClass);
            }
        }
    }

    private findTargetListView(targetName: string, domNode: HTMLElement): HTMLElement | null {
        let queryNode = domNode.parentNode as HTMLElement;
        let targetNode: HTMLElement | null = null;
        while (!targetNode) {
            targetNode = queryNode.querySelector(`.mx-name-${targetName}`) as HTMLElement;
            if (window.document.isEqualNode(queryNode)) break;
            queryNode = queryNode.parentNode as HTMLElement;
        }

        if (!targetNode) {
            window.mx.ui.error(`Unable to find listview with the name "${targetName}"`);
        }

        return targetNode;
    }

    private verifyWidget(): boolean {
        let valid = false;
        if (this.targetWidget && this.targetWidget.declaredClass === "mxui.widget.ListView") {
            if (this.targetWidget._onLoad && this.targetWidget._loadMore) {
                valid = true;
            } else {
                window.mx.ui.error("This Mendix version is incompatible with the auto load more widget");
            }
        } else {
            window.mx.ui.error(`Supplied target name "${this.targetName}" is not of the type listview`);
        }

        return valid;
    }

    private transformListView(targetNode: HTMLElement, targetWidget: ListView, customClass: string) {
        dojoAspect.after(targetWidget, "_onLoad", () => {
            if (!targetWidget._datasource.atEnd()) {
                domClass.add(targetNode, customClass);
                domStyle.set(targetNode, "height", `${targetNode.offsetHeight}px`);
                targetWidget._loadMore();
            }
        });
        this.registerEvents();
    }

    private registerEvents() {
        if (this.targetNode) {
            this.targetNode.addEventListener("scroll", () => this.onScroll());
        }
    }

    private onScroll() {
        if (!this.isScrolling && !this.targetWidget._datasource.atEnd()) {
            window.requestAnimationFrame(() => this.loadMore());
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
