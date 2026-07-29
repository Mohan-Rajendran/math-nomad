import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MathArtwork } from "./components/ContentCards";

export default function NotFound() {
  return <main id="main-content" className="not-found page-shell"><div><p className="eyebrow">404 · An unmapped path</p><h1>This trail ends here.</h1><p>The page may have moved or its address may have changed.</p><Link className="button button-primary" href="/"><ArrowLeft size={16} /> Return home</Link></div><MathArtwork variant="modular" label="Broken mathematical path pattern" /></main>;
}
