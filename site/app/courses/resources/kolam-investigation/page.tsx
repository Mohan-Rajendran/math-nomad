import { redirect } from "next/navigation";
import {
  StaticRedirect,
  staticRedirectMetadata,
} from "../../../components/StaticRedirect";
import { isCombinedSite, journalHref } from "../../../site-mode";

const destination = journalHref(
  "/notes/combinatorics/sixteen-tiles-one-kolam-puzzle",
);

export const metadata = staticRedirectMetadata(
  destination,
  "The kolam investigation has moved",
);

export default function LegacyKolamInvestigationPage() {
  if (isCombinedSite) redirect(destination);
  return (
    <StaticRedirect
      destination={destination}
      title="This investigation has moved."
      description="The complete classroom investigation now lives in the Notes section."
      linkLabel="Open the kolam investigation"
    />
  );
}
