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

        // this validates first and last name format
        if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
            return Response.json(
                { success: false, message: "Invalid name format" }, 
                { status: 400 }
            );
        }

        // this validates the address length
        if (!address || address.trim().length < 3) {
            return Response.json(
                { success: false, message: "Invalid address" }, 
                { status: 400 }
            );
        }

        // this validates the irish mobile number format
        if (!mobileRegex.test(mobile)) {
            return Response.json(
                { success: false, message: "Invalid mobile number" }, 
                { status: 400 }
            );
        }

        // this validates the email format
        if (!emailRegex.test(email)) {
            return Response.json(
                { success: false, message: "Invalid email" }, 
                { status: 400 }
            );
        }

        // this validates the eircode format
        if (!eircodeRegex.test(eircode.toUpperCase())) {
            return Response.json(
                { success: false, message: "Invalid Eircode" }, 
                { status: 400 }
            );
        }

        // this validates the appliance type against the allowed list
        if (!validTypes.includes(applianceType)) {
            return Response.json(
                { success: false, message: "Invalid appliance type" }, 
                { status: 400 }
            );
        }

        // this validates the model number format (000-000-0000)
        if (!modelRegex.test(modelNumber)) {
            return Response.json(
                { success: false, message: "Invalid model number format" }, 
                { status: 400 }
            );
        }

        // this validates the serial number format (0000-0000-0000)
        if (!serialRegex.test(serialNumber)) {
            return Response.json(
                { success: false, message: "Invalid serial number format" }, 
                { status: 400 }
            );
        }

        // this validates that both dates are present are parseable
        if (!purchaseDate || !warrantyDate || isNaN(purchase) || isNaN(warranty)) {
            return Response.json(
                { success: false, message: "Invalid dates" }, 
                { status: 400 }
            );
        }

        // this validates that the warranty date is not before the purchase date
        if (warranty < purchase) {
            return Response.json(
                { success: false, message: "Warranty cannot be before purchase date" }, 
                { status: 400 }
            );
        }

        // this validates that the cost is a positive number
        if (isNaN(costNum) || costNum <= 0) {
            return Response.json(
                { success: false, message: "Invalid cost" }, 
                { status: 400 });
        }

        
        // Database Operations

        // this checks if the serial number is already registered to an existing appliance
        const [existing] = await pool.query(
            "Select ApplianceID FROM appliance WHERE SerialNumber = ?", [serialNumber]
        );

        if (existing.length > 0) {
            return Response.json({success: false, message: "Appliance already exists" }, { status: 409 });
        }

        // this checks if the email is already registered to an existing user
        const [existingUser] = await pool.query(
            "Select UserID from user WHERE Email = ?", [email]
        );

        if (existingUser.length > 0) {
            return Response.json(
                { success: false, message: "An account with this email already exists."},
                { status: 409 }
            );
        }

        // this inserts the new user and retrieves their generated ID
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
            
        const userId = userResult.insertId;

        // this inserts the appliance, linking it to the user using userid, which is the foreign key
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

// this helps search for an appliance by using one or more optional filters
export async function GET(request) {
    try {
        
        // this extracts the query parameters from the request URL
        const { searchParams } = new URL(request.url);

        const serial = searchParams.get("serial")?.trim();
        const type = searchParams.get("type")?.trim();
        const brand = searchParams.get("brand")?.trim();
        const model = searchParams.get("model")?.trim();

        // requires at least one filter
        if (!serial && !type && !brand && !model) {
            return Response.json(
                { success: false, message: "Please provide at least one search field."},
                { status: 400}
            );
        }

        // validation patterns for the model number and serial number
        const serialRegex = /^\d{4}-\d{4}-\d{4}$/;
        const modelRegex  = /^\d{3}-\d{3}-\d{4}$/;

        // this validates the serial number format if provided
        if (serial && !serialRegex.test(serial)) {
            return Response.json(
                { success: false, message: "Invalid serial number format" }, 
                { status: 400}
            );
        }

        // this validates the model number format if provided
        if (model && !modelRegex.test(model)) {
            return Response.json(
                { success: false, message: "Invalid model number format" }, 
                { status: 400 }
            );
        }

        const validTypes = ["Fridge", "Washing Machine", "Dishwasher", "Dryer", "Oven", "Microwave"];

        // this validates appliance type against the allowed list if provided
        if (type && !validTypes.includes(type)) {
            return Response.json(
                { success: false, message: "Invalid appliance type" }, 
                { status: 400 }
            );
        }

        // this dynamically builds the WHERE clause in mysql queries based on which filters were provided
        const conditions = [];
        const values = [];

        if (serial) {
            conditions.push("a.SerialNumber = ?");
            values.push(serial);
        }

        if (type) {
            conditions.push("a.ApplianceType = ?");
            values.push(type);
        }

        if (brand) {
            conditions.push("LOWER(a.Brand) = LOWER(?)"); // this uses case-insensitive exact match for th ebrand
            values.push(brand);
        }

        if (model) {
            conditions.push("a.ModelNumber = ?");
            values.push(model);
        }

        // this joins all the the conditions with AND
        const where = conditions.join(" AND ");

        // this retrieves appliance details along with the linked user's information
        const [rows] = await pool.query(
            `SELECT a.*, u.FirstName, u.LastName, u.Address, u.Mobile, u.Email, u.Eircode
            FROM appliance a
            JOIN user u ON a.UserID = u.UserID
            WHERE ${where}`,
            values
        );

        // this is if there's no results
        if (rows.length === 0) {
            return Response.json(
                { success: false, message: "No matching appliance found!" }, 
                { status: 404 }
            );
        }

        return Response.json({ 
            success: true, 
            appliance: rows 
        });

    } catch (error) {
        console.error("GET /api/appliances error:", error);
        return Response.json({ success: false, message: "Server error"}, { status: 500 });
    }
}

// this updates an existing appliance and its associated user details
export async function PUT(request) {
    try {
        const body = await request.json();
        const {
            serialNumber, brand, applianceType, modelNumber,
            purchaseDate, warrantyDate, cost,
            firstName, lastName, address, mobile, email, eircode
        } = body;

        // this validates the serial number format
        const serialRegex = /^\d{4}-\d{4}-\d{4}$/;

        // this validates the serial number format
        if (!serialRegex.test(serialNumber)) {
            return Response.json(
                { success: false, message: "Invalid serial number" }, 
                { status: 400 }
            );
        }

        // this checks if the appliance exists in the database
        const [rows] = await pool.query(
            "SELECT ApplianceID, UserID FROM appliance WHERE SerialNumber = ?",
            [serialNumber]
        );

        if (rows.length === 0) {
            return Response.json(
                { success: false, message: "Appliance not found" }, 
                { status: 404 }
            );
        }

        const { ApplianceID, UserID } = rows[0];

        // this updates the appliance details
        await pool.query(
            `UPDATE appliance
             SET ApplianceType=?, Brand=?, ModelNumber=?, PurchaseDate=?, WarrantyExpDate=?, Cost=?
             WHERE ApplianceID=?`,
            [
                escapeHtml(applianceType), 
                escapeHtml(brand.trim()), 
                escapeHtml(modelNumber.trim()), 
                purchaseDate, 
                warrantyDate, 
                parseFloat(cost), 
                ApplianceID
            ]
        );

        // this updates the associated user details
        await pool.query(
            `UPDATE user SET FirstName=?, LastName=?, Address=?, Mobile=?, Eircode=? WHERE UserID=?`,
            [
                escapeHtml(firstName.trim()), 
                escapeHtml(lastName.trim()), 
                escapeHtml(address.trim()), 
                escapeHtml(mobile.trim()), 
                escapeHtml(eircode.trim().toUpperCase()), 
                UserID
            ]
        );

        return Response.json({ 
            success: true, 
            message: "Appliance has been updated." 
        });

    } catch (error) {
        console.error("PUT /api/appliances error:", error);

        return Response.json(
            { success: false, message: "Server error" }, 
            { status: 500 }
        );
    }
}

// this removes an appliance record from the database by serial number
export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const serial = searchParams.get("serial");

        const serialRegex = /^\d{4}-\d{4}-\d{4}$/;

        if (!serial || !serialRegex.test(serial)) {
            return Response.json(
                { success: false, message: "Invalid serial number format" }, 
                { status: 400 }
            );
        }

        // check the appliance exists before trying to delete
        const [rows] = await pool.query(
            "SELECT ApplianceID FROM appliance WHERE SerialNumber = ?",
            [serial]
        );

        if (rows.length === 0) {
            return Response.json(
                { success: false, message: "No matching appliance found!" }, 
                { status: 404 }
            );
        }

        // this deletes the appliance record. the user record is kept in case they have other appliances
        await pool.query(
            "DELETE FROM appliance WHERE SerialNumber = ?",
            [serial]
        );

        return Response.json({ 
            success: true, 
            message: "Appliance Deleted" 
        });

    } catch (error) {
        console.error("DELETE /api/appliances error:", error);
        return Response.json(
            { success: false, message: "Server error" }, 
            { status: 500 }
        );
    }
}