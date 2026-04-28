"use client"

import { useState } from "react"
import { BackButton, Field } from "../components/components.js"
import styles from "../styles/part-b-c.module.css"

// available appliance types for the dropdown
const APPLIANCE_TYPES = ["Fridge", "Washing Machine", "Dishwasher", "Dryer", "Oven", "Microwave"];

export default function PartBC() {

    // state variables for each form field
    const [eircode, setEircode] = useState("");
    const [applianceType, setApplianceType] = useState("");
    const [brand, setBrand] = useState("");
    const [modelNumber, setModelNumber] = useState("");
    const [serialNumber, setSerialNumber] = useState("");
    const [purchaseDate, setPurchaseDate] = useState("");
    const [warrantyDate, setWarrantyDate] = useState("");

    // state variables for error messages per field
    const [eircodeError, setEircodeError] = useState("");
    const [applianceTypeError, setApplianceTypeError] = useState("");
    const [brandError, setBrandError] = useState("");
    const [modelNumberError, setModelNumberError] = useState("");
    const [serialNumberError, setSerialNumberError] = useState("");
    const [purchaseDateError, setPurchaseDateError] = useState("");
    const [warrantyDateError, setWarrantyDateError] = useState("");

    // state for server level errors and success message
    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // resets all the error and success messages before each validation run
    function clearErrors() {
        setEircodeError("");
        setApplianceTypeError("");
        setBrandError("");
        setModelNumberError("");
        setSerialNumberError("");
        setPurchaseDateError("");
        setWarrantyDateError("");
        setServerError("");
        setSuccessMessage("");
    }

    // client side validation. this checks all the fields before sending it to the api
    function validateClient() {
        clearErrors();

        // regex patterns for the eircode, model number and serial number formats
        const eircodeRegex = /^D\d{2}\s?[A-Z0-9]{4}$/;
        const modelRegex = /^\d{3}-\d{3}-\d{4}$/;
        const serialRegex = /^\d{4}-\d{4}-\d{4}$/;

        let valid = true;

        if (!eircodeRegex.test(eircode.trim())) {
            setEircodeError("Eircode must be in the format D00 0000 (e.g. D01 1234)");
            valid = false;
        }

        if (!applianceType) {
            setApplianceTypeError("Please select an appliance type");
            valid = false;
        }

        if (brand.trim() === "") {
            setBrandError("Brand is required");
            valid = false;
        }

        if (!modelRegex.test(modelNumber.trim())) {
            setModelNumberError("Model number must be in the format 000-000-0000");
            valid = false;
        }

        if (!serialRegex.test(serialNumber.trim())) {
            setSerialNumberError("Serial number must be in the format 0000-0000-0000");
            valid = false;5
        }

        if (!purchaseDate) {
            setPurchaseDateError("Purchase date is required");
            valid = false;
        }

        if (!warrantyDate) {
            setWarrantyDateError("Warranty date is required");
            valid = false;
        }

        // ensures that the warranty date is not earlier than the purchase date
        if (purchaseDate && warrantyDate && new Date(warrantyDate) < new Date(purchaseDate)) {
            setWarrantyDateError("Warranty date cannot be earlier than purchase date");
            valid = false;
        }

        return valid;
    }

    // handles form submissions. it first validates from the client side first, then sends it to the api
    async function handleSubmit(event) {
        event.preventDefault();

        // stops submission if the client side validation fails
        if (!validateClient()) {
            return;
        }

        // sends the forms to the POST register endpoint
        const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                eircode,
                applianceType,
                brand,
                modelNumber,
                serialNumber,
                purchaseDate,
                warrantyDate
            })
        });

        const data = await response.json();

        if (data.success) {
            
            // shows a success message and clears the form fields after a successful submission
            setSuccessMessage(
                `${data.savedItem.applianceType} (${data.savedItem.brand}) added for Eircode ${data.savedItem.eircode}`
            );

            setEircode("");
            setApplianceType("");
            setBrand("");
            setModelNumber("");
            setSerialNumber("");
            setPurchaseDate("");
            setWarrantyDate("");
            
        } else {

            // displays the error message sent from the server if form submission fails
            setServerError(data.message);
        }
    }

    return (
        <div className={styles.container}>
            <BackButton />
            <h1 className={styles.title}>House Appliance <br />Inventory</h1>

            {serverError && <p className={styles.error}>{serverError}</p>}
            {successMessage && <p className={styles.success}>{successMessage}</p>}

            <form onSubmit={handleSubmit} noValidate>

                <Field label="Eircode" error={eircodeError}>
                    <input
                        className={styles.input}
                        type="text"
                        placeholder="e.g. D01 1234"
                        maxLength={8}
                        value={eircode}
                        onChange={function(event) { setEircode(event.target.value); }}
                    />
                </Field>

                <Field label="Appliance Type" error={applianceTypeError}>
                    <select
                        className={styles.select}
                        value={applianceType}
                        onChange={function(event) { setApplianceType(event.target.value); }}
                    >
                        <option value="">Select an Appliance</option>
                        {APPLIANCE_TYPES.map(function(type) {
                            return <option key={type} value={type}>{type}</option>;
                        })}
                    </select>
                </Field>

                <Field label="Brand" error={brandError}>
                    <input
                        className={styles.input}
                        type="text"
                        placeholder="e.g. Samsung"
                        maxLength={50}
                        value={brand}
                        onChange={function(event) { setBrand(event.target.value); }}
                    />
                </Field>

                <Field label="Model Number" error={modelNumberError}>
                    <input
                        className={styles.input}
                        type="text"
                        placeholder="e.g. 123-456-7890"
                        maxLength={12}
                        value={modelNumber}
                        onChange={function(event) { setModelNumber(event.target.value); }}
                    />
                </Field>

                <Field label="Serial Number" error={serialNumberError}>
                    <input
                        className={styles.input}
                        type="text"
                        placeholder="e.g. 1234-5678-9012"
                        maxLength={14}
                        value={serialNumber}
                        onChange={function(event) { setSerialNumber(event.target.value); }}
                    />
                </Field>

                <Field label="Purchase Date" error={purchaseDateError}>
                    <input
                        className={styles.input}
                        type="date"
                        value={purchaseDate}
                        onChange={function(event) { setPurchaseDate(event.target.value); }}
                    />
                </Field>

                <Field label="Warranty Expiration Date" error={warrantyDateError}>
                    <input
                        className={styles.input}
                        type="date"
                        value={warrantyDate}
                        onChange={function(event) { setWarrantyDate(event.target.value); }}
                    />
                </Field>

                <br />
                <button type="submit" className={styles.button}>Add to Inventory</button>
            </form>     
        </div>
    );
}