"use client";

import { useState } from "react";
import { NavBar, Field } from "../components/components.js";
import styles from "../styles/part-b-c.module.css";

const APPLIANCE_TYPES = ["Fridge", "Washing Machine", "Dishwasher", "Dryer", "Oven", "Microwave"];

export default function SearchAppliance() {
    const [serialNumber, setSerialNumber] = useState("");
    const [applianceType, setApplianceType] = useState("");
    const [brand, setBrand] = useState("");
    const [modelNumber, setModelNumber] = useState("");

    const [errors, setErrors] = useState("");
    const [results, setResults] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [serverError, setServerError] = useState("");

    async function handleSearch(event) {
        event.preventDefault();

        // this resets states before each new search attempt    
        setErrors("");
        setResults(null);
        setNotFound(false);
        setServerError("");

        // regex patterns for validation
        const serialRegex = /^\d{4}-\d{4}-\d{4}$/;
        const modelRegex = /^\d{3}-\d{3}-\d{4}$/;
        const newErrors = {};

        const serial = serialNumber.trim();
        const model = modelNumber.trim();
        const brd = brand.trim();

        // this ensures that at least one field is filled
        if (!serial && !applianceType && !brand && !model) {
            setServerError("Please fill in at least one search field.");
            return;
        }

        // this validates the serial number format only if one was provided
        if (serial && !serialRegex.test(serial)) {
            newErrors.serial = "Format must be 0000-0000-0000";
        }

        // this validates the model number format only if one was provided
        if (model && !modelRegex.test(model)) {
            newErrors.model = "Format must be 000-000-0000";
        }

        // this stops the search any format errors were found
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // this builds the query parameters dynamically based on whichever fields were filled in 
        const params = new URLSearchParams();

        if (serial) {
            params.set("serial", serial);
        }

        if (applianceType) {
            params.set("type", applianceType);
        }

        if (brd) {
            params.set("brand", brd);
        }

        if (model) {
            params.set("model", model);
        }

        const response = await fetch(`/api/appliances?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
            // this stores the results array to be mapped over in the results section below
            setResults(data.appliance);
        } else if (response.status === 404) {
            setNotFound(true);
        } else {
            setServerError(data.message || "Something went wrong.");
        }
    }

    return (
        <div className={styles.container}>
            <NavBar />
            <h1 className={styles.title}>Search Appliance</h1>
            <p className={styles.subtitle}>Find appliances by serial number, type, brand, or model.</p>

            {notFound && <p className={styles.error}>No matching appliance found. <a href="/">← Back to Home</a></p>}

            <form onSubmit={handleSearch} noValidate>

                <Field label="Serial Number" error={errors.serial}>
                    <input className={styles.input} type="text"
                        value={serialNumber} placeholder="e.g. 1234-5678-9012"
                        maxLength={14}
                        onChange={event => setSerialNumber(event.target.value)} />
                </Field>

                <Field label="Appliance Type">
                    <select className={styles.select} value={applianceType}
                        onChange={event => setApplianceType(event.target.value)}>
                        <option value="">Any</option>
                        {APPLIANCE_TYPES.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </Field>

                <Field label="Brand">
                    <input className={styles.input} type="text"
                        value={brand} placeholder="e.g. Samsung"
                        onChange={event => setBrand(event.target.value)} />
                </Field>

                <Field label="Model Number" error={errors.model}>
                    <input className={styles.input} type="text"
                        value={modelNumber} placeholder="e.g. 123-456-7890"
                        maxLength={12}
                        onChange={event => setModelNumber(event.target.value)} />
                </Field>

                <button type="submit" className={styles.button}>Search</button>

                {serverError && (
                    <p className={styles.error} style={{ marginTop: "16px", marginBottom: 0 }}>
                        {serverError}
                    </p>
                )}

            </form>

            {results && results.map((result, index) => (
                <div key={index} className={styles.resultCard}>

                    <h2 className={styles.sectionTitle}>Appliance Details</h2>
                    <p><strong>Type:</strong> {result.ApplianceType}</p>
                    <p><strong>Brand:</strong> {result.Brand}</p>
                    <p><strong>Model Number:</strong> {result.ModelNumber}</p>
                    <p><strong>Serial Number:</strong> {result.SerialNumber}</p>
                    <p><strong>Purchase Date:</strong> {result.PurchaseDate?.split("T")[0]}</p>
                    <p><strong>Warranty Expires:</strong> {result.WarrantyExpDate?.split("T")[0]}</p>
                    <p><strong>Cost:</strong> €{result.Cost}</p>

                    <h2 className={styles.sectionTitle}>User Details</h2>
                    <p><strong>Registered by:</strong> {result.FirstName} {result.LastName}</p>
                    <p><strong>Email:</strong> {result.Email}</p>
                    <p><strong>Mobile:</strong> {result.Mobile}</p>
                    <p><strong>Address:</strong> {result.Address}</p>
                    <p><strong>Eircode:</strong> {result.Eircode}</p>
                </div>
            ))}
        </div>
    );
}