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

import webpush, { PushSubscription } from "web-push";

webpush.setVapidDetails(
  "<mailto:kishanpatel7705@gmail.com>",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

let subscription: PushSubscription | null = null;

export async function subscribeUser(sub: PushSubscription) {
  subscription = sub;
  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: sub })
  return { success: true };
}

export async function unsubscribeUser() {
  subscription = null;
  // In a production environment, you would want to remove the subscription from the database
  // For example: await db.subscriptions.delete({ where: { ... } })
  return { success: true };
}

export async function sendNotification(message: string) {
  if (!subscription) {
    throw new Error("No subscription available");
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "Test Notification",
        body: message,
        icon: "/icon.png",
      })
    );
    return { success: true };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return { success: false, error: "Failed to send notification" };
  }
}
