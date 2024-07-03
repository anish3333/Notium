'use client';

import Link from 'next/link';
import React from 'react';
import { Home, LineChart, Package, Package2, Settings, ShoppingCart, Users2, Menu, NotebookTabsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const sidebarLinks = [
  {
    icon: <NotebookTabsIcon className="h-5 w-5" />, 
    text: "Notium",
    href: "#",
    colorClass: "text-white",
    bgColorClass: "bg-primary", 
  },

  // Add more sidebar links with the same structure
];

const Drawer = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <Menu className="h-5 w-5" color='black' />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs bg-black">
        <nav className="grid gap-6 text-lg font-medium">
          {sidebarLinks.map((link, index) => (
            <Link
            key={index}
            href={link.href}
            className={`flex rounded-lg ${link.colorClass} transition-colors md:h-8 md:w-8 ${link.bgColorClass}`} 
           >
             {link.icon}
             <div className=" text-white">{link.text}</div>
           </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default Drawer;
