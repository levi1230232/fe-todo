"use client";

import { useState } from "react";
import { Search, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { SearchedUser, TeamMember } from "./TeamMemberManager";
import { toast } from "sonner";

interface AddMemberFormProps {
  members: TeamMember[];
  onSearchUserByEmail: (email: string) => Promise<SearchedUser | null>;
  onAddMember: (user: SearchedUser) => Promise<void> | void;
  onCancel: () => void;
}

export function AddMemberForm({
  members,
  onSearchUserByEmail,
  onAddMember,
  onCancel,
}: AddMemberFormProps) {
  const [email, setEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [foundUser, setFoundUser] = useState<SearchedUser | null>(null);
  const [searchError, setSearchError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setSearchError("Please enter a valid email address.");
      setFoundUser(null);
      return;
    }

    try {
      setIsSearching(true);
      setSearchError("");
      setFoundUser(null);

      const user = await onSearchUserByEmail(cleanEmail);

      if (!user) {
        setSearchError("No account found with this email.");
      } else {
        const isAlreadyMember = members.some(
          (m) =>
            String(m.user?.id) === String(user.id) ||
            m.user?.email?.toLowerCase() === user.email?.toLowerCase(),
        );

        if (isAlreadyMember) {
          setSearchError("This user is already a member of this project.");
        } else {
          setFoundUser(user);
        }
      }
    } catch (error: any) {
      setSearchError(
        "An error occurred while searching. Please try again later.",
      );
      toast.error(searchError);
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmAdd = async () => {
    if (!foundUser) return;

    try {
      setIsSubmitting(true);
      await onAddMember(foundUser);
      onCancel();
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (foundUser) setFoundUser(null);
              if (searchError) setSearchError("");
            }}
            placeholder="Enter exact email address..."
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white pr-7"
            required
            disabled={isSearching || isSubmitting}
            autoFocus
          />
          {email && !isSearching && (
            <button
              type="button"
              onClick={() => {
                setEmail("");
                setSearchError("");
                setFoundUser(null);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isSearching || isSubmitting || !email.trim()}
          className="px-3 py-1.5 text-xs bg-slate-800 text-white rounded hover:bg-slate-700 disabled:opacity-50 flex items-center gap-1 shrink-0 font-medium"
        >
          {isSearching ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Search size={12} />
          )}
          Search
        </button>
      </form>

      {searchError && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 animate-in fade-in duration-150">
          <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 text-[11px] text-red-600 font-medium leading-tight">
            {searchError}
          </div>
        </div>
      )}

      {foundUser && (
        <div className="p-2.5 bg-white rounded-md border border-blue-200 flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 size={16} className="text-green-500 shrink-0" />
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {foundUser.name || "User"}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {foundUser.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirmAdd}
            disabled={isSubmitting}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1 shrink-0 font-medium"
          >
            {isSubmitting && <Loader2 size={12} className="animate-spin" />}
            Add
          </button>
        </div>
      )}

      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 rounded transition"
          disabled={isSubmitting || isSearching}
        >
          Close
        </button>
      </div>
    </div>
  );
}
