import { PDFDocument, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
import { toWords } from 'number-to-words';
import { Customer, Organization } from "@prisma/client";

type Data = {
    items: any,
    organization: Organization,
    customer: Customer,
    totalAmount: number,
    gstAmount: number,
    grandTotal: number,
    vehicalNumber: string,
    invoiceNumber: string
}

export async function CreatePdfFromTemplate(data: Data, templatePath: string) {
    const { customer, invoiceNumber, organization, items, totalAmount, gstAmount, grandTotal, vehicalNumber } = data
    //Making pdf
    const pdfBytes = fs.readFileSync(templatePath);

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    // Load fonts
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const TimesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const HelveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const TimesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const italicBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

    const totalAmountInWords = toWords(grandTotal) + " only";
    // const totalAmountInWords = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(grandTotal).replace("₹", "INR");
    console.log("totalAmountInWords: ", totalAmountInWords);

    // Fill form fields dynamically
    form.getTextField("OrganizationName")?.setText(organization.name.toUpperCase())
    form.getTextField("OrganizationName")?.updateAppearances(HelveticaBoldFont)
    form.getTextField("OrganizationAddress")?.setText(organization.address)
    form.getTextField("OrganizationAddress")?.updateAppearances(TimesRomanFont)
    form.getTextField("OrganizationGstNumber")?.setText(`GSTIN: ${organization.gstNumber}`)
    form.getTextField("OrganizationGstNumber")?.updateAppearances(TimesRomanFont)

    form.getTextField("OrganizationBankName")?.setText(`${organization.bankName}:`)
    form.getTextField("OrganizationBankName")?.updateAppearances(TimesRomanBoldFont)
    form.getTextField("OrganizationAccountNumber")?.setText(organization.accountNumber)
    form.getTextField("OrganizationAccountNumber")?.updateAppearances(TimesRomanBoldFont)
    form.getTextField("OrganizationIfscCode")?.setText(`IFSC: ${organization.ifscCode}`)
    form.getTextField("OrganizationIfscCode")?.updateAppearances(TimesRomanBoldFont)

    form.getTextField("CustomerDetails")?.setText(`PARTY DETAILS: ${customer?.name.trim()},${customer?.address.trim()}`)
    form.getTextField("CustomerDetails")?.updateAppearances(boldFont)
    form.getTextField("CustomerGstNumber")?.setText(customer?.gstNumber)
    form.getTextField("CustomerGstNumber")?.updateAppearances(boldFont)
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

    form.getTextField("InvoiceNumber")?.setText(`${invoiceNumber}`)
    form.getTextField("InvoiceNumber")?.updateAppearances(boldFont)
    form.getTextField("InvoiceDate")?.setText(formattedDate)
    form.getTextField("InvoiceDate")?.updateAppearances(boldFont)

    for (let i = 1; i < items.length + 1; i++) {
        const item = items[i - 1];
        form.getTextField(`Item${i}Description`)?.setText(`${item.hsnCode} - ${item.name}`);
        form.getTextField(`Item${i}Description`)?.updateAppearances(boldFont);
        form.getTextField(`Item${i}Quantity`)?.setText(`${item.quantity}`);
        form.getTextField(`Item${i}Quantity`)?.updateAppearances(boldFont)
        form.getTextField(`Item${i}Price`)?.setText(`${item.price}`);
        form.getTextField(`Item${i}Price`)?.updateAppearances(boldFont)
        form.getTextField(`Item${i}Unit`)?.setText(`${item.unit}`);
        form.getTextField(`Item${i}Unit`)?.updateAppearances(boldFont)
        form.getTextField(`Item${i}Amount`)?.setText(`${item.amount}`);
        form.getTextField(`Item${i}Amount`)?.updateAppearances(boldFont)
    }

    form.getTextField("TotalAmount")?.setText(`${totalAmount}`);
    form.getTextField("TotalAmount")?.updateAppearances(boldFont)
    form.getTextField("VehicalNumber")?.setText(`${vehicalNumber}`)
    form.getTextField("VehicalNumber")?.updateAppearances(boldFont)
    form.getTextField("sgst")?.setText(`${(gstAmount / 2).toFixed(0)}`)
    form.getTextField("cgst")?.setText(`${(gstAmount / 2).toFixed(0)}`)
    form.getTextField("GrandTotal")?.setText(`${grandTotal}`)
    form.getTextField("GrandTotal")?.updateAppearances(boldFont)
    form.getTextField("TotalAmountInWords")?.setText(`${totalAmountInWords}`)
    form.getTextField("TotalAmountInWords")?.updateAppearances(TimesRomanFont)
    form.getTextField("For")?.setText(`For ${organization.name}`)
    form.getTextField("For")?.updateAppearances(italicBoldFont)

    form.flatten()
    const newPdfBytes = await pdfDoc.save();
    console.log("newPdfBytes: ", newPdfBytes)
    const outputPath = path.join(process.cwd(), "public/generated/invoice.pdf");
    fs.writeFileSync(outputPath, newPdfBytes);

    return outputPath
}