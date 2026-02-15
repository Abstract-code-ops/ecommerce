"use client";

import Link from "next/link";
import { Mail, User } from "lucide-react";

interface GuestInfoFormProps {
  email: string;
  name: string;
  onEmailChange: (email: string) => void;
  onNameChange: (name: string) => void;
}

export default function GuestInfoForm({
  email,
  name,
  onEmailChange,
  onNameChange,
}: GuestInfoFormProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 mb-6 space-y-4">
      {/* Name Input */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          <User className="w-4 h-4 inline mr-2" />
          Full Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter your full name"
          className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Email Input */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          <Mail className="w-4 h-4 inline mr-2" />
          Email for Order Updates
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="your@email.com"
          className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>
      
      {/* Sign in suggestion */}
      <div className="pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground mb-3">
          Have an account? Sign in to save addresses & track orders easily.
        </p>
        <div className="flex gap-3">
          <Link 
            href="/sign-in?redirect=/cart"
            className="flex-1 py-2 px-4 border border-border rounded-lg font-medium text-xs text-center hover:bg-muted transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/sign-up"
            className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg font-medium text-xs text-center hover:bg-primary/90 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
