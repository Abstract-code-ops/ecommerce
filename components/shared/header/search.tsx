'use client'
import { FormEventHandler } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { App_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const caegories = ["paper bags", "plastic bags", "gift boxes", "wrapping paper", "ribbons", "tape", "labels"];

type SearchProps = {
  className?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
};

export default function Search({ className, onSubmit }: SearchProps) {
  return (
    <form
      action="/search"
      method="GET"
      onSubmit={onSubmit}
      className={cn("flex items-stretch h-10", className)}
    >
      <Select name="category">
        <SelectTrigger className="w-auto h-full dark:border-gray-200 bg-gray-100 text-black border-r rounded-r-none rounded-l-md rtl:rounded-r-md rtl:rounded-l-none cursor-pointer">
          <SelectValue placeholder="All" className="p-0" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All" className="cursor-pointer">
            All categories
          </SelectItem>
          {caegories.map((category) => (
            <SelectItem key={category} value={category} className="cursor-pointer">
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        className="flex-1 rounded-none dark:border-gray-200 bg-gray-100 text-black text-base h-full"
        placeholder={`Search Site ${App_NAME}`}
        name="q"
        type="search"
      />
      <button
        type="submit"
        className="bg-secondary text-white rounded-se-none rounded-e-md h-full px-3 py-2 cursor-pointer"
      >
        <SearchIcon className="w-6 h-6" />
      </button>
    </form>
  );
}