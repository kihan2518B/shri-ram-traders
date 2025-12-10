// app/actions.ts
"use server";

import prisma from "@/lib/prisma";

export async function updateOrganization(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const gstNumber = formData.get("gstNumber") as string;
  const logo = formData.get("logo") as string | null;
  const address = formData.get("address") as string;
  const bankName = formData.get("bankName") as string;
  const accountNumber = formData.get("accountNumber") as string;
  const ifscCode = formData.get("ifscCode") as string;
  const policy = formData.get("policy") as string | null;

  await prisma.organization.update({
    where: { id },
    data: {
      name,
      gstNumber,
      logo: logo || null,
      address,
      bankName,
      accountNumber,
      ifscCode,
      policy: policy || null,
    },
  });
}