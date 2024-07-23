// components/NavbarSearchAndSort.tsx

import React from "react";
import { Search, SortDescIcon, ArrowUpDown } from "lucide-react";
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenu,
} from "@radix-ui/react-dropdown-menu";
import { SortCriteria } from "@/types";

interface NavbarSearchAndSortProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortCriteria: SortCriteria;
  sortDirection: "asc" | "desc";
  handleSortSelection: (criteria: SortCriteria) => void;
  toggleSortDirection: () => void;
}

const NavbarSearchAndSort: React.FC<NavbarSearchAndSortProps> = ({
  searchTerm,
  setSearchTerm,
  sortCriteria,
  sortDirection,
  handleSortSelection,
  toggleSortDirection,
}) => {
  return (
    <div className="flex gap-2 w-full items-center justify-between p-2 "> 
      <div className="flex items-center gap-1 bg-gray-700 text-white rounded-md text-sm justify-start w-full box">
        <Search className=" absolute ml-1  text-gray-400 w-4 h-4 " />
        <input
          type="text"
          placeholder="Search..."
          className=" pl-6 py-1 bg-gray-700 text-white rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
        />
      </div>
      <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center p-1 rounded-lg bg-gray-700 text-white hover:bg-blue-500  shadow-lg">
          <SortDescIcon className="w-4 h-4 " />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-gray-700 text-white rounded-md shadow-lg text-sm m-2">
          <DropdownMenuItem
            onClick={() => handleSortSelection("dateCreated")}
            className="px-3 py-1 hover:bg-gray-600"
          >
            Created {sortCriteria === "dateCreated" && (sortDirection === "asc" ? "↑" : "↓")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleSortSelection("title")}
            className="px-3 py-1 hover:bg-gray-600"
          >
            Title {sortCriteria === "title" && (sortDirection === "asc" ? "↑" : "↓")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <button
        onClick={toggleSortDirection}
        className="p-1 rounded-md bg-gray-700 text-white hover:bg-blue-500  shadow-md"
      >
        <ArrowUpDown className="w-4 h-4 " />
      </button>
    </div>
    </div>
  );
};

export default NavbarSearchAndSort;