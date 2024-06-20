import React from "react";
import { SignedIn, UserButton } from "@clerk/nextjs";

const Navbar = () => {
  return (
    <div className="sticky flex justify-between text-white p-4">
      <button className="flex items-center gap-2 text-xl font-bold">
        Logo
      </button>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
};

export default Navbar;
