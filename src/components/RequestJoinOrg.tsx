"use client";
import React, { useContext, useEffect } from "react";
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
import { useSearchParams } from "next/navigation";
import { OrganizationContext } from "@/context/OrganisationContext";
import { useUser } from "@clerk/nextjs";

// Define the schema for the form
const formSchema = z.object({
  orgId: z.string().min(1, {
    message: "Organization ID is required.",
  }),
});

const RequestJoinOrg = () => {
  const { user } = useUser();
  const { requestJoinOrganization } = useContext(OrganizationContext);
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const submit = searchParams.get("submit");

  // Initialize the form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { orgId: "" },
  });

  // Handle form submission
  const onSubmit = (data: { orgId: string }) => {
    console.log(data);
    requestJoinOrganization(data.orgId);
    form.reset();
  };


  useEffect(() => {
    if (submit === "true" && id && user) {
      form.setValue("orgId", id);
      form.handleSubmit(onSubmit)();
    }
  }, [user, id, submit]);

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg h-full">
      <h2 className="text-2xl font-semibold mb-4">
        Request to join an organization
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="orgId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization ID</FormLabel>
                <FormControl>
                  <Input
                    className="bg-gray-700 text-white border-gray-600"
                    placeholder="Enter the organization id"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Request to join
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RequestJoinOrg;
