'use client';
import { OrganizationContext } from "@/context/OrganisationContext";
import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";

// Define the schema for the form
const formSchema = z.object({
  orgId: z.string().min(1, {
    message: "Organization ID is required.",
  }),
});

const RequestJoinOrg = () => {
  const { requestJoinOrganization } = useContext(OrganizationContext);
  const { id } : { id: string } = useParams();

  // Initialize the form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { orgId: id },
  });

  // Handle form submission
  const onSubmit = (data: { orgId: string }) => {
    console.log(data);  
    requestJoinOrganization(data.orgId);
  };

  return (
    <div className="flex flex-col gap-4 max-w-md  border text-stone-300 border-stone-300 rounded-md p-4">
      <h1 className="text-2xl font-bold ">Request to join an organization</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="orgId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization ID</FormLabel>
                <FormControl>
                  <Input
                    className="text-slate-950"
                    placeholder="Enter the organization id"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Request to join</Button>
        </form>
      </Form>
    </div>
  );
};

export default RequestJoinOrg;