import { redirect } from "next/navigation";
import {
  StaticRedirect,
  staticRedirectMetadata,
} from "../../../components/StaticRedirect";
import { isCombinedSite, journalHref } from "../../../site-mode";

const destination = journalHref("/articles");

export const metadata = staticRedirectMetadata(
  destination,
  "The Burnside’s lemma topic page has moved",
);

export default function LegacyBurnsideTopicPage() {
  if (isCombinedSite) redirect(destination);
  return (
    <StaticRedirect
      destination={destination}
      title="This topic page has moved."
      description="Browse the Articles section for writing about symmetry, group actions and Burnside’s lemma."
      linkLabel="Browse Articles"
    />
  );
}
