import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import OtherUsersBox from "@/components/OtherUsersBox";
import { useCallback, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { User } from "@clerk/clerk-sdk-node";
import { OrganizationContext } from "@/context/OrganisationContext";

// Define the schema for the form
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Organisation name must be at least 2 characters.",
  }),
  members: z.array(z.string()),
});

export function OrgForm() {
  // State to hold members
  const [members, setMembers] = useState<string[]>([]);
  const { isSignedIn, user } = useUser(); // Use this to get the current user info from Clerk
  const [users, setUsers] = useState<User[]>([]);
  const { addOrganization } = useContext(OrganizationContext);

  const fetchUsers = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      const filteredUsers = data.data.filter((u: User) => u.id !== user.id);
      console.log(filteredUsers);
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  // Initialize the form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", members: [] },
  });

  // Function to add a member
  const addMember = (newMember: User) => {
    if (
      newMember &&  
      newMember.username &&
      !members.includes(newMember.username)
    ) {
      const updatedMembers = [...members, newMember.username];
      setMembers(updatedMembers);
      form.setValue("members", updatedMembers as never[]);
    }
  };

  // Handle form submission
  const onSubmit = (data: any) => {
    addOrganization(data.name, data.members);  
  };

  return (
    <div className="flex flex-col gap-4 max-w-md text-stone-300 border border-stone-300 rounded-md p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organisation Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your Organisation name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem className="flex flex-col gap-2">
            <FormLabel>Members</FormLabel>
            <FormControl >
              <OtherUsersBox
                placeholder="Choose members"
                setValue={(val: User) => {
                  addMember(val);
                }}
                users={users}
              />
            </FormControl>
            <div className="mt-2">
              {members.map((member, index) => (
                <div
                key={index}
                className="bg-gray-200 text-gray-900 rounded-md px-2 py-1 mb-1"
                >
                  {member}
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}
