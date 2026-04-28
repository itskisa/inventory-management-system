import Link from "next/link";
import styles from "../styles/components.module.css";

// reusable field component for the form inputs
export function Field({ label, error, children }) {
    return (
        <div className={styles.field}>
            <label className={styles.label}> {label}</label>
            {children}
            
            {/*  this displays an error message if it exists */}
            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
}

export function BackButton() {
    return (
        <Link href="/" className={styles.backButton}>← Back to Home</Link>
    );
}