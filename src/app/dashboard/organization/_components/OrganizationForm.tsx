"use client";

import React, { useState } from "react";
import { supabaseClient } from "@/utils/supabase";
import Image from "next/image";
import { UploadFile } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { Plus, Upload } from "lucide-react";

export default function OrganizationForm() {
  const [name, setName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [address, setAddress] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];

    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast.error(
        "Invalid File Type\nPlease upload a JPG, PNG, or GIF image.",
        {
          style: {
            background: "#neutral-white",
            color: "#accent-red",
            fontFamily: "inherit",
            fontSize: "0.875rem", // Matches text-sm
            fontWeight: "500", // Medium weight
            border: "1px solid #accent-red",
          },
        }
      );
      return;
    }

    if (file.size > maxSize) {
      toast.error("File Too Large\nImage must be smaller than 5MB.", {
        style: {
          background: "#neutral-white",
          color: "#accent-red",
          fontFamily: "inherit",
          fontSize: "0.875rem",
          fontWeight: "500",
          border: "1px solid #accent-red",
        },
      });
      return;
    }

    setLogo(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data } = await supabaseClient.auth.getUser();

      if (
        !name ||
        !gstNumber ||
        !address ||
        !bankName ||
        !accountNumber ||
        !ifscCode ||
        !logo
      ) {
        toast.error(
          "Incomplete Form\nPlease fill in all fields and upload a logo.",
          {
            style: {
              background: "#neutral-white",
              color: "#accent-red",
              fontFamily: "inherit",
              fontSize: "0.875rem",
              fontWeight: "500",
              border: "1px solid #accent-red",
            },
          }
        );
        setIsSubmitting(false);
        return;
      }

      const { publicUrl, error: uploadError } = await UploadFile(
        logo,
        "images",
        "images"
      );
      if (uploadError) {
        toast.error("Upload Failed\nFailed to upload logo. Please try again.", {
          style: {
            background: "#neutral-white",
            color: "#accent-red",
            fontFamily: "inherit",
            fontSize: "0.875rem",
            fontWeight: "500",
            border: "1px solid #accent-red",
          },
        });
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          gstNumber,
          address,
          bankName,
          accountNumber,
          ifscCode,
          userId: data.user?.id,
          logo: publicUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create organization");
      }

      toast.success(
        "Organization Added\nNew organization created successfully.",
        {
          style: {
            background: "#neutral-white",
            color: "#primary",
            fontFamily: "inherit",
            fontSize: "0.875rem",
            fontWeight: "500",
            border: "1px solid #primary",
          },
        }
      );

      setName("");
      setGstNumber("");
      setAddress("");
      setBankName("");
      setAccountNumber("");
      setIfscCode("");
      setLogo(null);
      setPreviewImage("");
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Error\nFailed to create organization. Please try again.", {
        style: {
          background: "#neutral-white",
          color: "#accent-red",
          fontFamily: "inherit",
          fontSize: "0.875rem",
          fontWeight: "500",
          border: "1px solid #accent-red",
        },
      });
      console.error("Error creating organization:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto px-6 py-2.5 text-white bg-primary hover:bg-primary-hover focus:ring-2 focus:ring-primary-ring transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Add New Organization
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto bg-neutral-white rounded-lg shadow-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-neutral-heading text-xl font-semibold">
            Add New Organization
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="name"
                className="text-neutral-text text-sm font-medium mb-1"
              >
                Organization Name
              </Label>
              <Input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter organization name"
                required
                className="p-2.5 rounded-md border border-neutral-border focus:ring-2 focus:ring-primary-ring focus:border-primary"
              />
            </div>
            <div>
              <Label
                htmlFor="gstNumber"
                className="text-neutral-text text-sm font-medium mb-1"
              >
                GST Number
              </Label>
              <Input
                type="text"
                id="gstNumber"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                placeholder="Enter GST number"
                required
                className="p-2.5 rounded-md border border-neutral-border focus:ring-2 focus:ring-primary-ring focus:border-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <Label
                htmlFor="address"
                className="text-neutral-text text-sm font-medium mb-1"
              >
                Address
              </Label>
              <Input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter full address"
                required
                className="p-2.5 rounded-md border border-neutral-border focus:ring-2 focus:ring-primary-ring focus:border-primary"
              />
            </div>
            <div>
              <Label
                htmlFor="bank-name"
                className="text-neutral-text text-sm font-medium mb-1"
              >
                Bank Name
              </Label>
              <Input
                type="text"
                id="bank-name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Enter bank name"
                required
                className="p-2.5 rounded-md border border-neutral-border focus:ring-2 focus:ring-primary-ring focus:border-primary"
              />
            </div>
            <div>
              <Label
                htmlFor="bank-account-number"
                className="text-neutral-text text-sm font-medium mb-1"
              >
                Account Number
              </Label>
              <Input
                type="text"
                id="bank-account-number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                required
                className="p-2.5 rounded-md border border-neutral-border focus:ring-2 focus:ring-primary-ring focus:border-primary"
              />
            </div>
            <div>
              <Label
                htmlFor="ifsc"
                className="text-neutral-text text-sm font-medium mb-1"
              >
                IFSC Code
              </Label>
              <Input
                type="text"
                id="ifsc"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                placeholder="Enter IFSC code"
                required
                className="p-2.5 rounded-md border border-neutral-border focus:ring-2 focus:ring-primary-ring focus:border-primary"
              />
            </div>
            <div className="sm:col-span-2">
              <Label
                htmlFor="logo"
                className="text-neutral-text text-sm font-medium mb-1"
              >
                Company Logo
              </Label>
              <div className="flex items-center gap-4">
                <label className="flex-grow flex items-center gap-2 p-2.5 rounded-md border border-neutral-border bg-neutral-white hover:bg-neutral-light cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 text-neutral-text" />
                  <span className="text-neutral-text">
                    {logo ? logo.name : "Upload logo"}
                  </span>
                  <Input
                    type="file"
                    id="logo"
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/gif"
                    className="hidden"
                  />
                </label>
                {previewImage && (
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={previewImage}
                      alt="Logo Preview"
                      fill
                      className="object-contain rounded-md border border-neutral-border"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-2.5 text-white bg-primary hover:bg-primary-hover disabled:bg-primary-disabled focus:ring-2 focus:ring-primary-ring transition-colors"
          >
            {isSubmitting ? "Adding Organization..." : "Add Organization"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
