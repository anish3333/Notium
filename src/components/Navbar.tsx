import React, { useContext } from "react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import Drawer from "./Drawer";
import { UserContext } from "@/context/UserContext";

const Navbar = () => {
  // const {user} = useContext(UserContext);
  // console.log(user);
  return (
    <div className="flex justify-between w-full m-1 z-10">
      <div className="flex text-white items-center gap-2 text-xl font-bold">
        <Drawer />
        Logo
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
