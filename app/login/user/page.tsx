import { redirect } from "next/navigation";

export default function UserLoginRedirect() {
  // Keep a route alias for staff cards. The default home page *is* the patient login.
  redirect("/");
}