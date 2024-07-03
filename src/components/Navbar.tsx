import React, { useContext } from "react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import Drawer from "./Drawer";
import { UserContext } from "@/context/UserContext";

const Navbar = () => {
  // const {user} = useContext(UserContext);
  // console.log(user);
  return (
    <div className="sm:hidden flex justify-between w-full p-4 z-10 mr-[4rem]">
      <div className="flex text-slate-300 items-center gap-2 text-xl font-bold">
        <Drawer />
      </div>
      <div className="flex items-center gap-2">
        {/* <div className="flex items-center gap-2">
          <button 
          className="text-xl font-bold bg-pink-500 "
          onClick={deleteSelectedNotes}
          >
            Delete  
          </button>
        </div> */}
        <SignedIn>
          <UserButton />
        </SignedIn>
        </div>
    </div>
  );
};

export default Navbar;
