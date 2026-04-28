"use client";

import { useState } from "react";
import { Field, BackButton } from "../components/components.js";
import styles from "../styles/part-a.module.css";

// movie data with available dates and showtimes
const MOVIES = {
    "Zootropolis 2": {
        dates: ["17/03/2026", "18/03/2026"],
        times: ["1:15 pm", "3:45 pm", "6:15 pm", "8:45 pm"]
    },
    "Hoppers": {
        dates: ["17/03/2026", "18/03/2026", "19/03/2026", "20/03/2026"],
        times: ["12:00 pm", "14:30 pm"]
    },
    "Scream 7": {
        dates: ["17/03/2026", "18/03/2026", "19/03/2026", "20/03/2026"],
        times: ["12:00 pm", "14:50 pm", "17:40 pm", "20:30 pm"]
    },
    "The Bride!": {
        dates: ["17/03/2026", "18/03/2026", "19/03/2026", "20/03/2026"],
        times: ["14:00 pm", "17:00 pm", "20:10 pm"]
    }
};

export default function PartA() {

    // state variables for each form field
    const [movie, setMovie] = useState("");
    const [date, setDate] = useState("");
    const [showtime, setShowtime] = useState("");
    const [mobile, setMobile] = useState("");

    // state for error message, confirmation screen and saved booking
    const [error, setError] = useState("");
    const [confirmed, setConfirmed] = useState(false);
    const [booking, setBooking] = useState(null);

    // retrieves the available dates/times based on the movie selected
    const dates = movie ? MOVIES[movie].dates : [];
    const times = movie ? MOVIES[movie].times : [];

    // handles the form submission
    function handleSubmit(event) {
        event.preventDefault();

        // checks if all the fields are filled
        if (!movie || !date || !showtime || !mobile) {
            setError("Please fill in all the fields.");
            return;
        }

        // validates whether the number is a valid irish number
        if (!/^08\d{8}$/.test(mobile.replace(/\s/g, ""))) {
            setError("Please enter a valid Irish mobile number (e.g. 085 712 8378).");
            return;
        }

        // this clears any previous errors and saves the booking details
        setError("");
        setBooking({ movie, date, showtime, mobile });
        setConfirmed(true);
    }

    // confirmation screen — replaces the form after a successful booking
    if (confirmed) {
        return (
            <div className={styles.container}>
                <BackButton />
                <h1 className={styles.title}>Cinema Ticket <br />Booking</h1>
                <div className={styles.confirmation}>
                    Your booking for <strong>{booking.movie}</strong> on <strong>{booking.date}</strong> at <strong>{booking.showtime}</strong> has been confirmed. A confirmation text has been sent to <strong>{booking.mobile}</strong>.
                <br />
                
                { /* resets state to allow user to make anothe booking */ }
                <button className={styles.button} onClick={function() { setConfirmed(false); setBooking(null); }}>Book Another Ticket</button>
                </div>
            </div>      
        );
    }

    return (
        <div className={styles.container}>
            <BackButton />
            <h1 className={styles.title}>Cinema Ticket <br />Booking</h1>

            { /* displays the general error message at the top of the form if the validation fails */ }
            {error && <p className={styles.error}>{error}</p>}

            <form onSubmit={handleSubmit} noValidate>

                { /* movie dropdown */}
                <Field label="Movie">
                    <select
                        className={styles.select}
                        value={movie}
                        onChange={function(event) {
                            setMovie(event.target.value);
                            setDate("");
                            setShowtime("");
                        }}
                    >
                        <option value="">Select a Movie</option>
                        {Object.keys(MOVIES).map(function(m) {
                            return <option key={m} value={m}>{m}</option>;
                        })}
                    </select>
                </Field>

                { /* the date and showtime dropdowns are disabled until a movie is selected */}
                <Field label="Date">
                    <select
                        className={styles.select}
                        value={date}
                        onChange={function(event) { setDate(event.target.value); }}
                        disabled={!movie} 
                    >
                        <option value="">Select a Date</option>
                        {dates.map(function(d) {
                            return <option key={d} value={d}>{d}</option>;
                        })}
                    </select>
                </Field>

                <Field label="Show Time">
                    <select
                        className={styles.select}
                        value={showtime}
                        onChange={function(event) { setShowtime(event.target.value); }}
                        disabled={!movie}
                    >
                        <option value="">Select a Time</option>
                        {times.map(function(t) {
                            return <option key={t} value={t}>{t}</option>;
                        })}
                    </select>
                </Field>

                <Field label="Mobile Number">
                    <input
                        className={styles.input}
                        type="tel"
                        placeholder="e.g. 085 712 8378"
                        value={mobile}
                        onChange={function(event) { setMobile(event.target.value); }}
                    />
                </Field>

                <br />
                <button type="submit" className={styles.button}>Book Tickets</button>
            </form>
        </div>
    );
}