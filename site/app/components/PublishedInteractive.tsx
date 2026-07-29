import {
  MoveKolamPreview,
  OctahedronKolamPreview,
  SlideKolamPreview,
  SquareKolamChallengePreview,
} from "./KolamLabPreviews";
import { LawOfCosinesPreview } from "./LawOfCosinesPreview";
import { PythagorasPreview } from "./PythagorasPreview";

export function PublishedInteractive({ slug }: { slug: string }) {
  switch (slug) {
    case "law-of-cosines":
      return <LawOfCosinesPreview />;
    case "pythagorean-tiling-proofs":
      return <PythagorasPreview />;
    case "square-kolam-tile-challenge":
      return <SquareKolamChallengePreview />;
    case "sandbox-2":
      return <SlideKolamPreview />;
    case "sandbox-3":
      return <MoveKolamPreview />;
    case "kolams-on-an-octahedron":
      return <OctahedronKolamPreview />;
    default:
      return null;
  }
}
