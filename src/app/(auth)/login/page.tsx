"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginAction } from "@/lib/actions/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const res = await loginAction(formData);
      if (!res?.success) {
        setError(res?.error || "Invalid email or password.");
        setLoading(false);
      }
    } catch {
      // In Server Action, redirect throws a Next.js navigation error which is caught by Next.js
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-content">Sign In</h2>
        <p className="text-sm text-content-muted">
          Access your family&apos;s care workspace
        </p>
      </div>

      {error && (
        <Alert variant="danger">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-2"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>

      <div className="text-center text-sm text-content-muted pt-2 border-t border-border">
        Don&apos;t have an account yet?{" "}
        <Link
          href="/register"
          className="font-semibold text-brand hover:underline"
        >
          Create one
        </Link>
      </div>
    </form>
  );
}
