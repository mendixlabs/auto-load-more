import * as dojoDeclare from "dojo/_base/declare";
import * as WidgetBase from "mxui/widget/_WidgetBase";

import * as domStyle from "dojo/dom-style";
import * as domClass from "dojo/dom-class";
import * as registry from "dijit/registry";

import { createElement } from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { Alert } from "./components/Alert";

import "./ui/AutoLoadMore.css";

class AutoLoadMore extends WidgetBase {
    // Widget Properties set from the Mendix modeler
    targetName: string;

    private targetWidget: mxui.widget._WidgetBase | null;
    private targetNode: HTMLElement;
    private autoLoadClass: string;

    postCreate() {
        this.autoLoadClass = "mx-listview-auto-load-more";
        this.findTargetListView();
    }

    uninitialize(): boolean {
        unmountComponentAtNode(this.domNode);

        return true;
    }

    private findTargetListView() {
        let queryNode = this.domNode.parentNode as HTMLElement;
        while (!this.targetNode) {
            this.targetNode = queryNode.querySelector(`.mx-name-${this.targetName}`) as HTMLElement;
            if (window.document.isEqualNode(queryNode)) break;
            queryNode = queryNode.parentNode as HTMLElement;
        }

        if (this.targetNode) {
            this.targetWidget = registry.byNode(this.targetNode);
            this.verifyWidget(this.targetWidget);
        } else {
            this.renderAlert(`Unable to find listview with the name "${this.targetName}"`);
        }
    }

    private verifyWidget(targetWidget: mxui.widget._WidgetBase | null) {
        if (targetWidget && targetWidget.declaredClass === "mxui.widget.ListView") {
            if (typeof (targetWidget as any)._renderData !== "undefined") {
                this.transformWidget();
            } else {
                targetWidget = null;
                this.renderAlert("This Mendix version is incompatible with the auto load more widget");
            }
        } else {
            this.targetWidget = null;
            this.renderAlert(`Supplied target name "${this.targetName}" is not of the type listview`);
        }
    }

    private transformWidget() {
        domClass.add(this.targetNode, this.autoLoadClass);
        setTimeout(() => {
            domStyle.set(this.targetNode, "height", `${this.targetNode.offsetHeight}px`);
            console.log((this.targetWidget as any)._itemList);
            (this.targetWidget as any)._loadMore();
        }, 800);
        this.registerEvents();
    }

    private registerEvents() {
        this.targetNode.onscroll = () => {
            const { clientHeight, scrollHeight, scrollTop } = this.targetNode;
            const scrollPercentage = Math.floor(scrollTop / (scrollHeight - clientHeight)) * 100;
            if (scrollPercentage >= 70) {
                (this.targetWidget as any)._loadMore();
            }
        };
    }

    private renderAlert(message: string) {
        render(createElement(Alert, { message }), this.domNode);
    }
}

// Declare widget prototype the Dojo way
// Thanks to https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/dojo/README.md
// tslint:disable : only-arrow-functions
dojoDeclare("com.mendix.widget.AutoLoadMore.AutoLoadMore", [ WidgetBase ], function(Source: any) {
    const result: any = {};
    for (const property in Source.prototype) {
        if (property !== "constructor" && Source.prototype.hasOwnProperty(property)) {
            result[property] = Source.prototype[property];
        }
    }
    return result;
}(AutoLoadMore));
