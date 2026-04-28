"use client";

import { useState } from "react";
import { BackButton, backButton, Field } from "../components/components.js";
import styles from "../styles/part-b-c.module.css";

export default function SearchAppliance() {
    const [serialNumber, setSerialNumber] = useState("");
    const [serialError, setSerialError] = useState("");
    const [result, setResult] = useState("");
    const [notFound, setNotFound] = useState(false);

    async function handleSearch(event) {
        event.preventDefault();

        setSerialError("");
        setResult(null);
        setNotFound(false);

        const serialRegex = /^\d{4}-\d{4}-\d{4}$/;

        if (!serialRegex.test(serialNumber.trim())) {
            setSerialError("Format must be 0000-0000-0000");
            return;
        }

        const response = await fetch(`/api/appliances?serial=${encodeURIComponent(serialNumber.trim())}`);
        const data = await response.json();

        if (data.success) {
            setResult(data.appliance);
        } else {
            setNotFound(true);
        }
    }

    return (
        <div className={styles.container}>
            <BackButton />
            <h1 className={styles.title}>Search Appliance</h1>

            {notFound && (
                <p className={styles.error}>No matching appliances found!</p>
            )}

            <form onSubmit={handleSearch} noValidate>
                <Field label="Serial Number" error={serialError}>
                    <input className={styles.input} type="text" value={serialNumber}
                        placeholder="e.g. 1234-5678-9012" maxLength={14}
                        onChange={event => setSerialNumber(event.target.value)} />
                </Field>

                <button type="submit" className={styles.button}>Search</button>
            </form>

            {result && (
                <div className={styles.resultCard}>

                    <h2 className={styles.sectionTitle}>Appliance Details</h2>
                    
                    <p><strong>Type:</strong> {result.ApplianceType}</p>
                    <p><strong>Brand:</strong> {result.Brand}</p>
                    <p><strong>Model Number:</strong> {result.ModelNumber}</p>
                    <p><strong>Serial Number:</strong> {result.SerialNumber}</p>
                    <p><strong>Purchase Date:</strong> {result.PurchaseDate?.split("T")[0]}</p>
                    <p><strong>Warranty Expires:</strong> {result.WarrantyExpirationDate?.split("T")[0]}</p>
                    <p><strong>Cost:</strong> €{result.Cost}</p>

                    <h2 className={styles.sectionTitle}>User Details</h2>

                    <p><strong>Registered by:</strong> {result.FirstName} {result.LastName}</p>
                    <p><strong>Email:</strong> {result.Email}</p>
                    <p><strong>Mobile:</strong> {result.Mobile}</p>
                    <p><strong>Address:</strong> {result.Address}</p>
                    <p><strong>Eircode:</strong> {result.Eircode}</p>
                </div>
            )}
        </div>
    )
}