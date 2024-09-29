import { signOut } from "next-auth/react";

export default function Home() {
  return (
    <div>
      HOME PAGE protected
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button type="submit">Sign Out</button>
      </form>
    </div>
  );
}
