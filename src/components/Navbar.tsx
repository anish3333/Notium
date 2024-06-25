import React, { useContext } from "react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { UserContext } from "@/context/UserContext";

const Navbar = ({deleteSelectedNotes}: {deleteSelectedNotes: () => void}) => {
  const {user} = useContext(UserContext);
  // console.log(user);
  return (
    <div className="sticky flex justify-between text-white px-6 py-6 max-md:pb-14 sm:px-14 ">
      <button className="flex items-center gap-2 text-xl font-bold">
        Logo
      </button>
      <div className="flex items-center gap-2">
        <button 
        className="text-xl font-bold bg-pink-500 "
        onClick={deleteSelectedNotes}
        >
          Delete  
        </button>
      </div>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
};

export default Navbar;
