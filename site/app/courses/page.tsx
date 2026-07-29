import { redirect } from "next/navigation";
import {
  StaticRedirect,
  staticRedirectMetadata,
} from "../components/StaticRedirect";
import { isCombinedSite, journalHref } from "../site-mode";

const destination = journalHref("/notes");

export const metadata = staticRedirectMetadata(
  destination,
  "Courses has moved to Notes",
);

export default function LegacyCoursesPage() {
  if (isCombinedSite) redirect(destination);
  return (
    <StaticRedirect
      destination={destination}
      title="Courses has moved to Notes."
      linkLabel="Browse Notes"
    />
  );
}
