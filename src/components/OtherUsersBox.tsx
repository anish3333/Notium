"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User } from "@clerk/clerk-sdk-node";
import { UserDB } from "@/types";

export default function OtherUsersBox({
  value,
  setValue,
  users,
  placeholder,
}: {
  value ?: UserDB | null;
  setValue: any;
  users: UserDB[] | any;
  placeholder: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger  asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-gray-950"
        >
          {value
            ? users.find((user : any) => user.email === value.email)?.email
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-full p-0 flex flex-grow flex-col">
        <Command>
          <CommandInput placeholder="Collaborate with others..." />
          <CommandList>
            {/* <CommandEmpty>No user found.</CommandEmpty> */}
            <CommandGroup>
              {users.length &&
                users?.map((user : any) => (
                  <CommandItem
                    key={user.id}
                    value={user.email || ""}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value?.email ? null : user);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value?.email === user.email
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {user.email}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
