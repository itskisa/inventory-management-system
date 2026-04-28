import styles from "./styles/home.module.css";

export default function Home() {
    return (
        <main className={styles.container}>
            <h1 className={styles.title}>SWD Assignment 1</h1>
            <p className={styles.subtitle}>Kisandu Dinusara Karunaratne — 3142847</p>
            <div className={styles.links}>
                <a href="/part-a" className={styles.card}>
                    <span className={styles.cardTitle}>Part A</span>
                    <span className={styles.cardDesc}>Cinema Ticket Booking</span>
                </a>
                <a href="/part-b-c" className={styles.card}>
                    <span className={styles.cardTitle}>Part B / C</span>
                    <span className={styles.cardDesc}>House Appliance Inventory</span>
                </a>
            </div>
        </main>
    );
}