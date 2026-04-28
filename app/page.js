import Link from "next/link";
import styles from "./styles/home.module.css";

export default function Home() {
    return (
        <main className={styles.container}>
            <h1 className={styles.title}>Household Appliance Inventory</h1>
            <p className={styles.subtitle}>Select an option to manage your appliance</p>

            <nav className={styles.links}>
                <Link href="/add" className={styles.card}>
                    <span className={styles.cardTitle}>Add</span>
                    <span className={styles.cardDesc}>Register a new appliance</span>
                </Link>

                <Link href="/search" className={styles.card}>
                    <span className={styles.cardTitle}>Search</span>
                    <span className={styles.cardDesc}>Find an appliance by serial number</span>
                </Link>

                <Link href="/update" className={styles.card}>
                    <span className={styles.cardTitle}>Update</span>
                    <span className={styles.cardDesc}>Edit an existing appliance</span>
                </Link>

                <Link href="/delete" className={styles.card}>
                    <span className={styles.cardTitle}>Remove</span>
                    <span className={styles.cardDesc}>Remove an appliance record</span>
                </Link>

            </nav>
        </main>
    )
}