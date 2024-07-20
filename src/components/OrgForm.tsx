import { useForm, Controller } from "react-hook-form";
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
import OtherUsersBox from "@/components/OtherUsersBox";
import { useCallback, useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { User } from "@clerk/clerk-sdk-node";
import { OrganizationContext } from "@/context/OrganisationContext";
import { UserDB } from "@/types";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { FiTrash2 } from "react-icons/fi";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Organisation name must be at least 2 characters.",
  }),
  members: z.array(z.string()),
});

export function OrgForm() {
  const [members, setMembers] = useState<UserDB[]>([]);
  const { isSignedIn, user } = useUser();
  const [users, setUsers] = useState<UserDB[]>([]);
  const { addOrganization } = useContext(OrganizationContext);

  const fetchUsers = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const usersQuery = query(
        collection(db, "users"),
        where("userId", "!=", user.id)
      );
      const querySnapshot = await getDocs(usersQuery);
      const usersData = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as UserDB)
      );

      const filteredUsers = usersData.filter(
        (u: UserDB) => !members.find((m) => m.userId === u.userId)
      );
      setUsers(filteredUsers as UserDB[]);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [isSignedIn, user, members]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", members: [] },
  });

  const onSubmit = (data: any) => {
    console.log(data);
    addOrganization(data.name, members.map(member => member.userId));
    form.reset();
    setMembers([]);
  };

  const addMember = (newMember: UserDB) => {
    if (newMember && !members.find((m) => m.userId === newMember.userId)) {
      const updatedMembers = [...members, newMember];
      setMembers(updatedMembers);
      form.setValue("members", updatedMembers.map((member) => member.userId) as never[]);
    }
  };

  const removeMember = (userId: string) => {
    const updatedMembers = members.filter((m) => m.userId !== userId);
    setMembers(updatedMembers);
    form.setValue("members", updatedMembers.map((member) => member.userId) as never[]);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Create New Organization</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    className="bg-gray-700 text-white border-gray-600"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem className="flex flex-col gap-2">
            <FormLabel>Members</FormLabel>
            <FormControl>
              <OtherUsersBox
                placeholder="Choose members"
                setValue={addMember}
                users={users}
              />
            </FormControl>
            <div className="mt-2 flex flex-wrap gap-2">
              {members.map((member) => (
                <div
                  key={member.userId}
                  className="bg-gray-700 flex justify-between text-gray-200 rounded-md px-2 py-1 w-full"
                >
                  {member.email.slice(0, member.email.indexOf("@"))}
                  <button 
                    className="text-red-400 hover:text-red-300"
                    type="button"
                    onClick={() => removeMember(member.userId)}
                  >
                    <FiTrash2 className="ml-2 h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Create Organization</Button>
        </form>
      </Form>
    </div>
  );
}
