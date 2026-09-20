"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  Save,
  Truck,
  Receipt,
  List,
  PlusCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCustomers, useOrganizations } from "@/hooks/useInvoiceFilters";
import { useInvoices } from "@/hooks/invoice";
import { useRouter } from "next/navigation";

const gstOptions = [
  { label: "5%", value: 5 },
  { label: "0%", value: 0 },
  { label: "12%", value: 12 },
  { label: "18%", value: 18 },
  { label: "28%", value: 28 },
];

const productData = {
  WoodenSize: { hsn: "4407", unit: "CBM" },
  Limdo: { hsn: "4407", unit: "CBM" },
  FireWood: { hsn: "4401", unit: "KG" },
  WoodLogRound: { hsn: "4401", unit: "KG" },
  WoodenDust: { hsn: "4401", unit: "KG" },
};
const productsOptions = [
  { label: "Limdo", value: "Limdo" },
  { label: "Wooden Size", value: "WoodenSize" },
  { label: "Fire Wood", value: "FireWood" },
  { label: "Wood Log Round", value: "WoodLogRound" },
  { label: "Wooden Dust", value: "WoodenDust" },
];

export default function InvoiceForm({ user }: { user: any }) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [vehicalNumber, setVehicalNumber] = useState("");
  const [invoiceType, setInvoiceType] = useState<"DEBIT" | "CREDIT">("DEBIT");
  const [gstPercentage, setGstPercentage] = useState(18);
  const [referenceInvoiceNumber, setReferenceInvoiceNumber] = useState("");
  const [uplak, setUplak] = useState<string | null>(null);
  const [items, setItems] = useState([
    { name: "", hsnCode: "", quantity: 0, price: 0, unit: "", amount: 0 },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isItemsExpanded, setIsItemsExpanded] = useState(true);

  const { data: customers, isLoading: isCustomerLoading } = useCustomers();
  const { data: organizations, isLoading: isOrganizationLoading } =
    useOrganizations();
  const { refetch } = useInvoices(user);

  useEffect(() => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.name && productData[item.name as keyof typeof productData]) {
          const productInfo =
            productData[item.name as keyof typeof productData];
          return {
            ...item,
            hsnCode: productInfo.hsn,
            unit: productInfo.unit,
          };
        }
        return item;
      }),
    );
  }, [items.map((item) => item.name).join(",")]);

  const submitInvoice = async (redirectToList: boolean) => {
    setIsSubmitting(true);
    if (vehicalNumber.length < 9) {
      toast.error("Vehicle number should be in this format GJ00XX0000");
      setIsSubmitting(false);
      return;
    }
    try {
      const totalAmount = Number(
        items.reduce((sum, item) => sum + item.amount, 0).toFixed(0),
      );
      const gstAmount = Number(
        (totalAmount * (gstPercentage / 100)).toFixed(0),
      );
      const grandTotal = Number((totalAmount + gstAmount).toFixed(0));

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          organizationId,
          items,
          totalAmount,
          gstAmount,
          grandTotal,
          uplak,
          vehicalNumber: vehicalNumber.toUpperCase(),
          invoiceType,
          gstPercentage,
          referenceInvoiceNumber:
            invoiceType === "CREDIT" ? referenceInvoiceNumber : null,
        }),
      });

      if (!response.ok) throw new Error("Failed to create invoice");

      toast.success(
        `${invoiceType} Invoice created successfully (₹${grandTotal.toFixed(2)})`,
      );

      refetch();

      if (redirectToList) {
        router.push("/dashboard/bills");
      } else {
        setCustomerId("");
        setOrganizationId("");
        setVehicalNumber("");
        setReferenceInvoiceNumber("");
        setUplak(null);
        setItems([
          { name: "", hsnCode: "", quantity: 0, price: 0, unit: "", amount: 0 },
        ]);
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      { name: "", hsnCode: "", quantity: 0, price: 0, unit: "", amount: 0 },
    ]);
    toast.success("Item added to invoice.");
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
      toast.success("Item removed from invoice");
    }
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    if (!newItems[index]) return;
    newItems[index] = { ...newItems[index], [field]: value };

    if (
      field === "name" &&
      value &&
      productData[value as keyof typeof productData]
    ) {
      const productInfo = productData[value as keyof typeof productData];
      newItems[index].hsnCode = productInfo.hsn;
      newItems[index].unit = productInfo.unit;
    }

    if (field === "quantity" || field === "price") {
      const quantity = parseFloat(newItems[index].quantity.toString()) || 0;
      const price = parseFloat(newItems[index].price.toString()) || 0;
      newItems[index].amount = Number((quantity * price).toFixed(0));
    }

    setItems(newItems);
  };

  const totalAmount = Array.isArray(items)
    ? items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
    : 0;
  const gstAmount = Math.round(totalAmount * (gstPercentage / 100));
  const grandTotal = Number(totalAmount) + Number(gstAmount);

  return (
    <div className="w-full mx-auto p-3 sm:p-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitInvoice(true);
        }}
        className="bg-white p-4 sm:p-6 rounded-lg shadow-md space-y-5 border border-gray-200"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
          Create New Invoice
        </h2>

        {/* Invoice Type Tabs */}
        <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-5">
          <button
            type="button"
            onClick={() => setInvoiceType("DEBIT")}
            className={`flex-1 py-3 px-4 text-center font-medium transition-all ${
              invoiceType === "DEBIT"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Debit Invoice (Sales Out)
          </button>
          <button
            type="button"
            onClick={() => setInvoiceType("CREDIT")}
            className={`flex-1 py-3 px-4 text-center font-medium transition-all ${
              invoiceType === "CREDIT"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Credit Invoice (Purchase In)
          </button>
        </div>

        {/* Customer & Organization Selection */}
        <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
          <div className="relative">
            <label
              htmlFor="customerId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Customer
            </label>
            <div className="relative">
              <select
                id="customerId"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
                disabled={isCustomerLoading}
                className="w-full p-3 rounded-md border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Select a customer</option>
                {isCustomerLoading ? (
                  <option>Loading...</option>
                ) : Array.isArray(customers?.customers) ? (
                  customers.customers.map((customer: any) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No customers found</option>
                )}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="relative">
            <label
              htmlFor="organizationId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Organization
            </label>
            <div className="relative">
              <select
                id="organizationId"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                required
                disabled={isOrganizationLoading}
                className="w-full p-3 rounded-md border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Select an organization</option>
                {isOrganizationLoading ? (
                  <option>Loading...</option>
                ) : Array.isArray(organizations?.organizations) ? (
                  organizations.organizations.map((org: any) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No organizations found</option>
                )}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Vehicle Number, GST Rate & Reference Invoice Number */}
        <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
          <div>
            <label
              htmlFor="vehicalNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Vehicle Number
            </label>
            <div className="relative">
              <input
                id="vehicalNumber"
                type="text"
                value={vehicalNumber}
                onChange={(e) => setVehicalNumber(e.target.value.toUpperCase())}
                placeholder="e.g. GJ01XX1234"
                className="w-full p-3 pl-9 rounded-md border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500"
              />
              <Truck className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="relative">
            <label
              htmlFor="gstPercentage"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              GST Rate
            </label>
            <div className="relative">
              <select
                id="gstPercentage"
                value={gstPercentage}
                onChange={(e) => setGstPercentage(Number(e.target.value))}
                className="w-full p-3 rounded-md border border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                {gstOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label
              htmlFor="uplak"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Uplak Amount
            </label>
            <input
              id="uplak"
              type="text"
              value={uplak ?? ""}
              onChange={(e) => setUplak(e.target.value)}
              placeholder="Enter Uplak Amount"
              className="w-full p-3 rounded-md border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {invoiceType === "CREDIT" && (
          <div>
            <label
              htmlFor="referenceInvoiceNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Reference Invoice Number
            </label>
            <div className="relative">
              <input
                id="referenceInvoiceNumber"
                type="text"
                value={referenceInvoiceNumber}
                onChange={(e) => setReferenceInvoiceNumber(e.target.value)}
                placeholder="Enter vendor invoice number"
                required
                className="w-full p-3 pl-9 rounded-md border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500"
              />
              <Receipt className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            </div>
          </div>
        )}

        {/* Invoice Items */}
        <div className="mt-6 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
          <button
            type="button"
            onClick={() => setIsItemsExpanded(!isItemsExpanded)}
            className="w-full flex items-center justify-between p-4 text-left font-medium bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <span className="flex items-center gap-2 text-gray-800">
              <span className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full text-xs font-bold">
                {items.length}
              </span>
              Invoice Items Breakdown
            </span>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${isItemsExpanded ? "rotate-180" : ""}`}
            />
          </button>

          {isItemsExpanded && (
            <div className="p-4 space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-md shadow-sm border border-gray-200"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">
                      Item #{index + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Product Name
                      </label>
                      <select
                        value={item.name}
                        onChange={(e) =>
                          updateItem(index, "name", e.target.value)
                        }
                        required
                        className="w-full p-2.5 rounded-md border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a product</option>
                        {productsOptions.map((product) => (
                          <option key={product.value} value={product.value}>
                            {product.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        HSN Code
                      </label>
                      <input
                        type="text"
                        placeholder="HSN Code"
                        value={item.hsnCode}
                        onChange={(e) =>
                          updateItem(index, "hsnCode", e.target.value)
                        }
                        required
                        className="w-full p-2.5 rounded-md border border-gray-300 text-sm bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity || ""}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "quantity",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        required
                        min="0"
                        step="0.0001"
                        className="w-full p-2.5 rounded-md border border-gray-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Price per Unit (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="Price"
                        value={item.price || ""}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "price",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        required
                        min="0"
                        step="0.01"
                        className="w-full p-2.5 rounded-md border border-gray-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Unit
                      </label>
                      <input
                        type="text"
                        placeholder="Unit"
                        value={item.unit}
                        onChange={(e) =>
                          updateItem(index, "unit", e.target.value)
                        }
                        className="w-full p-2.5 rounded-md border border-gray-300 text-sm bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Amount (₹)
                    </label>
                    <input
                      type="text"
                      value={`₹${item.amount.toFixed(2)}`}
                      disabled
                      className="w-full p-2.5 rounded-md border border-gray-200 bg-gray-100 font-bold text-gray-800 text-sm"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addItem}
                className="mt-3 flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-semibold text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
          )}
        </div>

        {/* Totals Summary */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
          <div className="flex justify-between text-gray-600 text-sm">
            <span>Subtotal:</span>
            <span>₹{totalAmount.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-gray-600 text-sm">
            <span>GST ({gstPercentage}%):</span>
            <span>₹{gstAmount.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
            <span>Grand Total:</span>
            <span>₹{grandTotal.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center gap-2 font-semibold shadow-sm"
          >
            <List className="w-5 h-5" />
            Save
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => submitInvoice(false)}
            className="flex-1 px-6 py-3 text-blue-600 bg-blue-50 border border-blue-600 rounded-md hover:bg-blue-100 disabled:bg-gray-100 transition-colors flex items-center justify-center gap-2 font-semibold"
          >
            <PlusCircle className="w-5 h-5" />
            Save & New
          </button>
        </div>
      </form>
    </div>
  );
}
