import styles from "../styles/components.module.css";
import Link from "next/link";

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

export function NavBar() {
    return (
        <nav className={styles.nav}>
            <Link href="/add" className={styles.navLink}>Add</Link>
            <Link href="/search" className={styles.navLink}>Search</Link>
            <Link href="/update" className={styles.navLink}>Update</Link>
            <Link href="/delete" className={styles.navLink}>Delete</Link>
        </nav>
    );
}