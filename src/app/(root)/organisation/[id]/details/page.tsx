"use client";

import { OrganizationContext } from "@/context/OrganisationContext";
import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Edit,
  Shield,
  Trash2,
  LogOut,
  Users,
  Info,
  Settings,
  Share2,
} from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { UserDB } from "@/types";
import { toast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import MembersTable from "@/components/MembersTable";
import ShareModal from "@/components/ShareModal";

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
  const [shareOpen, setShareOpen] = useState(false);

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
        return {
          id: authorId,
          ...adminSnapshot.docs[0].data(),
        } as UserDB;
      })
    );
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
      title: `${
        members.find((member) => member.id === memberId)?.firstName
      } is now an admin`,
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
    <div className="px-4 py-8 bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 flex flex-col max-md:w-[calc(100vw-17px)] md:w-[calc(100vw-280px)] min-h-screen">
      
      
      <div className="mb-8 bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-2">
            {currentOrganization.name}
          </h1>
          <button onClick={() => setShareOpen(true)}>
            <Share2 className="w-6 h-6 mr-2 text-slate-400 hover:text-slate-300" />
          </button>
        </div>

        <p className="text-slate-400">Organization Management Dashboard</p>

        <ShareModal
          url={`/organisation?id=${currentOrganization.id}`}
          open={shareOpen}
          handleClose={() => setShareOpen(false)}
          title="Share link"  
          description="Share your organization link with your teammates"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-100 flex items-center">
                <Users className="mr-2" /> Members
              </h2>
              
            </div>
            <div className="w-full overflow-x-auto">
              <MembersTable
                members={members}
                currentOrganization={currentOrganization}
                isAdmin={isAdmin as boolean}
                handleMakeAdmin={handleMakeAdmin}
                handleRemoveMember={handleRemoveMember}
              />
            </div>
          </div>
        </div>

        <div className= "flex flex-col justify-between space-y-8">
          {isAdmin && (
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 border w-full border-slate-700 h-full">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-100 mb-4 flex items-center">
                <Settings className="mr-2" /> Admin Actions
              </h2>
              <div className="flex flex-wrap gap-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className=" bg-slate-700 text-slate-200 hover:bg-slate-600"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Organization
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-700 text-slate-200 border-slate-600">
                      <p>Edit organization details</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className=" bg-slate-700 text-slate-200 hover:bg-slate-600"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Manage Permissions
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-700 text-slate-200 border-slate-600">
                      <p>Manage member permissions</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={handleDelete}
                        className=" bg-red-900 text-red-100 hover:bg-red-800"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Organization
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-700 text-slate-200 border-slate-600">
                      <p>Permanently delete this organization</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            onClick={handleLeaveOrg}
            className="w-full h-fit  bg-slate-700 text-red-400 hover:bg-slate-600 hover:text-red-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Leave Organization
          </Button>
        </div>

        <div className="bg-slate-800 rounded-lg shadow-xl p-6 border border-slate-700 col-span-[3/2]">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-100 mb-4 flex items-center">
            <Info className="mr-2" /> Organization Details
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-slate-400">ID:</p>
              <p className="text-slate-200 font-mono bg-slate-700 p-2 rounded">
                {currentOrganization.id}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Admins:</p>
              <div className="bg-slate-700 p-2 rounded">
                {admins.map((admin) => (
                  <p key={admin.id} className="text-slate-200">
                    {admin.email}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
