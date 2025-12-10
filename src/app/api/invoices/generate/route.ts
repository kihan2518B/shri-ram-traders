// import { NextResponse } from "next/server";
// import { PDFDocument, StandardFonts } from "pdf-lib";
// import fs from "fs";
// import path from "path";

// export async function POST(req: Request) {
//     const { invoiceNumber, items, totalAmount, customer, invoiceDate, vehicalNumber, gst, organization } = await req.json();
//     const templatePath = path.join(process.cwd(), "public/templates/template4.pdf");
//     const pdfBytes = fs.readFileSync(templatePath);

//     const pdfDoc = await PDFDocument.load(pdfBytes);
//     const form = pdfDoc.getForm();
//     // Load fonts
//     const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
//     const TimesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
//     const HelveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
//     const TimesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
//     const italicBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

//     const grandTotal = totalAmount + gst;
//     const totalAmountInWords = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(grandTotal);

//     // Fill form fields dynamically
//     form.getTextField("OrganizationName")?.setText(organization.name)
//     form.getTextField("OrganizationName")?.updateAppearances(HelveticaBoldFont)
//     form.getTextField("OrganizationAddress")?.setText(organization.address)
//     form.getTextField("OrganizationAddress")?.updateAppearances(TimesRomanFont)
//     form.getTextField("OrganizationGstNumber")?.setText(organization.gstNumber)
//     form.getTextField("OrganizationGstNumber")?.updateAppearances(TimesRomanFont)

//     form.getTextField("OrganizationBankName")?.setText(`${organization.bankName}:`)
//     form.getTextField("OrganizationBankName")?.updateAppearances(TimesRomanBoldFont)
//     form.getTextField("OrganizationAccountNumber")?.setText(organization.accountNumber)
//     form.getTextField("OrganizationAccountNumber")?.updateAppearances(TimesRomanBoldFont)
//     form.getTextField("OrganizationIfscCode")?.setText(`IFSC: ${organization.ifscCode}`)
//     form.getTextField("OrganizationIfscCode")?.updateAppearances(TimesRomanBoldFont)

//     form.getTextField("CustomerName")?.setText(`${customer.name},`)
//     form.getTextField("CustomerName")?.updateAppearances(boldFont)
//     form.getTextField("CustomerAddress")?.setText(customer.address)
//     form.getTextField("CustomerAddress")?.updateAppearances(boldFont)
//     form.getTextField("CustomerGstNumber")?.setText(customer.gstNumber)
//     form.getTextField("CustomerGstNumber")?.updateAppearances(boldFont)

//     form.getTextField("InvoiceNumber")?.setText(invoiceNumber)
//     form.getTextField("InvoiceNumber")?.updateAppearances(boldFont)
//     form.getTextField("InvoiceDate")?.setText(`${new Date(invoiceDate).getDay()}/${new Date(invoiceDate).getMonth()}/${new Date(invoiceDate).getFullYear()}`)
//     form.getTextField("InvoiceDate")?.updateAppearances(boldFont)

//     for (let i = 1; i < items.length + 1; i++) {
//         const item = items[i - 1];
//         form.getTextField(`Item${i}Description`)?.setText(`${item.hsnCode} - ${item.name}`);
//         form.getTextField(`Item${i}Description`)?.updateAppearances(boldFont);
//         form.getTextField(`Item${i}Quantity`)?.setText(`${item.quantity}`);
//         form.getTextField(`Item${i}Quantity`)?.updateAppearances(boldFont)
//         form.getTextField(`Item${i}Price`)?.setText(`${item.price}`);
//         form.getTextField(`Item${i}Price`)?.updateAppearances(boldFont)
//         form.getTextField(`Item${i}Unit`)?.setText(`${item.unit}`);
//         form.getTextField(`Item${i}Unit`)?.updateAppearances(boldFont)
//         form.getTextField(`Item${i}Amount`)?.setText(`${item.amount}`);
//         form.getTextField(`Item${i}Amount`)?.updateAppearances(boldFont)
//     }

//     form.getTextField("TotalAmount")?.setText(`${totalAmount}`);
//     form.getTextField("TotalAmount")?.updateAppearances(boldFont)
//     form.getTextField("VehicalNumber")?.setText(vehicalNumber)
//     form.getTextField("VehicalNumber")?.updateAppearances(boldFont)
//     form.getTextField("sgst")?.setText(`${gst / 2}`)
//     form.getTextField("cgst")?.setText(`${gst / 2}`)
//     form.getTextField("GrandTotal")?.setText(`${grandTotal}`)
//     form.getTextField("GrandTotal")?.updateAppearances(boldFont)
//     form.getTextField("TotalAmountInWords")?.setText(`${totalAmountInWords}`)
//     form.getTextField("TotalAmountInWords")?.updateAppearances(TimesRomanFont)
//     form.getTextField("For")?.setText(`For ${organization.name}`)
//     form.getTextField("For")?.updateAppearances(italicBoldFont)

//     form.flatten()
//     const newPdfBytes = await pdfDoc.save();
//     console.log("newPdfBytes: ", newPdfBytes)
//     const outputPath = path.join(process.cwd(), "public/generated/invoice.pdf");
//     fs.writeFileSync(outputPath, newPdfBytes);

//     return NextResponse.json({ message: "Invoice generated", url: "/generated/invoice.pdf" });
// }

import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";
function numberToWords(num: number): string {
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertToWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + convertToWords(n % 100) : "")
      );
    if (n < 100000)
      return (
        convertToWords(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000 ? " " + convertToWords(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        convertToWords(Math.floor(n / 100000)) +
        " Lakh" +
        (n % 100000 ? " " + convertToWords(n % 100000) : "")
      );
    return (
      convertToWords(Math.floor(n / 10000000)) +
      " Crore" +
      (n % 10000000 ? " " + convertToWords(n % 10000000) : "")
    );
  }

  return convertToWords(num) + " Only";
}

export async function POST(req: Request) {
  const {
    invoiceNumber,
    items,
    totalAmount,
    customer,
    invoiceDate,
    vehicalNumber,
    gstAmount,
    gstPercentage,
    organization,
  } = await req.json();
  const isFireWood = items.some((item: any) => item.name == "FireWood");
  console.log("items: ", items, isFireWood);
  // Load the template PDF
  const templatePath = path.join(
    process.cwd(),
    `public/templates/${isFireWood ? "templateJ" : "template8"}.pdf`
  );
  const pdfBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();

  // Embed fonts
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBoldFont = await pdfDoc.embedFont(
    StandardFonts.TimesRomanBold
  );
  const italicBoldFont = await pdfDoc.embedFont(
    StandardFonts.HelveticaBoldOblique
  );

  // Calculate grand total
  const grandTotal = totalAmount + gstAmount;
  // Format total amount in words without the Rupee symbol
  const totalAmountInWords = numberToWords(grandTotal);
  console.log("totalAmountInWords: ", totalAmountInWords);

  // Fill form fields
  form.getTextField("OrganizationName")?.setText(organization.name);
  form.getTextField("OrganizationName")?.updateAppearances(boldFont);
  form.getTextField("OrganizationAddress")?.setText(organization.address);
  form.getTextField("OrganizationAddress")?.updateAppearances(timesRomanFont);
  form.getTextField("OrganizationGstNumber")?.setText(organization.gstNumber);
  form.getTextField("OrganizationGstNumber")?.updateAppearances(timesRomanFont);

  form
    .getTextField("OrganizationBankName")
    ?.setText(`${organization.bankName}:`);
  form
    .getTextField("OrganizationBankName")
    ?.updateAppearances(timesRomanBoldFont);
  form
    .getTextField("OrganizationAccountNumber")
    ?.setText(organization.accountNumber);
  form
    .getTextField("OrganizationAccountNumber")
    ?.updateAppearances(timesRomanBoldFont);
  form
    .getTextField("OrganizationIfscCode")
    ?.setText(`IFSC: ${organization.ifscCode}`);
  form
    .getTextField("OrganizationIfscCode")
    ?.updateAppearances(timesRomanBoldFont);

  // form.getTextField('CustomerName')?.setText(`${customer?.name || 'N/A'},`);
  // form.getTextField('CustomerName')?.updateAppearances(boldFont);
  // form.getTextField('CustomerAddress')?.setText(customer?.address || 'N/A');
  // form.getTextField('CustomerAddress')?.updateAppearances(boldFont);
  form
    .getTextField("CustomerDetails")
    ?.setText(
      `PARTY DETAILS: ${customer?.name || "N/A"},${customer?.address || "N/A"}`
    );
  form.getTextField("CustomerDetails")?.updateAppearances(boldFont);
  if (customer.gstNumber.trim() !== "") {
    form
      .getTextField("CustomerGstNumber")
      ?.setText(`${isFireWood ? "GST" : ""}${customer?.gstNumber || "N/A"}`);
  }
  form.getTextField("CustomerGstNumber")?.updateAppearances(boldFont);

  form.getTextField("InvoiceNumber")?.setText(invoiceNumber);
  form.getTextField("InvoiceNumber")?.updateAppearances(boldFont);
  form.getTextField("InvoiceDate")?.setText(
    new Date(invoiceDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  );
  form.getTextField("InvoiceDate")?.updateAppearances(boldFont);

  for (let i = 1; i <= items.length; i++) {
    const item = items[i - 1];
    form
      .getTextField(`Item${i}Description`)
      ?.setText(`${item.hsnCode || "N/A"} - ${item.name}`);
    form.getTextField(`Item${i}Description`)?.updateAppearances(boldFont);
    form.getTextField(`Item${i}Quantity`)?.setText(`${item.quantity}`);
    form.getTextField(`Item${i}Quantity`)?.updateAppearances(boldFont);
    form.getTextField(`Item${i}Price`)?.setText(`${item.price}`);
    form.getTextField(`Item${i}Price`)?.updateAppearances(boldFont);
    form.getTextField(`Item${i}Unit`)?.setText(`${item.unit || "N/A"}`);
    form.getTextField(`Item${i}Unit`)?.updateAppearances(boldFont);
    form.getTextField(`Item${i}Amount`)?.setText(`${item.amount}`);
    form.getTextField(`Item${i}Amount`)?.updateAppearances(boldFont);
  }

  form.getTextField("TotalAmount")?.setText(`${totalAmount}`);
  form.getTextField("TotalAmount")?.updateAppearances(boldFont);
  form.getTextField("VehicalNumber")?.setText(vehicalNumber);
  form.getTextField("VehicalNumber")?.updateAppearances(boldFont);
  if (gstPercentage !== 0) {
    const halfGst = gstPercentage / 2;
    const displayHalfGstPercentage =
      halfGst % 1 === 0 ? halfGst.toFixed(0) : halfGst.toString();
    form.getTextField("gst1")?.setText(`${displayHalfGstPercentage}%`);
    form.getTextField("gst2")?.setText(`${displayHalfGstPercentage}%`);
    form.getTextField("sgst")?.setText(`${(gstAmount / 2).toFixed(0)}`);
    form.getTextField("cgst")?.setText(`${(gstAmount / 2).toFixed(0)}`);
  }
  form.getTextField("GrandTotal")?.setText(`${grandTotal}`);
  form.getTextField("GrandTotal")?.updateAppearances(boldFont);
  form.getTextField("TotalAmountInWords")?.setText(totalAmountInWords);
  form.getTextField("TotalAmountInWords")?.updateAppearances(timesRomanFont);
  form.getTextField("For")?.setText(`For ${organization.name}`);
  form.getTextField("For")?.updateAppearances(italicBoldFont);

  // Flatten the form
  form.flatten();

  // Save the PDF bytes
  const newPdfBytes = await pdfDoc.save();

  // Set the filename dynamically
  const fileName = `invoice-${invoiceNumber}-${organization.name.replace(
    /\s+/g,
    ""
  )}.pdf`;

  // Return the PDF as a downloadable response
  return new NextResponse(newPdfBytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
