"use client";

import { useState } from "react";
import { Organization } from "@prisma/client";
import { updateOrganization } from "@/app/actions";
import { X, Upload, Building, CreditCard, MapPin, Landmark, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EditOrganizationDialog({
  org,
  onClose,
}: {
  org: Organization;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    id: org.id,
    name: org.name,
    gstNumber: org.gstNumber,
    logo: org.logo || "",
    address: org.address,
    bankName: org.bankName,
    accountNumber: org.accountNumber,
    ifscCode: org.ifscCode,
    policy: org.policy || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      for (const [key, value] of Object.entries(formData)) {
        data.append(key, value);
      }
      await updateOrganization(data);
      onClose();
    } catch (error) {
      console.error("Error updating organization:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-navy-800">
            Edit Organization
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Update your organization details and preferences
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-navy-700">
                <Building size={16} className="inline mr-2" />
                Organization Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="border-gray-300 focus:border-navy-500 focus:ring-navy-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gstNumber" className="text-navy-700">
                <FileText size={16} className="inline mr-2" />
                GST Number
              </Label>
              <Input
                id="gstNumber"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                className="border-gray-300 focus:border-navy-500 focus:ring-navy-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-navy-700">
              <MapPin size={16} className="inline mr-2" />
              Address
            </Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="border-gray-300 focus:border-navy-500 focus:ring-navy-500 min-h-24"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankName" className="text-navy-700">
                <Landmark size={16} className="inline mr-2" />
                Bank Name
              </Label>
              <Input
                id="bankName"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                className="border-gray-300 focus:border-navy-500 focus:ring-navy-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber" className="text-navy-700">
                <CreditCard size={16} className="inline mr-2" />
                Account Number
              </Label>
              <Input
                id="accountNumber"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                className="border-gray-300 focus:border-navy-500 focus:ring-navy-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ifscCode" className="text-navy-700">
                <CreditCard size={16} className="inline mr-2" />
                IFSC Code
              </Label>
              <Input
                id="ifscCode"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                className="border-gray-300 focus:border-navy-500 focus:ring-navy-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo" className="text-navy-700">
              <Upload size={16} className="inline mr-2" />
              Logo URL
            </Label>
            <Input
              id="logo"
              name="logo"
              value={formData.logo}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
              className="border-gray-300 focus:border-navy-500 focus:ring-navy-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="policy" className="text-navy-700">
              Policy (optional)
            </Label>
            <Textarea
              id="policy"
              name="policy"
              value={formData.policy}
              onChange={handleChange}
              placeholder="Enter your organization policy or terms..."
              className="border-gray-300 focus:border-navy-500 focus:ring-navy-500 min-h-24"
            />
          </div>

          <input type="hidden" name="id" value={formData.id} />

          <DialogFooter className="mt-6 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-white hover:bg-gray-100 text-gray-700 border-gray-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-navy-600 hover:bg-navy-700 text-white"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}