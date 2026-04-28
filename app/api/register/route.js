import { promises as fs } from "fs";
import path from "path";

// sanitizes the string by replacing special html characters with safe entities. this prevents xss attacks when displaying user input back to the browser
function escapeHtml(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// returns the full inventory list from the json file
export async function GET() {
    try {
        const filePath = path.join(process.cwd(), "data", "inventory.json");
        const fileContents = await fs.readFile(filePath, "utf8");
        const inventoryArray = JSON.parse(fileContents);

        return Response.json(
            { success: true, inventory: inventoryArray }
        );

    } catch {

        // returns a generic error to avoid exposing file system details
        return Response.json(
            { success: false, message: "Could not load inventory"},
            { status: 500 }
        );
    }
}

// validates, sanitizes and saves a new appliance to the inventory
export async function POST(request) {
    try {

        // extracts each field from the request body
        const body = await request.json();

        const eircode = body.eircode;
        const applianceType = body.applianceType;
        const brand = body.brand;
        const modelNumber = body.modelNumber;
        const serialNumber = body.serialNumber;
        const purchaseDate = body.purchaseDate;
        const warrantyDate = body.warrantyDate;

        // regex pattern for form validation
        const eircodeRegex = /^D\d{2}\s?[A-Z0-9]{4}$/;
        const modelRegex = /^\d{3}-\d{3}-\d{4}$/;
        const serialRegex = /^\d{4}-\d{4}-\d{4}$/;

        // list of acceptable appliance types
        const validTypes = ["Fridge", "Washing Machine", "Dishwasher", "Dryer", "Oven", "Microwave"];

        // server side validation which runs independently from the client side checks
        if (!eircodeRegex.test(eircode)) {
            return Response.json(
                { success: false, message: "Invalid Eircode" },
                { status: 400 }
            );
        }

        if (!validTypes.includes(applianceType)) {
            return Response.json(
                { success: false, message: "Invalid Appliance Type" },
                { status: 400 }
            );
        }

        if (!brand || brand.trim() === "") {
            return Response.json(
                { success: false, message: "Brand is required" },
                { status: 400 }
            );
        }

        if (!modelRegex.test(modelNumber)) {
            return Response.json(
                { success: false, message: "Invalid model number format" },
                { status: 400 }
            );
        }

        if (!serialRegex.test(serialNumber)) {
            return Response.json(
                { success: false, message: "Invalid serial number format" },
                { status: 400 }
            );
        }

        if (!purchaseDate || !warrantyDate) {
            return Response.json(
                { success: false, message: "Both dates are required" },
                { status: 400 }
            );
        }

        const purchase = new Date(purchaseDate);
        const warranty = new Date(warrantyDate);

        // this checks if both the dates are valid date values
        if (isNaN(purchase.getTime()) || isNaN(warranty.getTime())) {
            return Response.json(
                { success: false, message: "Invalid date values"},
                { status: 400 }
            );
        }

        // ensures that the warranty =does not expire before the purchase date
        if (warranty < purchase) {
            return Response.json(
                { success: false, message: "Warranty Date cannot be earlier than Purchase Date"},
                { status: 400 }
            );
        }

        // sanitizes all the string fields before saving, which prevents xss attacks
        const sanitizedItem = {
            id: Date.now(),
            eircode: escapeHtml(eircode.trim()),
            applianceType: escapeHtml(applianceType),
            brand: escapeHtml(brand.trim()),
            modelNumber: escapeHtml(modelNumber.trim()),
            serialNumber: escapeHtml(serialNumber.trim()),
            purchaseDate: escapeHtml(purchaseDate),
            warrantyDate: escapeHtml(warrantyDate),
            createdAt: new Date().toDateString()
        };

        // reads the current file inventory, appends the new item, and writes it back
        const filePath = path.join(process.cwd(), "data", "inventory.json");
        const fileContents = await fs.readFile(filePath, "utf8");
        const inventoryArray = JSON.parse(fileContents);

        inventoryArray.push(sanitizedItem);

        const updatedJson = JSON.stringify(inventoryArray, null, 2);
        await fs.writeFile(filePath, updatedJson);

        return Response.json({
            success: true,
            message: "Appliance added to inventory",
            savedItem: sanitizedItem
        });

    } catch (error) {

        // this returns a generic error message to avoid exposing internal details
        return Response.json(
            { success: false, message: "Something went wrong. Please try again" },
            { status: 500 }
        );
    }
}