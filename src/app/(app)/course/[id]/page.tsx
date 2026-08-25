import { redirect } from "next/navigation";

/** Old lesson deep links land on the Mission list. */
export default function LessonRedirect() {
  redirect("/missions");
}
