"use client";

import { useState } from "react";
import { NavBar, Field } from "../components/components.js";
import styles from "../styles/part-b-c.module.css";

const APPLIANCE_TYPES = ["Fridge", "Washing Machine", "Dishwasher", "Dryer", "Oven", "Microwave"];

export default function UpdateAppliance() {
    const [serial, setSerial] = useState("");
    const [serialError, setSerialError] = useState("");
    
    const [appliance, setAppliance] = useState(null);
    const [notFound, setNotFound] = useState(false);

    const [success, setSuccess] = useState("");
    const [serverError, setServerError] = useState("");
    const [errors, setErrors] = useState({});

    const [brand, setBrand] = useState("");
    const [applianceType, setApplianceType] = useState("");
    const [modelNumber, setModelNumber] = useState("");
    const [purchaseDate, setPurchaseDate] = useState("");
    const [warrantyDate, setWarrantyDate] = useState("");
    const [cost, setCost] = useState("");

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [address, setAddress] = useState("");
    const [mobile, setMobile] = useState("");
    const [email, setEmail] = useState("");
    const [eircode, setEircode] = useState("");

    // this looks up the appliance by their serial number
    async function handleLookup(event) {
        event.preventDefault();

        setSerialError("");
        setNotFound(false);
        setAppliance(null);

        const serialRegex = /^\d{4}-\d{4}-\d{4}$/;

        if (!serialRegex.test(serial.trim())) {
            setSerialError("Format must be 0000-0000-0000");
            return;
        }

        const res = await fetch(`/api/appliances?serial=${encodeURIComponent(serial.trim())}`);
        const data = await res.json();

        if (!data.success) {
            setNotFound(true);
            return;
        }

        const a = data.appliance[0];

        setAppliance(a);
        setBrand(a.Brand);
        setApplianceType(a.ApplianceType);
        setModelNumber(a.ModelNumber);
        setPurchaseDate(a.PurchaseDate?.split("T")[0] || "");
        setWarrantyDate(a.WarrantyExpDate?.split("T")[0] || "");
        setCost(a.Cost);
        setFirstName(a.FirstName);
        setLastName(a.LastName);
        setAddress(a.Address);
        setMobile(a.Mobile);
        setEmail(a.Email);
        setEircode(a.Eircode);
    }

    // this handles client side validation before sending the update
    function validate() {
        const newErrors = {};

        const nameRegex = /^[A-Za-z\s]{1,50}$/;
        const mobileRegex = /^(\+353|0)(8[3-9])\d{7}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const eircodeRegex = /^[A-Z0-9]{3}\s?[A-Z0-9]{4}$/;
        const brandRegex = /^[A-Za-z0-9\s\-]{1,50}$/;
        const modelRegex = /^\d{3}-\d{3}-\d{4}$/;

        if (!nameRegex.test(firstName.trim())) {
            newErrors.firstName = "Letters only, max 50";
        }

        if (!nameRegex.test(lastName.trim())) {
            newErrors.lastName = "Letters only, max 50";
        }

        if (address.trim().length < 3) {
            newErrors.address = "Address too short";
        }

        if (!mobileRegex.test(mobile.trim())) {
            newErrors.mobile = "Invalid Irish mobile";
        }

        if (!emailRegex.test(email.trim())) {
            newErrors.email = "Invalid email";
        }

        if (!eircodeRegex.test(eircode.trim().toUpperCase())) {
            newErrors.eircode = "Invalid Eircode";
        }

        if (!applianceType) {
            newErrors.applianceType = "Select a type";
        }

        if (!brandRegex.test(brand.trim())) {
            newErrors.brand = "Invalid brand";
        }

        if (!modelRegex.test(modelNumber.trim())) {
            newErrors.modelNumber = "Format: 000-000-0000";
        }

        if (!purchaseDate) {
            newErrors.purchaseDate = "Required";
        }

        if (!warrantyDate) {
            newErrors.warrantyDate = "Required";
        }

        if (purchaseDate && warrantyDate && new Date(warrantyDate) < new Date(purchaseDate)) {
            newErrors.warrantyDate = "Must be after purchase date";
        }

        const costNum = parseFloat(cost);

        if (isNaN(costNum) || costNum <= 0) {
            newErrors.cost = "Enter a valid cost";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    // this sends updated data to the backend
    async function handleUpdate(event) {
        event.preventDefault();

        setServerError("");
        setSuccess("");
        setErrors({});

        // stops if the validation fails
        if (!validate()){
            return;
        }

        // sends a put request
        const res = await fetch("/api/appliances", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                serialNumber: serial,
                brand, applianceType, modelNumber, purchaseDate, warrantyDate, cost,
                firstName, lastName, address, mobile, email, eircode
            })
        });

        const data = await res.json();

        if (data.success) {
            setSuccess("Appliance has been updated.");
        } else {
            setServerError(data.message || "Update failed.");
        }
    }

    return (
        <div className={styles.container}>
            <NavBar />
            <h1 className={styles.title}>Update Appliance</h1>
            <p className={styles.subtitle}>Look up an appliance by serial number to edit its details.</p>

            {success && <p className={styles.success}>{success} <a href="/">← Back to Home</a></p>}
            {notFound && 
                <p className={styles.error}>No appliance found. <a href="/">← Back to Home</a></p>}


            {!appliance && (
                <form onSubmit={handleLookup} noValidate>
                    <Field label="Serial Number" error={serialError}>
                        <input 
                            className={styles.input} 
                            type="text" 
                            value={serial}
                            placeholder="e.g. 1234-5678-9012" maxLength={14}
                            onChange={event => setSerial(event.target.value)} 
                        />
                    </Field>

                    <button type="submit" className={styles.button}>Find Appliance</button>
                </form>
            )}

            {appliance && !success && (
                <form onSubmit={handleUpdate} noValidate>
                    {serverError && <p className={styles.error}>{serverError}</p>}

                    <h2 className={styles.sectionTitle}>User Details</h2>

                    <Field label="First Name" error={errors.firstName}>
                        <input 
                            className={styles.input} 
                            type="text" 
                            value={firstName} 
                            onChange={event => setFirstName(event.target.value)} 
                        />
                    </Field>

                    <Field label="Last Name" error={errors.lastName}>
                        <input 
                            className={styles.input} 
                            type="text" 
                            value={lastName} 
                            onChange={event => setLastName(event.target.value)} 
                        />
                    </Field>

                    <Field label="Address" error={errors.address}>
                        <input 
                            className={styles.input} 
                            type="text" 
                            value={address} 
                            onChange={event => setAddress(event.target.value)} 
                        />
                    </Field>

                    <Field label="Mobile" error={errors.mobile}>
                        <input 
                            className={styles.input} 
                            type="tel" 
                            value={mobile} 
                            onChange={event => setMobile(event.target.value)} 
                        />
                    </Field>

                    <Field label="Email" error={errors.email}>
                        <input 
                            className={styles.input} 
                            type="email" 
                            value={email} 
                            onChange={event => setEmail(event.target.value)} 
                        />
                    </Field>

                    <Field label="Eircode" error={errors.eircode}>
                        <input 
                            className={styles.input} 
                            type="text" 
                            value={eircode} 
                            maxLength={8} 
                            onChange={event => setEircode(event.target.value)} 
                        />
                    </Field>

                    <h2 className={styles.sectionTitle}>Appliance Details</h2>

                    <Field label="Appliance Type" error={errors.applianceType}>
                        <select 
                            className={styles.select} 
                            value={applianceType} 
                            onChange={event => setApplianceType(event.target.value)}
                        >
                            {APPLIANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </Field>

                    <Field label="Brand" error={errors.brand}>
                        <input 
                            className={styles.input} 
                            type="text" 
                            value={brand} 
                            onChange={event => setBrand(event.target.value)} 
                        />
                    </Field>

                    <Field label="Model Number" error={errors.modelNumber}>
                        <input 
                            className={styles.input} 
                            type="text" 
                            value={modelNumber} 
                            maxLength={12} 
                            onChange={event => setModelNumber(event.target.value)} 
                        />
                    </Field>

                    <Field label="Purchase Date" error={errors.purchaseDate}>
                        <input 
                            className={styles.input} 
                            type="date" 
                            value={purchaseDate} 
                            onChange={event => setPurchaseDate(event.target.value)} 
                        />
                    </Field>

                    <Field label="Warranty Expiration Date" error={errors.warrantyDate}>
                        <input 
                            className={styles.input} 
                            type="date" 
                            value={warrantyDate} 
                            onChange={event => setWarrantyDate(event.target.value)} 
                        />
                    </Field>

                    <Field label="Cost (€)" error={errors.cost}>
                        <input 
                            className={styles.input} 
                            type="number" 
                            value={cost} 
                            min="0" 
                            step="0.01" 
                            onChange={event => setCost(event.target.value)} 
                        />
                    </Field>

                    <button type="submit" className={styles.button}>Update Appliance</button>
                </form>
            )}
        </div>
    );
}