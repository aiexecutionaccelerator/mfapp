import { redirect } from "next/navigation";

/** The Course became Your 30-Day Mission. Old links land on the new list. */
export default function CourseRedirect() {
  redirect("/missions");
}
