import { Button } from "@/components/ui/button";
import React from "react";
import { signIn } from "@/auth";

export default function GithubSignIn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("github");
      }}
    >
      <Button type="submit">Signin with GitHub</Button>
    </form>
  );
}
