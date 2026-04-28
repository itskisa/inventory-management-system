import pool from "../../../lib/db.js";

// this sanitizes the string input before storing, which helps prevent xss attacks
function escapeHtml(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// this adds a new appliance. this also adds a new user if they're not in the database
export async function POST(request) {
    try {
        const body = await request.json();

        const {
            firstName, lastName, address, mobile, email, eircode,
            applianceType, brand, modelNumber, serialNumber,
            purchaseDate, warrantyDate, cost
        } 
        
        = body;

        // Server Side Validations
        // this handles all the server side validation, which is independent from the client check

        const nameRegex = /^[A-Za-z\s]{1,50}$/;
        const mobileRegex = /^(\+353|0)(8[3-9])\d{7}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const eircodeRegex = /^[A-Z0-9]{3}\s?[A-Z0-9]{4}$/;
        const modelRegex = /^\d{3}-\d{3}-\d{4}$/;
        const serialRegex = /^\d{4}-\d{4}-\d{4}$/;

        const validTypes = ["Fridge", "Washing Machine", "Dishwasher", "Dryer", "Oven", "Microwave"];

        const purchase = new Date(purchaseDate);
        const warranty = new Date(warrantyDate);

        const costNum = parseFloat(cost);

        if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
            return Response.json({ success: false, message: "Invalid name format" }, { status: 400 });
        }

        if (!address || address.trim().length < 3) {
            return Response.json({ success: false, message: "Invalid address" }, { status: 400 });
        }

        if (!mobileRegex.test(mobile)) {
            return Response.json({ success: false, message: "Invalid mobile number" }, { status: 400 });
        }

        if (!emailRegex.test(email)) {
            return Response.json({ success: false, message: "Invalid email" }, { status: 400 });
        }

        if (!eircodeRegex.test(eircode.toUpperCase())) {
            return Response.json({ success: false, message: "Invalid Eircode" }, { status: 400 });
        }

        if (!validTypes.includes(applianceType)) {
            return Response.json({ success: false, message: "Invalid appliance type" }, { status: 400 });
        }

        if (!modelRegex.test(modelNumber)) {
            return Response.json({ success: false, message: "Invalid model number format" }, { status: 400 });
        }

        if (!serialRegex.test(serialNumber)) {
            return Response.json({ success: false, message: "Invalid serial number format" }, { status: 400 });
        }

        if (!purchaseDate || !warrantyDate || isNaN(purchase) || isNaN(warranty)) {
            return Response.json({ success: false, message: "Invalid dates" }, { status: 400 });
        }

        if (warranty < purchase) {
            return Response.json({ success: false, message: "Warranty cannot be before purchase date" }, { status: 400 });
        }

        if (isNaN(costNum) || costNum <= 0) {
            return Response.json({ success: false, message: "Invalid cost" }, { status: 400 });
        }

        
        // Database Operations

        // this checks if the serial number already exists
        const [existing] = await pool.query(
            "Select ApplianceID FROM appliance WHERE SerialNumber = ?", [serialNumber]
        );

        if (existing.length > 0) {
            return Response.json({success: false, message: "Appliance already exists" }, { status: 409 });
        }

        // this checks if a user with the email exists already. if it does, use the same user id
        const [existingUser] = await pool.query(
            "Select UserID from user WHERE Email = ?", [email]
        );

        let userId;

        if (existingUser.length > 0) {
            // if an existing user is found, link the appliance onto their account
            userId = existingUser[0].UserID;
        } else {
            // if a new user is created, insert their information to the users table first
            const [userResult] = await pool.query(
                'INSERT INTO user (FirstName, LastName, Address, Mobile, Email, Eircode) VALUES (?, ?, ?, ?, ?, ?)',
                
                [
                    escapeHtml(firstName.trim()),
                    escapeHtml(lastName.trim()),
                    escapeHtml(address.trim()),
                    escapeHtml(mobile.trim()),
                    escapeHtml(email.trim()),
                    escapeHtml(eircode.trim().toUpperCase())
                ]
            );
            
            userId = userResult.insertId;
        }

        // this inserts the appliance, linkking it to the user using userid, which is the foreign key
        await pool.query(
            'INSERT INTO appliance (UserID, ApplianceType, Brand, ModelNumber, SerialNumber, PurchaseDate, WarrantyExpDate, Cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',

            [
                userId,
                escapeHtml(applianceType),
                escapeHtml(brand.trim()),
                escapeHtml(modelNumber.trim()),
                escapeHtml(serialNumber.trim()),
                purchaseDate,
                warrantyDate,
                costNum
            ]
        );

        return Response.json({ success: true, message: "New appliance added successfully." });

    } catch (error) {
        console.error("POST /api/appliances error: ", error);
        return Response.json({ success: false, message: "Server error. Please try again." }, { status: 500} );
    }

    
}

// this helps search for an appliance by serial number
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const serial = searchParams.get("serial");

        const serialRegex = /^\d{4}-\d{4}-\d{4}$/;
        if (!serial || !serialRegex.test(serial)) {
            return Response.json({ success: false, message: "Invalid serial number format" }, { status: 400});
        }

        // this retrieves appliance details along with the linked user's information
        const [rows] = await pool.query(
            `SELECT a.*, u.FirstName, u.LastName, u.Address, u.Mobile, u.Email, u.Eircode
            FROM appliance a
            JOIN user u ON a.UserID = u.UserID
            WHERE a.SerialNumber = ?`,
            [serial]
        );

        if (rows.length === 0) {
            return Response.json({ success: false, message: "No matching appliance found!" }, { status: 404 });
        }

        return Response.json({ success: true, appliance: rows[0] });

    } catch (error) {
        console.error("GET /api/appliances error:", error);
        return Response.json({ success: false, message: "Server error"}, { status: 500 });
    }
}