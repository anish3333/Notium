"use client";

import { OrganizationContext } from "@/context/OrganisationContext";
import React, { useContext } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Page = () => {
  const { organizations, joinRequests, approveJoinRequest } = useContext(OrganizationContext);
  console.log(organizations);

  return (
    <div className="flex w-full min-h-screen justify-center p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl font-bold mb-6 text-slate-200">Join Requests</h1>
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Avatar</TableHead>
                <TableHead className="w-1/3">Email</TableHead>
                <TableHead className="w-1/4">Status</TableHead>
                <TableHead className="w-1/4">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {joinRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="py-4">
                    <Avatar>
                      <AvatarImage
                        src={request.user.imageUrl}
                        alt={request.user.id}
                      />
                      <AvatarFallback>
                        {request.user.firstName?.length &&
                        request.user.lastName?.length
                          ? request.user.firstName[0] + request.user.lastName[0]
                          : request.user.username}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="text-stone-300">
                    {request.user.emailAddresses[0].emailAddress}
                  </TableCell>
                  <TableCell
                    className={cn("text-red-600", {
                      "text-green-500": request.status === "approved",
                    })}
                  >
                    {request.status}
                  </TableCell>
                  <TableCell>
                    {request.status === "pending" && (
                      <Button onClick={() => approveJoinRequest(request.id)}>
                        Approve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Page;