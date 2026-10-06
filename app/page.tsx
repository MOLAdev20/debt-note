import { redirect } from "next/navigation";

// Root cuma gerbang: middleware yang nentuin user masuk dashboard atau login.
export default function Home() {
  redirect("/dashboard");
}
