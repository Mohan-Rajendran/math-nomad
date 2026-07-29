import { redirect } from "next/navigation";
import {
  StaticRedirect,
  staticRedirectMetadata,
} from "../components/StaticRedirect";
import { isCombinedSite, journalHref } from "../site-mode";

const destination = journalHref("/articles");

export const metadata = staticRedirectMetadata(
  destination,
  "Writing has moved to Articles",
);

export default function LegacyWritingPage() {
  if (isCombinedSite) redirect(destination);
  return (
    <StaticRedirect
      destination={destination}
      title="Writing has moved to Articles."
      linkLabel="Browse Articles"
    />
  );
}
