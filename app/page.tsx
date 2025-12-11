import { redirect } from "next/navigation";

export default function Page() {
	// Server-side redirect to the shop route
	redirect("/shop");
	// unreachable, but required to satisfy TS/JSX return signature for some linters
	return null;
}