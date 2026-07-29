"use client";

import { useMemo, useState } from "react";
import { ArticleCard, ProjectCard } from "./ContentCards";
import type { Article, Project } from "../data";
import { labProjectHref } from "../site-mode";

export function ArticleIndex({ articles }: { articles: Article[] }) {
  const [view, setView] = useState<"recent" | "topic">("recent");
  const topics = useMemo(
    () => Array.from(new Set(articles.map((article) => article.tags[0]))).sort(),
    [articles],
  );

  return (
    <>
      <div className="view-switch" aria-label="Article arrangement">
        <button type="button" aria-pressed={view === "recent"} onClick={() => setView("recent")}>
          Recent first
        </button>
        <button type="button" aria-pressed={view === "topic"} onClick={() => setView("topic")}>
          By topic
        </button>
      </div>

      {view === "recent" ? (
        <div className="article-list">
          {articles.map((article) => (
            <ArticleCard article={article} key={article.id} />
          ))}
        </div>
      ) : (
        <div className="topic-groups">
          {topics.map((topic) => {
            const matches = articles.filter((article) => article.tags[0] === topic);
            return (
              <section className="topic-group" key={topic}>
                <div className="topic-heading">
                  <h2>{topic}</h2>
                  <span>{matches.length} {matches.length === 1 ? "article" : "articles"}</span>
                </div>
                <div className="article-list article-list-compact">
                  {matches.map((article) => <ArticleCard article={article} key={`${topic}-${article.id}`} />)}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

export function ProjectIndex({ projects, lab = false }: { projects: Project[]; lab?: boolean }) {
  const [stage, setStage] = useState("All maturities");
  const [technology, setTechnology] = useState("All tools");
  const technologies = useMemo(
    () => Array.from(new Set(projects.flatMap((project) => project.technologies))).sort(),
    [projects],
  );
  const maturities = useMemo(
    () => Array.from(new Set(projects.flatMap((project) => project.interactives.map((interactive) => interactive.maturity)))).sort(),
    [projects],
  );
  const matches = projects.filter((project) => {
    const stageMatch =
      stage === "All maturities" ||
      project.interactives.some((interactive) => interactive.maturity === stage);
    const technologyMatch = technology === "All tools" || project.technologies.includes(technology);
    return stageMatch && technologyMatch;
  });

  if (!lab) {
    return (
      <div className="project-grid">
        {projects.map((project, index) => <ProjectCard project={project} index={index} key={project.id} />)}
      </div>
    );
  }

  return (
    <>
      <div className="filter-bar" aria-label="Filter Lab projects">
        <label>
          <span>Technology</span>
          <select value={technology} onChange={(event) => setTechnology(event.target.value)}>
            <option>All tools</option>
            {technologies.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>Maturity</span>
          <select value={stage} onChange={(event) => setStage(event.target.value)}>
            <option>All maturities</option>
            {maturities.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <p aria-live="polite">Showing {matches.length} of {projects.length} project hubs</p>
      </div>
      <div className="project-grid lab-project-grid">
        {matches.map((project, index) => {
          const labProject = { ...project, slug: labProjectHref(project.key) };
          return <ProjectCard project={labProject} index={index} key={project.id} />;
        })}
      </div>
    </>
  );
}
