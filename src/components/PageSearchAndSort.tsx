// components/PageSearchAndSort.tsx

import React from "react";
import { Search, SortDescIcon, ArrowUpDown } from "lucide-react";
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenu,
} from "@radix-ui/react-dropdown-menu";
import { SortCriteria } from "@/types";

interface PageSearchAndSortProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortCriteria: SortCriteria;
  sortDirection: "asc" | "desc";
  handleSortSelection: (criteria: SortCriteria) => void;
  toggleSortDirection: () => void;
}

const PageSearchAndSort: React.FC<PageSearchAndSortProps> = ({
  searchTerm,
  setSearchTerm,
  sortCriteria,
  sortDirection,
  handleSortSelection,
  toggleSortDirection,
}) => {
  return (
    <div className="sticky top-0 z-10 bg-gray-900 p-4 w-full">
      <div className="flex items-center gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-blue-500">
            <span className="mr-2">Sort By</span>
            <SortDescIcon className="w-5 h-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-700 text-white rounded-lg shadow-lg">
            <DropdownMenuItem
              onClick={() => handleSortSelection("dateCreated")}
              className="px-4 py-2 hover:bg-gray-600"
            >
              Created {sortCriteria === "dateCreated" && (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSortSelection("dateModified")}
              className="px-4 py-2 hover:bg-gray-600"
            >
              Modified {sortCriteria === "dateModified" && (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSortSelection("title")}
              className="px-4 py-2 hover:bg-gray-600"
            >
              Title {sortCriteria === "title" && (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          onClick={toggleSortDirection}
          className="flex items-center px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-blue-500"
        >
          <span className="mr-2">{sortDirection === "asc" ? "Ascending" : "Descending"}</span>
          <ArrowUpDown className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PageSearchAndSort;