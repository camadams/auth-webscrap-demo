import { User } from "lucia";
import { logout } from "./actions";
import Link from "next/link";

export default function Navbar({ user }: { user: User }) {
  return (
    <nav className="p-8 flex justify-between">
      <Link className="underline" href="/">
        Home
      </Link>
      <form action={logout}>
        <button className="rounded-lg bg-red-400 px-4 py-2">Log out</button>
      </form>
    </nav>
  );
}
