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
import { User } from "@clerk/clerk-sdk-node";
import { useRouter } from "next/navigation";
const Page = () => {
  const {
    currentOrganization,
    removeMemberFromOrganization,
    members,
    deleteOrganization
  } = useContext(OrganizationContext);
  const { user } = useUser();
  const [admin, setAdmin] = useState<User | null>(null);
  const router = useRouter();

  const isAdmin = user?.id === currentOrganization?.author;

  const getAdmin = async() => {
    try {
      const response = await fetch(`/api/getUserByid/${currentOrganization?.author}`);
      if (!response.ok) {
        throw new Error('Failed to fetch admin data');
      }
      const adminData = await response.json();
      setAdmin(adminData);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      // Optionally set an error state here
    }
  };

  const handleRemoveMember = (memberId: string) => {
    if (!currentOrganization) return;
    removeMemberFromOrganization(currentOrganization.id, memberId);
  };

  const handleDelete = async () => {
    if (!currentOrganization) return;
    await deleteOrganization(currentOrganization.id);
    router.push("/");
  };

  useEffect(() => { 
    if (currentOrganization?.author) {
      getAdmin();
    }
  }, [currentOrganization?.author]);


  if (!currentOrganization) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-slate-200">
        {currentOrganization.name}
      </h1>

      <section className="mb-12 bg-slate-800 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 text-slate-200">Members</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Username</TableHead>
                {isAdmin && <TableHead className="text-right">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={member.imageUrl} alt={member.firstName?.[0]} />
                      <AvatarFallback>{member.firstName?.[0]}{member.lastName?.[0]}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium text-slate-200">
                    {member.firstName} {member.lastName}
                  </TableCell>
                  <TableCell className="text-slate-300">{member.emailAddresses[0].emailAddress}</TableCell>
                  <TableCell className="text-slate-300">{member.username || 'N/A'}</TableCell>
                  {isAdmin && member.id !== currentOrganization.author && (
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {isAdmin && (
        <section className="mb-12 bg-slate-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 text-slate-200">
            Admin Actions
          </h2>
          <div className="space-x-4">
            <Button variant="outline">Edit Organization</Button>
            <Button variant="outline">Manage Permissions</Button>
            <Button variant="outline" onClick={handleDelete}>Delete Organization</Button>
          </div>
        </section>
      )}

      <section className="mb-12 bg-slate-800 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 text-slate-200">Organization Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400">ID:</p>
            <p className="text-slate-200">{currentOrganization.id}</p>
          </div>
          <div>
            <p className="text-slate-400">Created By:</p>
            <p className="text-slate-200">{admin?.firstName} {admin?.lastName}</p>
          </div>
          {/* Add more organization details here as needed */}
        </div>
      </section>
    </div>
  );
};

export default Page;