'use client';

import React, { useContext } from "react";
import { OrganizationContext } from "@/context/OrganisationContext";
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
import { Check, X } from "lucide-react";

const JoinRequests = () => {
  const { joinRequests, approveJoinRequest, rejectJoinRequest } = useContext(OrganizationContext);

  if (joinRequests.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Join Requests</h2>
        <p className="text-gray-400">There are no pending join requests at the moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Join Requests</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-300">Avatar</TableHead>
              <TableHead className="text-gray-300">Email</TableHead>
              <TableHead className="text-gray-300">Organization</TableHead>
              <TableHead className="text-gray-300">Status</TableHead>
              <TableHead className="text-gray-300">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {joinRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="py-4">
                  <Avatar>
                    <AvatarImage src={request.user.imageUrl} alt={request.user.id} />
                    <AvatarFallback>
                      {request.user.firstName?.length && request.user.lastName?.length
                        ? request.user.firstName[0] + request.user.lastName[0]
                        : request.user.username}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="text-gray-300">{request.user.emailAddresses[0].emailAddress}</TableCell>
                <TableCell className="text-gray-300">{request.orgId}</TableCell>
                <TableCell
                  className={cn("text-blue-400", {
                    "text-green-400": request.status === "approved",
                    "text-red-400": request.status === "rejected",
                  })}
                >
                  {request.status}
                </TableCell>
                <TableCell>
                  {request.status === "pending" ? (
                    <div className="flex gap-2">
                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => approveJoinRequest(request.id)}
                      >
                        <Check width={16} height={16} />
                      </Button>
                      <Button
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => rejectJoinRequest(request.id)}
                      >
                        <X width={16} height={16} />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default JoinRequests;