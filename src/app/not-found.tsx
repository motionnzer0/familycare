import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="space-y-2 max-w-md">
        <h1 className="text-3xl font-bold text-content">Page not found</h1>
        <p className="text-base text-content-muted">
          The page or record you are looking for does not exist or you do not have permission to view it.
        </p>
      </div>
      <Link href="/today">
        <Button variant="primary">Return to Today</Button>
      </Link>
    </div>
  );
}
