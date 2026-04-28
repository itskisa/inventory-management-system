"use client";

import { useState } from "react";
import { NavBar, Field } from "../components/components.js";
import styles from "../styles/part-b-c.module.css";

export default function DeleteAppliance() {
    const [serial, setSerial] = useState("");
    const [serialError, setSerialError] = useState("");

    const [appliance, setAppliance] = useState(null);
    const [notFound, setNotFound] = useState(false);

    const [success, setSuccess] = useState("");
    const [serverError, setServerError] = useState("");

    // this handles the serial number lookup before showing the confirmation card
    async function handleLookup(event) {
        event.preventDefault();

        // this resets all states before each lookup attempt
        setSerialError("");
        setNotFound(false);
        setAppliance(null);
        setServerError("");

        const serialRegex = /^\d{4}-\d{4}-\d{4}$/;

        if (!serialRegex.test(serial.trim())) {
            setSerialError("Format must be 0000-0000-0000");
            return;
        }

        // this fetches the appliance by serial number using the search endpoint
        const res = await fetch(`/api/appliances?serial=${encodeURIComponent(serial.trim())}`);
        const data = await res.json();

        if (!data.success) {
            setNotFound(true);
            return;
        }

        // this stores the first result to display in the confirmation card
        setAppliance(data.appliance[0]);
    }

    // this handles the actual deletion after the user confirms it
    async function handleDelete(event) {
        event.preventDefault();

        setServerError("");

        // this sends a delete request to the api with the serial number as a query parameter
        const res = await fetch(`/api/appliances?serial=${encodeURIComponent(serial.trim())}`, { method: "DELETE" });

        const data = await res.json();

        if (data.success) {
            setSuccess("Appliance Deleted");
        } else {
            setServerError(data.message || "Deletion failed.");
        }
    }

    return (
        <div className={styles.container}>
            <NavBar />
            <h1 className={styles.title}>Delete Appliance</h1>
            <p className={styles.subtitle}>Look up an appliance by serial number to remove it from the system.</p>

            {success && <p className={styles.success}>{success} <a href="/"> ← Back to Home</a></p>}
            {notFound && <p className={styles.error}>No appliance found. <a href="/"> ← Back to Home</a></p>}

            {!appliance && !success && (
                <form onSubmit={handleLookup} noValidate>
                    <Field label="Serial Number" error={serialError}>
                        <input
                            className={styles.input}
                            type="text"
                            value={serial}
                            placeholder="e.g. 1234-5678-9012"
                            maxLength={14}
                            onChange={e => setSerial(e.target.value)}
                        />
                    </Field>
                    <button type="submit" className={styles.button}>Find Appliance</button>
                </form>
            )}

            {appliance && !success && (
                <>
                    {serverError && <p className={styles.error}>{serverError}</p>}

                    <p style={{ marginBottom: "16px" }}>
                        Please confirm you want to delete the following appliance:
                    </p>

                    <div className={styles.resultCard}>
                        <strong>Owner:</strong> {appliance.FirstName} {appliance.LastName}<br />
                        <strong>Email:</strong> {appliance.Email}<br />
                        <strong>Address:</strong> {appliance.Address}<br />
                        <strong>Eircode:</strong> {appliance.Eircode}<br />
                        <strong>Mobile:</strong> {appliance.Mobile}<br />
                        <br />
                        <strong>Type:</strong> {appliance.ApplianceType}<br />
                        <strong>Brand:</strong> {appliance.Brand}<br />
                        <strong>Model:</strong> {appliance.ModelNumber}<br />
                        <strong>Serial:</strong> {appliance.SerialNumber}<br />
                        <strong>Purchase Date:</strong> {appliance.PurchaseDate?.split("T")[0]}<br />
                        <strong>Warranty Expires:</strong> {appliance.WarrantyExpDate?.split("T")[0]}<br />
                        <strong>Cost:</strong> €{appliance.Cost}
                    </div>

                    <button 
                        type="submit" 
                        className={styles.button} 
                        style={{ marginTop: "24px" }}
                        onClick={handleDelete}
                    >
                            Confirm Delete
                    </button>

                    <button
                        type="button"
                        className={styles.buttonSecondary}
                        style={{ marginTop: "10px" }}
                        onClick={() => { 
                            setAppliance(null); 
                            setSerial(""); 
                        }}
                    >
                        Cancel
                    </button>
                </>
            )}
        </div>
    );
}