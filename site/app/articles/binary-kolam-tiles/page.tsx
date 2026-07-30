import {
  StaticRedirect,
  staticRedirectMetadata,
} from "../../components/StaticRedirect";
import { journalHref } from "../../site-mode";

const destination = journalHref("/articles/kolams-on-a-square");

export const metadata = staticRedirectMetadata(
  destination,
  "From Sixteen Tiles to Fifty-One Kolams has moved",
  "This article now has a new permanent address.",
);

export default function BinaryKolamTilesRedirectPage() {
  return (
    <StaticRedirect
      destination={destination}
      title="This article has moved."
      description="From Sixteen Tiles to Fifty-One Kolams now has a new permanent address."
      linkLabel="Continue to the article"
    />
  );
}
