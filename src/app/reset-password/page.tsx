"use client"

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
 const [password, setPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");


  async function handleUpdatePassword() {

    if (!password) {
      alert("Enter a new password.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Password updated!");
  }
   return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#fed7aa,transparent_35%),linear-gradient(to_bottom,#fff7ed,#ffffff)] px-6 py-10">
      <Card className="w-full max-w-md border-orange-100 shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-xl">
            🔐
          </div>

          <CardTitle className="text-3xl">Reset your password</CardTitle>

          <CardDescription>
            Choose a new password for your Cheap Meal Finder account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>

            <Input
              id="password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>

            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          <Button
            type="button"
            className="w-full bg-orange-500 text-white hover:bg-orange-600"
            onClick={handleUpdatePassword}
          >
            Update password
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            After updating your password, you can log in with your new password.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}