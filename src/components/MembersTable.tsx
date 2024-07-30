import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { MoreVertical, UserPlus, Trash2 } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./ui/table";
import { Button } from "./ui/button";

import { User } from "@clerk/nextjs/server";
import { Organization } from "@/context/OrganisationContext";

interface MembersTableProps {
  members: User[];
  currentOrganization: Organization;
  isAdmin: boolean;
  handleMakeAdmin: (memberId: string) => void;
  handleRemoveMember: (memberId: string) => void;
}


const MembersTable: React.FC<MembersTableProps> = ({
  members,
  currentOrganization,
  isAdmin,
  handleMakeAdmin,
  handleRemoveMember,
}) => {
    return (
      <div className="p-4 bg-white shadow-lg rounded-lg w-full mx-auto">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                      {member.firstName?.[0]}
                      {member.lastName?.[0]}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {member.firstName} {member.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.emailAddresses[0].emailAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.username || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {currentOrganization.author.includes(member.id) ? "Admin" : "Member"}
                  </td>
                  {isAdmin && !currentOrganization.author.includes(member.id) && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="relative inline-block text-left">
                        <button className="text-gray-500 hover:text-gray-700">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block">
                          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            <button
                              onClick={() => handleMakeAdmin(member.id)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                              role="menuitem"
                            >
                              <UserPlus className="inline-block mr-2 h-4 w-4" />
                              Make Admin
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-700 w-full text-left"
                              role="menuitem"
                            >
                              <Trash2 className="inline-block mr-2 h-4 w-4" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
};

export default MembersTable;