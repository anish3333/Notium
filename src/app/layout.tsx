// 'use client';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider, useUser } from "@clerk/nextjs";
import NotesListProvider from "@/context/NotesListContext";
import { Toaster } from "@/components/ui/toaster";
import OrganizationProvider from "@/context/OrganisationContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          socialButtonsVariant: "iconButton",
        },
        variables: {
          colorText: "#fff",
          colorPrimary: "#0E78F9",
          colorBackground: "#1C1F2E",
          colorInputBackground: "#252A41",
          colorInputText: "#fff",
        },
      }}
    >
      <html lang="en">
        <body className={`${inter.className} bg-[#0A1929]`}>
          <OrganizationProvider>
            <NotesListProvider>
              {children}
              <Toaster />
            </NotesListProvider>
          </OrganizationProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
