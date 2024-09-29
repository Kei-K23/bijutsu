import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import React from "react";

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
