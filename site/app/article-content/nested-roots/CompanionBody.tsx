"use client";

import { useEffect, useRef } from "react";
import { initializeNestedRoots } from "./interactive";

export function CompanionBody({ html }: { html: string }) {
  const article = useRef<HTMLElement>(null);
  useEffect(() => {
    if (article.current) return initializeNestedRoots(article.current);
  }, []);
  return (
    <article
      ref={article}
      className="prose article-prose is-complete-article nested-roots-article"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
