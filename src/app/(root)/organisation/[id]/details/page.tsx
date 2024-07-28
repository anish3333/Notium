"use client";

import { OrganizationContext } from "@/context/OrganisationContext";
import React, { useContext, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MoreVertical, UserPlus, Trash2, Edit, Shield, LogOut } from "lucide-react";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { UserDB } from "@/types";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Page = () => {
  const {
    currentOrganization,
    removeMemberFromOrganization,
    members,
    deleteOrganization,
    makeAdmin,
  } = useContext(OrganizationContext);
  const { user } = useUser();
  const [admins, setAdmins] = useState<UserDB[]>([]);
  const router = useRouter();

  let isAdmin = user?.id && currentOrganization?.author.includes(user.id);

  const getAdmins = async () => {
    if (!currentOrganization) return;
    
    const admins = await Promise.all(
      currentOrganization.author?.map(async (authorId) => {
        const adminQuery = query(
          collection(db, "users"),
          where("userId", "==", authorId)
        );
        const adminSnapshot = await getDocs(adminQuery);
        const userData = {
          id: authorId,
          ...adminSnapshot.docs[0].data(),
        } as UserDB;
        return userData;
      })
    );
    console.log("Admins:", admins);
    setAdmins(admins);
  };

  useEffect(() => {
    if (currentOrganization?.author) {
      getAdmins();
    }
  }, [currentOrganization?.author]);

  const handleRemoveMember = (memberId: string) => {
    if (!currentOrganization) return;
    removeMemberFromOrganization(currentOrganization.id, memberId);
  };

  const handleMakeAdmin = (memberId: string) => {
    if (!currentOrganization) return;
    makeAdmin(currentOrganization.id, memberId);
    toast({
      title: `${admins.find((admin) => admin.id === memberId)?.name} is now an admin`,
    });
  };

  const handleDelete = async () => {
    if (!currentOrganization) return;
    await deleteOrganization(currentOrganization.id);
    router.push("/organisation");
  };

  const handleLeaveOrg = async () => {
    if (!currentOrganization || !user) return;
    await removeMemberFromOrganization(currentOrganization.id, user.id);
    router.push("/organisation");
  };

  if (!currentOrganization) {
    return <div>Loading...</div>;
  }


  return (
    <div className="px-4 py-8 bg-slate-900 text-slate-100 flex flex-col flex-wrap max-w-full">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-slate-100">
        {currentOrganization.name}
      </h1>

      <div className="flex flex-col flex-wrap space-y-8">
        <div className="bg-slate-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-100 mb-4">Members</h2>
          {/* <div className="overflow-x-hidden"> */}
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="w-12 text-slate-300"></TableHead>
                  <TableHead className="text-slate-300">Name</TableHead>
                  <TableHead className="text-slate-300">Email</TableHead>
                  <TableHead className="text-slate-300">Username</TableHead>
                  <TableHead className="text-slate-300">Role</TableHead>
                  {isAdmin && <TableHead className="text-right text-slate-300">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody className="overflow-x-scroll">
                {members.map((member) => (
                  <TableRow key={member.id} className="border-slate-700">
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={member.imageUrl} alt={member.firstName?.[0]} />
                        <AvatarFallback>
                          {member.firstName?.[0]}
                          {member.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium text-slate-200">
                      {member.firstName} {member.lastName}
                    </TableCell>
                    <TableCell className="text-slate-300 text-wrap">
                      {member.emailAddresses[0].emailAddress}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {member.username || "N/A"}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {currentOrganization.author.includes(member.id) ? "Admin" : "Member"}
                    </TableCell>
                    {isAdmin && !currentOrganization.author.includes(member.id) && (
                      <TableCell className="text-right">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-40 bg-slate-800 border-slate-700">
                            <div className="flex flex-col space-y-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMakeAdmin(member.id)}
                                className="justify-start text-slate-200 hover:text-slate-100 hover:bg-slate-700"
                              >
                                <UserPlus className="mr-2 h-4 w-4" />
                                Make Admin
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMember(member.id)}
                                className="justify-start text-red-400 hover:text-red-300 hover:bg-slate-700"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          {/* </div> */}
        </div>

        {isAdmin && (
          <div className="bg-slate-800 rounded-lg shadow-md p-6 flex flex-col flex-wrap gap-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-100 mb-4">Admin Actions</h2>
            <div className="flex flex-wrap gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="bg-slate-700 text-slate-200 hover:bg-slate-600">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Organization
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-800 text-slate-200 border-slate-700">
                    <p>Edit organization details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="bg-slate-700 text-slate-200 hover:bg-slate-600">
                      <Shield className="w-4 h-4 mr-2" />
                      Manage Permissions
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-800 text-slate-200 border-slate-700">
                    <p>Manage member permissions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={handleDelete} className="bg-slate-700 text-red-400 hover:bg-slate-600 hover:text-red-300">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Organization
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-800 text-slate-200 border-slate-700">
                    <p>Permanently delete this organization</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={handleLeaveOrg} className="bg-slate-700 text-red-400 hover:bg-slate-600 hover:text-red-300">
                      <LogOut className="w-4 h-4 mr-2" />
                      Leave Organization
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-800 text-slate-200 border-slate-700">
                    <p>Leave this organization</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}

        <div className="bg-slate-800 rounded-lg shadow-md p-6 flex flex-col flex-wrap gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-100 mb-4">Organization Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400">ID:</p>
              <p className="text-slate-200">{currentOrganization.id}</p>
            </div>
            <div>
              <p className="text-slate-400">Admins:</p>
              <p className="text-slate-200">
                {admins.map((admin) => admin.email).join(", ")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;