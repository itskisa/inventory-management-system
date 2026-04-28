"use client";

import { useState } from "react";
import { BackButton, Field } from "../components/components.js";
import styles from "../styles/part-b-c.module.css";

const APPLIANCE_TYPES = [
    "Fridge",
    "Washing Machine",
    "Dishwasher",
    "Dryer",
    "Oven",
    "Microwave"
];

export default function AddAppliance() {

    // user field states
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [address, setAddress] = useState("");
    const [mobile, setMobile] = useState("");
    const [email, setEmail] = useState("");
    const [eircode, setEircode] = useState("");

    // appliance field states
    const [applianceType, setApplianceType] = useState("");
    const [brand, setBrand] = useState("");
    const [modelNumber, setModelNumber] = useState("");
    const [serialNumber, setSerialNumber] = useState("");
    const [purchaseDate, setPurchaseDate] = useState("");
    const [warrantyDate, setWarrantyDate] = useState("");
    const [cost, setCost] = useState("");

    // validation error states
    const [errors, setErrors] = useState({});

    // server response states
    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // this clears all the errors before each new validation run
    function clearErrors() {
        setErrors({});
        setServerError("");
        setSuccessMessage("");
    }

    // this handles the client side validation, which runs before the api call to give instant feedback
    function validateClient() {
        clearErrors();

        const newErrors = {};

        const nameRegex = /^[A-Za-z\s]{1,50}$/;
        const mobileRegex = /^(\+353|0)(8[3-9])\d{7}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const eircodeRegex = /^[A-Z0-9]{3}\s?[A-Z0-9]{4}$/;
        const brandRegex = /^[A-Za-z0-9\s\-]{1,50}$/;
        const modelRegex = /^\d{3}-\d{3}-\d{4}$/;
        const serialRegex = /^\d{4}-\d{4}-\d{4}$/;

        const costNum = parseFloat(cost);

        if (!nameRegex.test(firstName.trim())) {
            newErrors.firstName = "First name: letters only, max 50 chars";
        }

        if (!nameRegex.test(lastName.trim())) {
            newErrors.lastName  = "Last name: letters only, max 50 chars";
        }

        if (address.trim().length < 3 || address.trim().length > 100) {
            newErrors.address = "Address must be 3–100 characters";
        }

        if (!mobileRegex.test(mobile.trim())) {
            newErrors.mobile = "Enter a valid Irish mobile (e.g. 0831234567)";
        }

        if (!emailRegex.test(email.trim())) {
            newErrors.email = "Enter a valid email address";
        }

        if (!eircodeRegex.test(eircode.trim().toUpperCase())) {
            newErrors.eircode = "Enter a valid Eircode (e.g. D01 1234)";
        }

        if (!applianceType) {
            newErrors.applianceType = "Please select an appliance type";
        }
        
        if (!brandRegex.test(brand.trim())) {
            newErrors.brand = "Brand: letters/numbers only, max 50 chars";
        }

        if (!modelRegex.test(modelNumber.trim())) {
            newErrors.modelNumber = "Format must be 000-000-0000";
        }

        if (!serialRegex.test(serialNumber.trim())) {
            newErrors.serialNumber = "Format must be 0000-0000-0000";
        }

        if (!purchaseDate) {
            newErrors.purchaseDate = "Purchase date is required";
        }

        if (!warrantyDate) {
            newErrors.warrantyDate = "Warranty date is required";
        }

        if (purchaseDate && warrantyDate && new Date(warrantyDate) < new Date(purchaseDate)) {
            newErrors.warrantyDate = "Warranty date cannot be before purchase date";
        }

        if (isNaN(costNum) || costNum <= 0) {
            newErrors.cost = "Enter a valid cost greater than 0";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    // this handles the form submission. it first validates, then it calls for the api
    async function handleSubmit(event) {
        event.preventDefault();

        // stops if the client validation fails
        if (!validateClient()) {
            return;
        }

        const response = await fetch("/api/appliances", {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({
                firstName, lastName, address, mobile, email, eircode,
                applianceType, brand, modelNumber, serialNumber,
                purchaseDate, warrantyDate, cost
            })
        });

        const data = await response.json();

        if (data.success) {
            setSuccessMessage("New appliance has been added successfully");

            // resets all the form fields after a successful submission
            setFirstName("");
            setLastName("");
            setAddress("");
            setMobile("");
            setEmail("");
            setEircode("");
            setApplianceType("");
            setBrand("");
            setModelNumber("");
            setSerialNumber("");
            setPurchaseDate("");
            setWarrantyDate("");
            setCost("");
        } else {
            setServerError(data.message || "Something went wrong.");
        }
    }

    return (
        <div className={styles.container}>
            <BackButton />
            <h1 className={styles.title}>Add Appliance</h1>

            {serverError && <p className={styles.error}>{serverError}</p>}
            {successMessage && <p className={styles.success}>{successMessage}</p>}

            <form onSubmit={handleSubmit} noValidate>

                <h2 className={styles.sectionTitle}>User Details</h2>

                <Field label="First Name" error={errors.firstName}>
                    <input className={styles.input} type="text" value={firstName}
                        placeholder="e.g. Jane"
                        onChange={event => setFirstName(event.target.value)} />
                </Field>

                <Field label="Last Name" error={errors.lastName}>
                    <input className={styles.input} type="text" value={lastName}
                        placeholder="e.g. Doe"
                        onChange={event => setLastName(event.target.value)} />
                </Field>

                <Field label="Address" error={errors.address}>
                    <input className={styles.input} type="text" value={address}
                        placeholder="e.g. 12 Main Street, Dublin"
                        onChange={event => setAddress(event.target.value)} />
                </Field>

                <Field label="Mobile" error={errors.mobile}>
                    <input className={styles.input} type="tel" value={mobile}
                        placeholder="e.g. 0831234567"
                        onChange={event => setMobile(event.target.value)} />
                </Field>

                <Field label="Email" error={errors.email}>
                    <input className={styles.input} type="email" value={email}
                        placeholder="e.g. jane.doe@gmail.com"
                        onChange={event => setEmail(event.target.value)} />
                </Field>

                <Field label="Eircode" error={errors.eircode}>
                    <input className={styles.input} type="text" value={eircode}
                        placeholder="e.g. D01 1234" maxLength={8}
                        onChange={event => setEircode(event.target.value)} />
                </Field>

                <h2 className={styles.sectionTitle}>Appliance Details</h2>

                <Field label="Appliance Type" error={errors.applianceType}>
                    <select className={styles.select} value={applianceType}
                        onChange={event => setApplianceType(event.target.value)}>
                        <option value="">Select an Appliance</option>
                        {APPLIANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </Field>

                <Field label="Brand" error={errors.brand}>
                    <input className={styles.input} type="text" value={brand}
                        placeholder="e.g. Samsung"
                        onChange={event => setBrand(event.target.value)} />
                </Field>

                <Field label="Model Number" error={errors.modelNumber}>
                    <input className={styles.input} type="text" value={modelNumber}
                        placeholder="e.g. 123-456-7890" maxLength={12}
                        onChange={event => setModelNumber(event.target.value)} />
                </Field>

                <Field label="Serial Number" error={errors.serialNumber}>
                    <input className={styles.input} type="text" value={serialNumber}
                        placeholder="e.g. 1234-5678-9012" maxLength={14}
                        onChange={event => setSerialNumber(event.target.value)} />
                </Field>

                <Field label="Purchase Date" error={errors.purchaseDate}>
                    <input className={styles.input} type="date" value={purchaseDate}
                        onChange={event => setPurchaseDate(event.target.value)} />
                </Field>

                <Field label="Warranty Expiration Date" error={errors.warrantyDate}>
                    <input className={styles.input} type="date" value={warrantyDate}
                        onChange={event => setWarrantyDate(event.target.value)} />
                </Field>

                <Field label="Cost (€)" error={errors.cost}>
                    <input className={styles.input} type="number" value={cost}
                        placeholder="e.g. 499.99" min="0" step="0.01"
                        onChange={event => setCost(event.target.value)} />
                </Field>

                <button type="submit" className={styles.button}>Add Appliance</button>
            </form>
        </div>
    )

}

