sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (
    Controller,
    Fragment,
    Filter,
    FilterOperator,
    JSONModel,
    MessageToast,
    MessageBox
) {

    "use strict";

    return Controller.extend(
        "dealermangement.controller.Dealer",
        {

            // =========================================================
            // INIT
            // =========================================================

            onInit: function () {

                this._sBatchGroupId = "dealerBatchGroup";

                this._oDealerDialog = null;

                this._aChangedContexts = [];

                this._bEditMode = false;

                this.getView().setModel(
                    new JSONModel({
                        dealerName: "",
                        dealerType: "DEALER",
                        gstNumber: "",
                        panNumber: "",
                        phone: "",
                        email: "",
                        address: "",
                        city: "",
                        state: "",
                        country: "India",
                        remarks: ""
                    }),
                    "createDealer"
                );
            },


            // =========================================================
            // REFRESH
            // =========================================================

            onRefresh: async function () {

                const oTable =
                    this.byId("dealerTable");

                if (!oTable) {
                    return;
                }

                const oBinding =
                    oTable.getBinding("items");

                if (!oBinding) {
                    return;
                }

                try {

                    await oBinding.requestRefresh();

                    MessageToast.show(
                        "Dealer data refreshed"
                    );

                } catch (oError) {

                    console.error(
                        "Refresh error:",
                        oError
                    );

                    MessageBox.error(
                        "Unable to refresh dealer data.\n\n" +
                        this._getErrorMessage(oError)
                    );
                }
            },


            // =========================================================
            // SEARCH
            // =========================================================

            onSearch: function (oEvent) {

                const sValue =
                    oEvent.getParameter("newValue") || "";

                this._applyFilters(
                    sValue
                );
            },


            // =========================================================
            // STATUS FILTER
            // =========================================================

            onStatusFilterChange: function () {

                const oSearch =
                    this.byId("dealerSearchField");

                const sSearch =
                    oSearch
                        ? oSearch.getValue()
                        : "";

                this._applyFilters(
                    sSearch
                );
            },


            // =========================================================
            // DEALER TYPE FILTER
            // =========================================================

            onDealerTypeFilterChange: function () {

                const oSearch =
                    this.byId("dealerSearchField");

                const sSearch =
                    oSearch
                        ? oSearch.getValue()
                        : "";

                this._applyFilters(
                    sSearch
                );
            },


            // =========================================================
            // APPLY FILTERS
            // =========================================================

            _applyFilters: function (
                sSearchValue
            ) {

                const aFilters = [];


                const oStatus =
                    this.byId(
                        "statusFilterSelect"
                    );

                const oType =
                    this.byId(
                        "dealerTypeFilterSelect"
                    );


                const sStatus =
                    oStatus
                        ? oStatus.getSelectedKey()
                        : "ALL";


                const sType =
                    oType
                        ? oType.getSelectedKey()
                        : "ALL";


                // -----------------------------------------------------
                // SEARCH
                // -----------------------------------------------------

                if (
                    sSearchValue &&
                    sSearchValue.trim()
                ) {

                    const sSearch =
                        sSearchValue
                            .trim();


                    aFilters.push(

                        new Filter({
                            filters: [

                                new Filter(
                                    "dealerCode",
                                    FilterOperator.Contains,
                                    sSearch
                                ),

                                new Filter(
                                    "dealerName",
                                    FilterOperator.Contains,
                                    sSearch
                                ),

                                new Filter(
                                    "gstNumber",
                                    FilterOperator.Contains,
                                    sSearch
                                ),

                                new Filter(
                                    "panNumber",
                                    FilterOperator.Contains,
                                    sSearch
                                ),

                                new Filter(
                                    "city",
                                    FilterOperator.Contains,
                                    sSearch
                                ),

                                new Filter(
                                    "state",
                                    FilterOperator.Contains,
                                    sSearch
                                )

                            ],
                            and: false
                        })
                    );
                }


                // -----------------------------------------------------
                // STATUS
                // -----------------------------------------------------

                if (
                    sStatus &&
                    sStatus !== "ALL"
                ) {

                    aFilters.push(
                        new Filter(
                            "status",
                            FilterOperator.EQ,
                            sStatus
                        )
                    );
                }


                // -----------------------------------------------------
                // DEALER TYPE
                // -----------------------------------------------------

                if (
                    sType &&
                    sType !== "ALL"
                ) {

                    aFilters.push(
                        new Filter(
                            "dealerType",
                            FilterOperator.EQ,
                            sType
                        )
                    );
                }


                const oTable =
                    this.byId(
                        "dealerTable"
                    );

                if (!oTable) {
                    return;
                }


                const oBinding =
                    oTable.getBinding(
                        "items"
                    );


                if (oBinding) {

                    oBinding.filter(
                        aFilters,
                        "Application"
                    );
                }
            },


            // =========================================================
            // CLEAR FILTERS
            // =========================================================

            onClearFilters: function () {

                const oSearch =
                    this.byId(
                        "dealerSearchField"
                    );

                const oStatus =
                    this.byId(
                        "statusFilterSelect"
                    );

                const oType =
                    this.byId(
                        "dealerTypeFilterSelect"
                    );


                if (oSearch) {
                    oSearch.setValue("");
                }


                if (oStatus) {
                    oStatus.setSelectedKey(
                        "ALL"
                    );
                }


                if (oType) {
                    oType.setSelectedKey(
                        "ALL"
                    );
                }


                const oTable =
                    this.byId(
                        "dealerTable"
                    );


                if (oTable) {

                    const oBinding =
                        oTable.getBinding(
                            "items"
                        );

                    if (oBinding) {

                        oBinding.filter(
                            [],
                            "Application"
                        );
                    }
                }


                MessageToast.show(
                    "Filters cleared"
                );
            },


            // =========================================================
            // SELECTION CHANGE
            // =========================================================

            onSelectionChange: function () {

                const oTable =
                    this.byId(
                        "dealerTable"
                    );


                if (!oTable) {
                    return;
                }


                const aSelected =
                    oTable.getSelectedItems();


                const iCount =
                    aSelected.length;


                const oDelete =
                    this.byId(
                        "deleteDealerButton"
                    );

                const oEdit =
                    this.byId(
                        "editDealerButton"
                    );

                const oMultipleEdit =
                    this.byId(
                        "multipleEditButton"
                    );


                if (oDelete) {

                    oDelete.setEnabled(
                        iCount > 0
                    );
                }


                if (oEdit) {

                    oEdit.setEnabled(
                        iCount === 1
                    );
                }


                if (oMultipleEdit) {

                    oMultipleEdit.setEnabled(
                        iCount > 0
                    );
                }
            },


            // =========================================================
            // CREATE DEALER
            // =========================================================

            onCreateDealer: async function () {

                try {

                    const oCreateModel =
                        this.getView()
                            .getModel(
                                "createDealer"
                            );


                    oCreateModel.setData({

                        dealerName: "",

                        dealerType: "DEALER",

                        gstNumber: "",

                        panNumber: "",

                        phone: "",

                        email: "",

                        address: "",

                        city: "",

                        state: "",

                        country: "India",

                        remarks: ""
                    });


                    if (!this._oDealerDialog) {

                        this._oDealerDialog =
                            await Fragment.load({

                                id:
                                    this.getView()
                                        .getId(),

                                name:
                                    "dealermangement.fragment.DealerDialog",

                                controller:
                                    this
                            });


                        this.getView()
                            .addDependent(
                                this._oDealerDialog
                            );
                    }


                    this._clearDialogValidation();

                    this._oDealerDialog.open();


                } catch (oError) {

                    console.error(
                        "Create dialog error:",
                        oError
                    );

                    MessageBox.error(
                        "Unable to open Create Dealer dialog.\n\n" +
                        this._getErrorMessage(
                            oError
                        )
                    );
                }
            },


            // =========================================================
            // CLEAR DIALOG VALIDATION
            // =========================================================

            _clearDialogValidation: function () {

                const aIds = [

                    "dealerNameInpput",

                    "gstInput",

                    "panInput",

                    "phoneInnput",

                    "emailInput",

                    "addressInput",

                    "cityInnput",

                    "stateInnput",

                    "countryInput",

                    "remarksInput"
                ];


                aIds.forEach(
                    function (sId) {

                        const oControl =
                            this.byId(sId);


                        if (
                            oControl &&
                            typeof oControl
                                .setValueState ===
                            "function"
                        ) {

                            oControl.setValueState(
                                "None"
                            );
                        }

                    }.bind(this)
                );
            },


            // =========================================================
            // SAVE NEW DEALER
            // =========================================================

            onSaveDealer: async function () {

                const oCreateModel =
                    this.getView()
                        .getModel(
                            "createDealer"
                        );


                if (!oCreateModel) {

                    MessageBox.error(
                        "Create Dealer model is not available."
                    );

                    return;
                }


                const oData =
                    oCreateModel.getData();


                // =====================================================
                // DEALER NAME
                // =====================================================

                const oName =
                    this.byId(
                        "dealerNameInpput"
                    );


                if (
                    !oData.dealerName ||
                    !oData.dealerName.trim()
                ) {

                    oName.setValueState(
                        "Error"
                    );

                    oName.setValueStateText(
                        "Dealer Name is required."
                    );

                    MessageBox.error(
                        "Dealer Name is required."
                    );

                    return;
                }


                oName.setValueState(
                    "None"
                );


                // =====================================================
                // GST
                // =====================================================

                const sGST =
                    (oData.gstNumber || "")
                        .trim()
                        .toUpperCase();


                const gstRegex =
                    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;


                const oGST =
                    this.byId(
                        "gstInput"
                    );


                if (!gstRegex.test(sGST)) {

                    oGST.setValueState(
                        "Error"
                    );

                    oGST.setValueStateText(
                        "Enter a valid GST Number."
                    );

                    MessageBox.error(
                        "Invalid GST Number.\n\n" +
                        "Example: 27ABCDE1234F1Z5"
                    );

                    return;
                }


                oGST.setValueState(
                    "None"
                );


                // =====================================================
                // PAN
                // =====================================================

                const sPAN =
                    (oData.panNumber || "")
                        .trim()
                        .toUpperCase();


                const panRegex =
                    /^[A-Z]{5}[0-9]{4}[A-Z]$/;


                const oPAN =
                    this.byId(
                        "panInput"
                    );


                if (!panRegex.test(sPAN)) {

                    oPAN.setValueState(
                        "Error"
                    );

                    oPAN.setValueStateText(
                        "Enter a valid PAN Number."
                    );

                    MessageBox.error(
                        "Invalid PAN Number.\n\n" +
                        "Example: ABCDE1234F"
                    );

                    return;
                }


                oPAN.setValueState(
                    "None"
                );


                // =====================================================
                // PHONE
                // =====================================================

                const sPhone =
                    (oData.phone || "")
                        .trim();


                const phoneRegex =
                    /^[6-9][0-9]{9}$/;


                const oPhone =
                    this.byId(
                        "phoneInnput"
                    );


                if (!phoneRegex.test(sPhone)) {

                    oPhone.setValueState(
                        "Error"
                    );

                    oPhone.setValueStateText(
                        "Enter a valid 10 digit mobile number."
                    );

                    MessageBox.error(
                        "Invalid Phone Number.\n\n" +
                        "Enter a valid 10 digit mobile number."
                    );

                    return;
                }


                oPhone.setValueState(
                    "None"
                );


                // =====================================================
                // CREATE DATA
                // =====================================================

                const oTable =
                    this.byId(
                        "dealerTable"
                    );


                const oBinding =
                    oTable.getBinding(
                        "items"
                    );


                if (!oBinding) {

                    MessageBox.error(
                        "Dealer table binding is not available."
                    );

                    return;
                }


                try {

                    /*
                     * dealerCode intentionally
                     * NOT sent.
                     *
                     * Backend generates it.
                     */

                    const oCreateData = {

                        dealerName:
                            oData.dealerName
                                .trim(),

                        dealerType:
                            oData.dealerType,

                        gstNumber:
                            sGST,

                        panNumber:
                            sPAN,

                        phone:
                            sPhone,

                        email:
                            oData.email
                                ? oData.email.trim()
                                : null,

                        address:
                            oData.address
                                ? oData.address.trim()
                                : null,

                        city:
                            oData.city
                                ? oData.city.trim()
                                : null,

                        state:
                            oData.state
                                ? oData.state.trim()
                                : null,

                        country:
                            oData.country
                                ? oData.country.trim()
                                : "India",

                        remarks:
                            oData.remarks
                                ? oData.remarks.trim()
                                : null
                    };


                    const oContext =
                        oBinding.create(
                            oCreateData,
                            true
                        );


                    await this.getView()
                        .getModel()
                        .submitBatch(
                            this._sBatchGroupId
                        );


                    await oContext.created();


                    this._oDealerDialog.close();


                    await oBinding.requestRefresh();


                    MessageToast.show(
                        "Dealer created successfully"
                    );


                } catch (oError) {

                    console.error(
                        "Create dealer error:",
                        oError
                    );

                    MessageBox.error(
                        "Unable to create dealer.\n\n" +
                        this._getErrorMessage(
                            oError
                        )
                    );
                }
            },


            // =========================================================
            // CLOSE DIALOG
            // =========================================================

            onCloseDealer: function () {

                if (this._oDealerDialog) {

                    this._clearDialogValidation();

                    this._oDealerDialog.close();
                }
            },


            // =========================================================
            // SINGLE EDIT
            // =========================================================

            onEditDealer: function () {

                const oTable =
                    this.byId(
                        "dealerTable"
                    );


                const aSelected =
                    oTable.getSelectedItems();


                if (aSelected.length !== 1) {

                    MessageToast.show(
                        "Select exactly one dealer to edit"
                    );

                    return;
                }


                this._bEditMode = true;


                this._setRowEditable(
                    aSelected[0],
                    true
                );


                this._aChangedContexts = [];


                this._enableSaveButtons();


                MessageToast.show(
                    "Dealer is ready for editing"
                );
            },


            // =========================================================
            // MULTIPLE EDIT
            // =========================================================

            onMultipleEdit: function () {

                const oTable =
                    this.byId(
                        "dealerTable"
                    );


                const aSelected =
                    oTable.getSelectedItems();


                if (aSelected.length === 0) {

                    MessageToast.show(
                        "Select dealer(s) for multiple edit"
                    );

                    return;
                }


                this._bEditMode = true;


                this._aChangedContexts = [];


                aSelected.forEach(
                    function (oItem) {

                        this._setRowEditable(
                            oItem,
                            true
                        );

                    }.bind(this)
                );


                this._enableSaveButtons();


                MessageToast.show(
                    aSelected.length +
                    " dealer(s) ready for multiple edit"
                );
            },


            // =========================================================
            // SET ROW EDITABLE
            // =========================================================

            _setRowEditable: function (
                oItem,
                bEditable
            ) {

                if (!oItem) {
                    return;
                }


                const aCells =
                    oItem.getCells();


                /*
                 * Cell positions from current view:
                 *
                 * 0 Dealer Code
                 * 1 Dealer Name
                 * 2 Dealer Type
                 * 3 GST
                 * 4 PAN
                 * 5 Phone
                 * 6 Location
                 * 7 Status
                 * 8 Navigation
                 */


                // -----------------------------------------------------
                // DEALER NAME
                // -----------------------------------------------------

                if (
                    aCells[1] &&
                    typeof aCells[1]
                        .setEditable ===
                    "function"
                ) {

                    aCells[1].setEditable(
                        bEditable
                    );
                }


                // -----------------------------------------------------
                // DEALER TYPE
                // Select uses ENABLED, not EDITABLE
                // -----------------------------------------------------

                if (
                    aCells[2] &&
                    typeof aCells[2]
                        .setEnabled ===
                    "function"
                ) {

                    aCells[2].setEnabled(
                        bEditable
                    );
                }


                // -----------------------------------------------------
                // GST
                // -----------------------------------------------------

                if (
                    aCells[3] &&
                    typeof aCells[3]
                        .setEditable ===
                    "function"
                ) {

                    aCells[3].setEditable(
                        bEditable
                    );
                }


                // -----------------------------------------------------
                // PAN
                // -----------------------------------------------------

                if (
                    aCells[4] &&
                    typeof aCells[4]
                        .setEditable ===
                    "function"
                ) {

                    aCells[4].setEditable(
                        bEditable
                    );
                }


                // -----------------------------------------------------
                // PHONE
                // -----------------------------------------------------

                if (
                    aCells[5] &&
                    typeof aCells[5]
                        .setEditable ===
                    "function"
                ) {

                    aCells[5].setEditable(
                        bEditable
                    );
                }


                // -----------------------------------------------------
                // LOCATION
                // ONE INPUT ONLY
                // -----------------------------------------------------

                if (
                    aCells[6] &&
                    typeof aCells[6]
                        .setEditable ===
                    "function"
                ) {

                    aCells[6].setEditable(
                        bEditable
                    );
                }


                // -----------------------------------------------------
                // CLEAR ERROR STATE
                // -----------------------------------------------------

                [
                    aCells[1],
                    aCells[3],
                    aCells[4],
                    aCells[5],
                    aCells[6]
                ].forEach(
                    function (oControl) {

                        if (
                            oControl &&
                            typeof oControl
                                .setValueState ===
                            "function"
                        ) {

                            oControl.setValueState(
                                "None"
                            );
                        }
                    }
                );
            },


            // =========================================================
            // SAVE BUTTONS
            // =========================================================

            _enableSaveButtons: function () {

                const oSave =
                    this.byId(
                        "saveAllButton"
                    );

                const oCancel =
                    this.byId(
                        "cancelChangesButton"
                    );

                const oStatus =
                    this.byId(
                        "batchStatusText"
                    );


                if (oSave) {
                    oSave.setEnabled(true);
                }


                if (oCancel) {
                    oCancel.setEnabled(true);
                }


                if (oStatus) {
                    oStatus.setVisible(true);
                }
            },


            // =========================================================
            // FIELD CHANGE
            // =========================================================

            onDealerFieldChange: function (
                oEvent
            ) {

                const oControl =
                    oEvent.getSource();


                const oContext =
                    oControl.getBindingContext();


                if (!oContext) {
                    return;
                }


                this._addChangedContext(
                    oContext
                );
            },


            // =========================================================
            // LOCATION CHANGE
            // =========================================================

            onLocationChange: function (
                oEvent
            ) {

                const oInput =
                    oEvent.getSource();


                const oContext =
                    oInput.getBindingContext();


                if (!oContext) {
                    return;
                }


                const sLocation =
                    oInput
                        .getValue()
                        .trim();


                if (!sLocation) {

                    oInput.setValueState(
                        "Error"
                    );

                    oInput.setValueStateText(
                        "Location is required."
                    );

                    this._addChangedContext(
                        oContext
                    );

                    return;
                }


                oInput.setValueState(
                    "None"
                );


                const aParts =
                    sLocation.split(",");


                const sCity =
                    aParts[0]
                        ? aParts[0].trim()
                        : "";


                const sState =
                    aParts.length > 1
                        ? aParts
                            .slice(1)
                            .join(",")
                            .trim()
                        : "";


                oContext.setProperty(
                    "city",
                    sCity
                );


                oContext.setProperty(
                    "state",
                    sState
                );


                this._addChangedContext(
                    oContext
                );
            },


            // =========================================================
            // TRACK CHANGES
            // =========================================================

            _addChangedContext: function (
                oContext
            ) {

                if (
                    this._aChangedContexts
                        .indexOf(oContext) === -1
                ) {

                    this._aChangedContexts.push(
                        oContext
                    );
                }


                this._enableSaveButtons();
            },


            // =========================================================
            // SAVE ALL CHANGES
            // =========================================================

            onSaveAll: async function () {

                const oModel =
                    this.getView()
                        .getModel();


                if (!oModel) {

                    MessageBox.error(
                        "OData model is not available."
                    );

                    return;
                }


                const oTable =
                    this.byId(
                        "dealerTable"
                    );


                if (!oTable) {

                    MessageBox.error(
                        "Dealer table is not available."
                    );

                    return;
                }


                if (
                    !oModel.hasPendingChanges()
                ) {

                    MessageToast.show(
                        "No changes to save"
                    );

                    return;
                }


                // =====================================================
                // VALIDATE CHANGED ROWS
                // =====================================================

                for (
                    const oContext
                    of this._aChangedContexts
                ) {

                    const oItem =
                        oTable
                            .getItems()
                            .find(
                                function (oRow) {

                                    return (
                                        oRow
                                            .getBindingContext() ===
                                        oContext
                                    );

                                }
                            );


                    if (!oItem) {
                        continue;
                    }


                    const aCells =
                        oItem.getCells();


                    // =================================================
                    // GST
                    // =================================================

                    const oGST =
                        aCells[3];


                    if (
                        oGST &&
                        typeof oGST.getValue ===
                        "function"
                    ) {

                        const sGST =
                            oGST
                                .getValue()
                                .trim()
                                .toUpperCase();


                        const gstRegex =
                            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;


                        if (!sGST) {

                            oGST.setValueState(
                                "Error"
                            );

                            oGST.setValueStateText(
                                "GST Number is required."
                            );


                            MessageBox.error(
                                "GST Number is required."
                            );

                            return;
                        }


                        if (
                            !gstRegex.test(
                                sGST
                            )
                        ) {

                            oGST.setValueState(
                                "Error"
                            );

                            oGST.setValueStateText(
                                "Enter a valid GST Number."
                            );


                            MessageBox.error(
                                "Invalid GST Number.\n\n" +
                                "Example: 27ABCDE1234F1Z5"
                            );

                            return;
                        }


                        oGST.setValueState(
                            "None"
                        );


                        oGST.setValue(
                            sGST
                        );


                        oContext.setProperty(
                            "gstNumber",
                            sGST
                        );
                    }


                    // =================================================
                    // PAN
                    // =================================================

                    const oPAN =
                        aCells[4];


                    if (
                        oPAN &&
                        typeof oPAN.getValue ===
                        "function"
                    ) {

                        const sPAN =
                            oPAN
                                .getValue()
                                .trim()
                                .toUpperCase();


                        const panRegex =
                            /^[A-Z]{5}[0-9]{4}[A-Z]$/;


                        if (!sPAN) {

                            oPAN.setValueState(
                                "Error"
                            );

                            oPAN.setValueStateText(
                                "PAN Number is required."
                            );


                            MessageBox.error(
                                "PAN Number is required."
                            );

                            return;
                        }


                        if (
                            !panRegex.test(
                                sPAN
                            )
                        ) {

                            oPAN.setValueState(
                                "Error"
                            );

                            oPAN.setValueStateText(
                                "Enter a valid PAN Number."
                            );


                            MessageBox.error(
                                "Invalid PAN Number.\n\n" +
                                "Example: ABCDE1234F"
                            );

                            return;
                        }


                        oPAN.setValueState(
                            "None"
                        );


                        oPAN.setValue(
                            sPAN
                        );


                        oContext.setProperty(
                            "panNumber",
                            sPAN
                        );
                    }


                    // =================================================
                    // PHONE
                    // =================================================

                    const oPhone =
                        aCells[5];


                    if (
                        oPhone &&
                        typeof oPhone.getValue ===
                        "function"
                    ) {

                        const sPhone =
                            oPhone
                                .getValue()
                                .trim();


                        const phoneRegex =
                            /^[6-9][0-9]{9}$/;


                        if (!sPhone) {

                            oPhone.setValueState(
                                "Error"
                            );

                            oPhone.setValueStateText(
                                "Phone number is required."
                            );


                            MessageBox.error(
                                "Phone number is required."
                            );

                            return;
                        }


                        if (
                            !phoneRegex.test(
                                sPhone
                            )
                        ) {

                            oPhone.setValueState(
                                "Error"
                            );

                            oPhone.setValueStateText(
                                "Enter a valid 10 digit mobile number."
                            );


                            MessageBox.error(
                                "Invalid Phone Number.\n\n" +
                                "Enter a valid 10 digit mobile number."
                            );

                            return;
                        }


                        oPhone.setValueState(
                            "None"
                        );


                        oContext.setProperty(
                            "phone",
                            sPhone
                        );
                    }


                    // =================================================
                    // LOCATION
                    // =================================================

                    const oLocation =
                        aCells[6];


                    if (
                        oLocation &&
                        typeof oLocation.getValue ===
                        "function"
                    ) {

                        const sLocation =
                            oLocation
                                .getValue()
                                .trim();


                        if (!sLocation) {

                            oLocation.setValueState(
                                "Error"
                            );

                            oLocation.setValueStateText(
                                "Location is required."
                            );


                            MessageBox.error(
                                "Location is required."
                            );

                            return;
                        }


                        oLocation.setValueState(
                            "None"
                        );


                        const aParts =
                            sLocation.split(",");


                        const sCity =
                            aParts[0]
                                ? aParts[0].trim()
                                : "";


                        const sState =
                            aParts.length > 1
                                ? aParts
                                    .slice(1)
                                    .join(",")
                                    .trim()
                                : "";


                        oContext.setProperty(
                            "city",
                            sCity
                        );


                        oContext.setProperty(
                            "state",
                            sState
                        );
                    }
                }


                // =====================================================
                // SUBMIT BATCH
                // =====================================================

                try {

                    this.getView()
                        .setBusy(true);


                    await oModel.submitBatch(
                        this._sBatchGroupId
                    );


                    const oBinding =
                        oTable.getBinding(
                            "items"
                        );


                    if (oBinding) {

                        await oBinding.requestRefresh();
                    }


                    this._aChangedContexts = [];

                    this._bEditMode = false;


                    this._setAllRowsEditable(
                        false
                    );


                    const oSave =
                        this.byId(
                            "saveAllButton"
                        );

                    const oCancel =
                        this.byId(
                            "cancelChangesButton"
                        );

                    const oStatus =
                        this.byId(
                            "batchStatusText"
                        );


                    if (oSave) {
                        oSave.setEnabled(false);
                    }


                    if (oCancel) {
                        oCancel.setEnabled(false);
                    }


                    if (oStatus) {
                        oStatus.setVisible(false);
                    }


                    oTable.removeSelections(
                        true
                    );


                    this.onSelectionChange();


                    this.getView()
                        .setBusy(false);


                    MessageToast.show(
                        "All dealer changes saved successfully"
                    );


                } catch (oError) {

                    this.getView()
                        .setBusy(false);


                    console.error(
                        "Save error:",
                        oError
                    );


                    MessageBox.error(
                        "Unable to save changes.\n\n" +
                        this._getErrorMessage(
                            oError
                        )
                    );
                }
            },


            // =========================================================
            // CANCEL CHANGES
            // =========================================================

            onCancelChanges: function () {

                const oModel =
                    this.getView()
                        .getModel();


                if (oModel) {

                    oModel.resetChanges(
                        this._sBatchGroupId
                    );
                }


                this._aChangedContexts = [];

                this._bEditMode = false;


                this._setAllRowsEditable(
                    false
                );


                const oSave =
                    this.byId(
                        "saveAllButton"
                    );

                const oCancel =
                    this.byId(
                        "cancelChangesButton"
                    );

                const oStatus =
                    this.byId(
                        "batchStatusText"
                    );


                if (oSave) {
                    oSave.setEnabled(false);
                }


                if (oCancel) {
                    oCancel.setEnabled(false);
                }


                if (oStatus) {
                    oStatus.setVisible(false);
                }


                const oTable =
                    this.byId(
                        "dealerTable"
                    );


                if (oTable) {

                    oTable.removeSelections(
                        true
                    );

                    this.onSelectionChange();
                }


                MessageToast.show(
                    "Changes cancelled"
                );
            },


            // =========================================================
            // MAKE ALL ROWS READ ONLY
            // =========================================================

            _setAllRowsEditable: function (
                bEditable
            ) {

                const oTable =
                    this.byId(
                        "dealerTable"
                    );


                if (!oTable) {
                    return;
                }


                oTable
                    .getItems()
                    .forEach(
                        function (oItem) {

                            this._setRowEditable(
                                oItem,
                                bEditable
                            );

                        }.bind(this)
                    );
            },


            // =========================================================
            // DELETE
            // =========================================================

            onDeleteDealer: function () {

                const oTable =
                    this.byId(
                        "dealerTable"
                    );


                const aSelected =
                    oTable.getSelectedItems();


                if (aSelected.length === 0) {

                    MessageToast.show(
                        "Select dealer(s) to delete"
                    );

                    return;
                }


                const iCount =
                    aSelected.length;


                MessageBox.confirm(

                    "Are you sure you want to delete " +
                    iCount +
                    " selected dealer(s)?",

                    {

                        title:
                            "Delete Dealer",

                        emphasizedAction:
                            MessageBox.Action.OK,

                        onClose:
                            async function (
                                sAction
                            ) {

                                if (
                                    sAction !==
                                    MessageBox.Action.OK
                                ) {

                                    return;
                                }


                                try {

                                    const oModel =
                                        this.getView()
                                            .getModel();


                                    const aDeletePromises =
                                        [];


                                    aSelected.forEach(
                                        function (
                                            oItem
                                        ) {

                                            const oContext =
                                                oItem
                                                    .getBindingContext();


                                            if (
                                                !oContext
                                            ) {
                                                return;
                                            }


                                            aDeletePromises.push(
                                                oContext.delete(
                                                    this._sBatchGroupId
                                                )
                                            );

                                        }.bind(this)
                                    );


                                    await oModel
                                        .submitBatch(
                                            this._sBatchGroupId
                                        );


                                    await Promise.all(
                                        aDeletePromises
                                    );


                                    const oBinding =
                                        oTable
                                            .getBinding(
                                                "items"
                                            );


                                    if (oBinding) {

                                        await oBinding
                                            .requestRefresh();
                                    }


                                    oTable
                                        .removeSelections(
                                            true
                                        );


                                    this.onSelectionChange();


                                    MessageToast.show(
                                        iCount +
                                        " dealer(s) deleted successfully"
                                    );


                                } catch (oError) {

                                    console.error(
                                        "Delete error:",
                                        oError
                                    );


                                    MessageBox.error(
                                        "Dealer deletion failed.\n\n" +
                                        this._getErrorMessage(
                                            oError
                                        )
                                    );
                                }

                            }.bind(this)
                    }
                );
            },


            // =========================================================
            // OPEN OBJECT PAGE
            // =========================================================

            onViewDealer: function (
                oEvent
            ) {

                try {

                    const oSource =
                        oEvent.getSource();


                    const oContext =
                        oSource
                            .getBindingContext();


                    if (!oContext) {

                        MessageBox.error(
                            "Dealer information is not available."
                        );

                        return;
                    }


                    const sDealerId =
                        oContext.getProperty(
                            "ID"
                        );


                    if (!sDealerId) {

                        MessageBox.error(
                            "Dealer ID is missing."
                        );

                        return;
                    }


                    this.getOwnerComponent()
                        .getRouter()
                        .navTo(
                            "DealerDetails",
                            {
                                dealerId:
                                    String(
                                        sDealerId
                                    )
                            }
                        );


                } catch (oError) {

                    console.error(
                        "Navigation error:",
                        oError
                    );


                    MessageBox.error(
                        "Unable to open Dealer Details.\n\n" +
                        this._getErrorMessage(
                            oError
                        )
                    );
                }
            },


            // =========================================================
            // STATUS COLOR
            // =========================================================

            formatStatusState: function (
                sStatus
            ) {

                if (!sStatus) {
                    return "None";
                }


                switch (
                    String(sStatus)
                        .toUpperCase()
                ) {

                    // GREEN
                    case "ACTIVE":
                    case "L2_APPROVED":
                        return "Success";


                    // ORANGE
                    case "PENDING":
                    case "SUBMITTED":
                        return "Warning";


                    // BLUE
                    case "L1_APPROVED":
                        return "Information";


                    // RED
                    case "REJECTED":
                    case "BLOCKED":
                        return "Error";


                    default:
                        return "None";
                }
            },


            // =========================================================
            // ERROR MESSAGE
            // =========================================================

            _getErrorMessage: function (
                oError
            ) {

                if (
                    oError &&
                    oError.message
                ) {

                    return oError.message;
                }


                if (
                    oError &&
                    oError.cause &&
                    oError.cause.message
                ) {

                    return oError.cause.message;
                }


                if (
                    oError &&
                    oError.responseText
                ) {

                    try {

                        const oResponse =
                            JSON.parse(
                                oError.responseText
                            );


                        if (
                            oResponse.error &&
                            oResponse.error.message
                        ) {

                            return oResponse
                                .error
                                .message;
                        }

                    } catch (e) {

                        // Ignore JSON parse error
                    }
                }


                return "Operation failed.";
            }

        }
    );
});