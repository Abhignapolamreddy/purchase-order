sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/Label",
    "sap/m/TextArea",
    "sap/m/Button"
], function (
    Controller,
    History,
    MessageBox,
    MessageToast,
    Dialog,
    Label,
    TextArea,
    Button
) {

    "use strict";

    return Controller.extend(
        "dealermangement.controller.DealerDetails",
        {

            onInit: function () {

                const oRouter =
                    this.getOwnerComponent()
                        .getRouter();

                oRouter
                    .getRoute("DealerDetails")
                    .attachPatternMatched(
                        this._onRouteMatched,
                        this
                    );
            },

            _onRouteMatched: function (oEvent) {

                const oArguments =
                    oEvent.getParameter("arguments");

                const sDealerId =
                    oArguments.dealerId;

                console.log(
                    "Dealer ID:",
                    sDealerId
                );

                if (!sDealerId) {
                    MessageBox.error(
                        "Dealer ID is missing."
                    );
                    return;
                }

                const oModel =
                    this.getOwnerComponent()
                        .getModel();

                if (!oModel) {
                    MessageBox.error(
                        "OData model is not available."
                    );
                    return;
                }

                const sPath =
                    "/Dealers(" + sDealerId + ")";

                console.log(
                    "Dealer binding path:",
                    sPath
                );

                const oView =
                    this.getView();

                oView.setBusy(true);

                oView.bindElement({

                    path: sPath,

                    events: {

                        dataRequested:
                            function () {

                                console.log(
                                    "Dealer details loading..."
                                );
                            },

                        dataReceived:
                            function (oEvent) {

                                oView.setBusy(false);

                                console.log(
                                    "Dealer details loaded",
                                    oEvent
                                );
                            },

                        change:
                            function () {

                                console.log(
                                    "Dealer context changed"
                                );
                            }
                    }
                });
            },


            onBack: function () {

                const oHistory =
                    History.getInstance();

                const sPreviousHash =
                    oHistory.getPreviousHash();

                if (
                    sPreviousHash !== undefined
                ) {

                    window.history.go(-1);

                } else {

                    this.getOwnerComponent()
                        .getRouter()
                        .navTo(
                            "RouteDealer",
                            {},
                            true
                        );
                }
            },


            formatStatusState: function (sStatus) {

                switch (sStatus) {

                    case "ACTIVE":
                        return "Success";

                    case "PENDING":
                        return "Warning";

                    case "SUBMITTED":
                        return "Warning";

                    case "L1_APPROVED":
                        return "Information";

                    case "REJECTED":
                        return "Error";

                    case "BLOCKED":
                        return "Error";

                    default:
                        return "None";
                }
            },


            _getDealerContext: function () {

                const oContext =
                    this.getView()
                        .getBindingContext();

                if (!oContext) {

                    MessageBox.error(
                        "Dealer details are not loaded."
                    );

                    return null;
                }

                return oContext;
            },


            onSubmitDealer: function () {

                const oContext =
                    this._getDealerContext();

                if (!oContext) {
                    return;
                }

                MessageBox.confirm(
                    "Are you sure you want to submit this dealer?",
                    {
                        title: "Submit Dealer",

                        emphasizedAction:
                            MessageBox.Action.OK,

                        onClose:
                            async function (sAction) {

                                if (
                                    sAction !==
                                    MessageBox.Action.OK
                                ) {
                                    return;
                                }

                                await this._executeAction(
                                    oContext,
                                    "submitDealer",
                                    {},
                                    "Dealer submitted successfully."
                                );

                            }.bind(this)
                    }
                );
            },


            onL1Approve: function () {

                const oContext =
                    this._getDealerContext();

                if (!oContext) {
                    return;
                }

                this._openRemarksDialog(
                    oContext,
                    "l1Approve",
                    "L1 Approval",
                    "L1 approval completed successfully."
                );
            },


            onL2Approve: function () {

                const oContext =
                    this._getDealerContext();

                if (!oContext) {
                    return;
                }

                this._openRemarksDialog(
                    oContext,
                    "l2Approve",
                    "L2 Approval",
                    "L2 approval completed successfully."
                );
            },


            _openRemarksDialog: function (
                oContext,
                sActionName,
                sTitle,
                sSuccessMessage
            ) {

                const oRemarks =
                    new TextArea({
                        width: "100%",
                        rows: 5,
                        placeholder: "Enter remarks"
                    });

                const oDialog =
                    new Dialog({

                        title: sTitle,

                        contentWidth: "450px",

                        content: [

                            new Label({
                                text: "Remarks"
                            }),

                            oRemarks
                        ],

                        beginButton:
                            new Button({

                                text: "Approve",

                                type: "Emphasized",

                                press:
                                    async function () {

                                        try {

                                            await this._executeAction(
                                                oContext,
                                                sActionName,
                                                {
                                                    remarks:
                                                        oRemarks
                                                            .getValue()
                                                            .trim()
                                                },
                                                sSuccessMessage
                                            );

                                            oDialog.close();
                                            oDialog.destroy();

                                        } catch (oError) {

                                            console.error(
                                                oError
                                            );
                                        }

                                    }.bind(this)
                            }),

                        endButton:
                            new Button({

                                text: "Cancel",

                                press: function () {

                                    oDialog.close();
                                    oDialog.destroy();
                                }
                            })
                    });

                this.getView()
                    .addDependent(oDialog);

                oDialog.open();
            },


            onRejectDealer: function () {

                const oContext =
                    this._getDealerContext();

                if (!oContext) {
                    return;
                }

                const oReason =
                    new TextArea({
                        width: "100%",
                        rows: 5,
                        placeholder:
                            "Enter rejection reason"
                    });

                const oDialog =
                    new Dialog({

                        title: "Reject Dealer",

                        contentWidth: "450px",

                        content: [

                            new Label({
                                text:
                                    "Rejection Reason"
                            }),

                            oReason
                        ],

                        beginButton:
                            new Button({

                                text: "Reject",

                                type: "Reject",

                                press:
                                    async function () {

                                        const sReason =
                                            oReason
                                                .getValue()
                                                .trim();

                                        if (!sReason) {

                                            MessageBox.warning(
                                                "Rejection reason is required."
                                            );

                                            return;
                                        }

                                        try {

                                            await this._executeAction(
                                                oContext,
                                                "rejectDealer",
                                                {
                                                    reason:
                                                        sReason
                                                },
                                                "Dealer rejected successfully."
                                            );

                                            oDialog.close();
                                            oDialog.destroy();

                                        } catch (oError) {

                                            console.error(
                                                oError
                                            );
                                        }

                                    }.bind(this)
                            }),

                        endButton:
                            new Button({

                                text: "Cancel",

                                press: function () {

                                    oDialog.close();
                                    oDialog.destroy();
                                }
                            })
                    });

                this.getView()
                    .addDependent(oDialog);

                oDialog.open();
            },


            onBlockDealer: function () {

                const oContext =
                    this._getDealerContext();

                if (!oContext) {
                    return;
                }

                const oReason =
                    new TextArea({
                        width: "100%",
                        rows: 4,
                        placeholder:
                            "Enter block reason"
                    });

                const oRemarks =
                    new TextArea({
                        width: "100%",
                        rows: 3,
                        placeholder:
                            "Enter remarks"
                    });

                const oDialog =
                    new Dialog({

                        title: "Block Dealer",

                        contentWidth: "450px",

                        content: [

                            new Label({
                                text:
                                    "Block Reason"
                            }),

                            oReason,

                            new Label({
                                text: "Remarks"
                            }),

                            oRemarks
                        ],

                        beginButton:
                            new Button({

                                text: "Block",

                                type: "Reject",

                                press:
                                    async function () {

                                        const sReason =
                                            oReason
                                                .getValue()
                                                .trim();

                                        if (!sReason) {

                                            MessageBox.warning(
                                                "Block reason is required."
                                            );

                                            return;
                                        }

                                        try {

                                            await this._executeAction(
                                                oContext,
                                                "blockDealer",
                                                {
                                                    reason:
                                                        sReason,

                                                    remarks:
                                                        oRemarks
                                                            .getValue()
                                                            .trim()
                                                },
                                                "Dealer blocked successfully."
                                            );

                                            oDialog.close();
                                            oDialog.destroy();

                                        } catch (oError) {

                                            console.error(
                                                oError
                                            );
                                        }

                                    }.bind(this)
                            }),

                        endButton:
                            new Button({

                                text: "Cancel",

                                press: function () {

                                    oDialog.close();
                                    oDialog.destroy();
                                }
                            })
                    });

                this.getView()
                    .addDependent(oDialog);

                oDialog.open();
            },


            _executeAction: async function (
                oContext,
                sActionName,
                mParameters,
                sSuccessMessage
            ) {

                try {

                    const oModel =
                        oContext.getModel();

                    const oAction =
                        oModel.bindContext(
                            "DealerService." +
                            sActionName +
                            "(...)",
                            oContext
                        );

                    Object.keys(
                        mParameters || {}
                    ).forEach(function (sParameter) {

                        oAction.setParameter(
                            sParameter,
                            mParameters[sParameter]
                        );
                    });

                    this.getView()
                        .setBusy(true);

                    await oAction.execute();

                    this.getView()
                        .setBusy(false);

                    MessageToast.show(
                        sSuccessMessage
                    );

                    await oContext.requestRefresh();

                } catch (oError) {

                    this.getView()
                        .setBusy(false);

                    console.error(
                        "Action error:",
                        oError
                    );

                    MessageBox.error(
                        oError.message ||
                        "Dealer operation failed."
                    );

                    throw oError;
                }
            }

        }
    );
});