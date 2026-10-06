import {
  StaticRedirect,
  staticRedirectMetadata,
} from "../../components/StaticRedirect";
import { journalHref } from "../../site-mode";

const destination = journalHref("/articles/kolams-on-a-square");

export const metadata = staticRedirectMetadata(
  destination,
  "From 16! possibilities to 51 kolams has moved",
  "This article now has a new permanent address.",
);

export default function BinaryKolamTilesRedirectPage() {
  return (
    <StaticRedirect
      destination={destination}
      title="This article has moved."
      description="From 16! possibilities to 51 kolams now has a new permanent address."
      linkLabel="Continue to the article"
    />
  );
}
