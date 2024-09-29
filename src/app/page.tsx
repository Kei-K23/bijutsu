import { auth, signOut } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div>
      HOME PAGE protected
      <h1>{session?.user?.name}</h1>
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
