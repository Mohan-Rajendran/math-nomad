"use client";

import { useEffect, useRef } from "react";
import { initializeSlidingKolams } from "./interactive";

export function SlidingKolamBody({ html }: { html: string }) {
  const body = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (body.current) return initializeSlidingKolams(body.current);
  }, []);

  return (
    <div
      ref={body}
      className="sliding-kolam-article"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
