"use client"
import { useState } from "react";

export default function DownloadInvoice() {
    const [url, setUrl] = useState("");

    const generateInvoice = async () => {
        const res = await fetch("/api/invoices/generate", { method: "POST", body: JSON.stringify({ invoiceNumber: "12345", totalAmount: 100 }) });
        const data = await res.json();
        console.log(data)
        setUrl(data.url);
    };

    return (
        <div>
            <button onClick={generateInvoice} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Generate Invoice</button>
            {url && <a href={url} download>Download Invoice</a>}
        </div>
    );
}
