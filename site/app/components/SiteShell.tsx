"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Moon, Search, Settings2, Sun, Type, X } from "lucide-react";
import { FaGithub, FaYoutube } from "react-icons/fa";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import * as content from "../data";
import {
  isLabSite,
  journalHref,
  labInteractiveHref,
} from "../site-mode";

type LooseRecord = Record<string, unknown>;

type SearchEntry = {
  title: string;
  href: string;
  type: string;
  description: string;
  searchText: string;
};

type MathQuote = {
  text: string;
  author: string;
  source: string;
  sourceUrl?: string;
};

type FontSizePreference = "small" | "medium" | "large";
type ThemePreference = "light" | "dark";

const MAIN_GITHUB_URL = "https://github.com/Mohan-Rajendran/math-nomad";
const LAB_GITHUB_URL = "https://github.com/Mohan-Rajendran/math-nomad-lab";
const YOUTUBE_URL = "https://www.youtube.com/@mathnomad3722";
const ANALYTICS_STORAGE_KEY = "mathnomad-cookie-preferences";
const DISPLAY_STORAGE_KEY = "mathnomad-display-preferences";
const DISPLAY_CHANGE_EVENT = "mathnomad-display-preferences-change";
const DEFAULT_DISPLAY_TOKEN = "medium|light";

const navigation = [
  { href: journalHref("/articles"), label: "Articles" },
  { href: journalHref("/notes"), label: "Notes" },
  { href: journalHref("/projects"), label: "Projects" },
  { href: journalHref("/about"), label: "About" },
];

function asRecords(value: unknown): LooseRecord[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is LooseRecord =>
          typeof item === "object" && item !== null,
      )
    : [];
}

function asText(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

function asTextList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => asTextList(item));
  }
  const text = asText(value).trim();
  return text ? [text] : [];
}

function recordHref(item: LooseRecord, base: string): string {
  const direct = asText(item.href || item.url || item.path || item.slug);
  if (!direct) return base;
  if (direct.startsWith("/") || direct.startsWith("http")) return direct;
  return `${base}/${direct}`.replaceAll("//", "/");
}

function normaliseEntry(
  item: LooseRecord,
  type: string,
  base: string,
): SearchEntry | null {
  const title = asText(item.title || item.name);
  if (!title) return null;

  const description = asText(
    item.glimpse || item.description || item.summary || item.question,
  );
  const keywords = [
    title,
    description,
    ...asTextList(item.tags),
    ...asTextList(item.keywords),
    ...asTextList(item.topics),
    ...asTextList(item.technologies),
    ...asTextList(item.audience),
    ...asTextList(item.level),
    asText(item.field),
    asText(item.kind),
    asText(item.articleType),
    asText(item.status),
    type,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();

  return {
    title,
    href: recordHref(item, base),
    type,
    description,
    searchText: keywords,
  };
}

function makeSearchEntries(): SearchEntry[] {
  const data = content as unknown as LooseRecord;
  const explicitItems = asRecords(data.searchItems);
  if (explicitItems.length) {
    return explicitItems
      .map((item) =>
        normaliseEntry(
          item,
          asText(item.type || item.category) || "Entry",
          "/",
        ),
      )
      .filter((item): item is SearchEntry => item !== null);
  }

  const groups: Array<{
    key: string;
    type: string;
    base: string;
    journal: boolean;
  }> = [
    { key: "articles", type: "Article", base: "/articles", journal: true },
    { key: "notes", type: "Note", base: "/notes", journal: true },
    { key: "projects", type: "Project", base: "/projects", journal: true },
    { key: "labProjects", type: "Lab project", base: "/lab", journal: false },
  ];

  const entries = groups.flatMap(({ key, type, base, journal }) =>
    asRecords(data[key])
      .map((item) => {
        const entry = normaliseEntry(item, type, base);
        return entry && journal && isLabSite
          ? { ...entry, href: journalHref(entry.href) }
          : entry;
      })
      .filter((item): item is SearchEntry => item !== null),
  );

  const projectInteractives = [
    ...asRecords(data.projects),
    ...asRecords(data.labProjects),
  ].flatMap((project) => {
    const projectKey = asText(project.key || project.id || project.slug)
      .split("/")
      .filter(Boolean)
      .at(-1);
    return asRecords(project.interactives)
      .map((interactive) => {
        const item = {
          ...interactive,
          href:
            asText(interactive.href) ||
            labInteractiveHref(
              projectKey || "project",
              asText(interactive.slug),
            ),
        };
        return normaliseEntry(item, "Interactive", "/lab");
      })
      .filter((item): item is SearchEntry => item !== null);
  });

  const unique = new Map<string, SearchEntry>();
  [...entries, ...projectInteractives].forEach((entry) => {
    unique.set(`${entry.type}:${entry.href}`, entry);
  });
  return Array.from(unique.values());
}

function makeQuotes(): MathQuote[] {
  const data = content as unknown as LooseRecord;
  const source = asRecords(data.quotes).length
    ? asRecords(data.quotes)
    : asRecords(data.mathQuotes);

  const quotes = source
    .map((item) => ({
      text: asText(item.text || item.quote),
      author: asText(item.author),
      source: asText(item.source || item.work),
      sourceUrl: asText(item.sourceUrl || item.url) || undefined,
    }))
    .filter((quote) => quote.text && quote.author);

  return quotes.length
    ? quotes
    : [
        {
          text: "Mathematics, you see, is not a spectator sport. To understand mathematics means to be able to do mathematics.",
          author: "George Pólya",
          source: "Lecture on teaching mathematics",
          sourceUrl:
            "https://mathshistory.st-andrews.ac.uk/Biographies/Polya/",
        },
      ];
}

const searchEntries = makeSearchEntries();
const quoteRegistry = makeQuotes();

function pathHash(pathname: string): number {
  return Array.from(pathname).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );
}

function quoteIndexForPath(pathname: string, quoteCount: number): number {
  if (quoteCount <= 1) return 0;
  return pathHash(pathname) % quoteCount;
}

function isFontSizePreference(value: unknown): value is FontSizePreference {
  return value === "small" || value === "medium" || value === "large";
}

function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark";
}

function readDisplayToken(): string {
  if (typeof window === "undefined") return DEFAULT_DISPLAY_TOKEN;
  try {
    const stored = window.localStorage.getItem(DISPLAY_STORAGE_KEY);
    if (!stored) return DEFAULT_DISPLAY_TOKEN;
    const parsed = JSON.parse(stored) as LooseRecord;
    const fontSize = isFontSizePreference(parsed.fontSize)
      ? parsed.fontSize
      : "medium";
    const theme = isThemePreference(parsed.theme) ? parsed.theme : "light";
    return `${fontSize}|${theme}`;
  } catch {
    return DEFAULT_DISPLAY_TOKEN;
  }
}

function subscribeToDisplayPreferences(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (event.key === DISPLAY_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener(DISPLAY_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(DISPLAY_CHANGE_EVENT, onStoreChange);
  };
}

function parseDisplayToken(token: string): {
  fontSize: FontSizePreference;
  theme: ThemePreference;
} {
  const [storedFontSize, storedTheme] = token.split("|");
  return {
    fontSize: isFontSizePreference(storedFontSize)
      ? storedFontSize
      : "medium",
    theme: isThemePreference(storedTheme) ? storedTheme : "light",
  };
}

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const searchDialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const cookieDialog = useRef<HTMLDialogElement>(null);
  const displayDialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [quoteOffset, setQuoteOffset] = useState(0);
  const displayToken = useSyncExternalStore(
    subscribeToDisplayPreferences,
    readDisplayToken,
    () => DEFAULT_DISPLAY_TOKEN,
  );
  const { fontSize, theme } = parseDisplayToken(displayToken);
  const repositoryUrl =
    isLabSite || pathname.startsWith("/lab") || pathname.startsWith("/embed")
      ? LAB_GITHUB_URL
      : MAIN_GITHUB_URL;
  const isEmbed = pathname.startsWith("/embed/");

  const results = useMemo(() => {
    const terms = query
      .trim()
      .toLocaleLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    if (!terms.length) return searchEntries.slice(0, 7);
    return searchEntries
      .filter((entry) =>
        terms.every((term) => entry.searchText.includes(term)),
      )
      .slice(0, 12);
  }, [query]);

  const currentQuote = useMemo(
    () =>
      quoteRegistry[
        (quoteIndexForPath(pathname, quoteRegistry.length) + quoteOffset) %
          quoteRegistry.length
      ] || quoteRegistry[0],
    [pathname, quoteOffset],
  );

  useEffect(() => {
    document.documentElement.dataset.fontSize = fontSize;
    document.documentElement.dataset.theme = theme;
  }, [fontSize, theme]);

  useEffect(() => {
    if (quoteRegistry.length <= 1) return;
    const timer = window.setInterval(
      () => setQuoteOffset((offset) => (offset + 1) % quoteRegistry.length),
      30000,
    );
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    function openFromKeyboard(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (cookieDialog.current?.open) cookieDialog.current.close();
        if (displayDialog.current?.open) displayDialog.current.close();
        if (searchDialog.current && !searchDialog.current.open) {
          searchDialog.current.showModal();
        }
        requestAnimationFrame(() => searchInput.current?.focus());
      }
    }
    document.addEventListener("keydown", openFromKeyboard);
    return () => document.removeEventListener("keydown", openFromKeyboard);
  }, []);

  function openSearch() {
    if (cookieDialog.current?.open) cookieDialog.current.close();
    if (displayDialog.current?.open) displayDialog.current.close();
    if (searchDialog.current && !searchDialog.current.open) {
      searchDialog.current.showModal();
    }
    requestAnimationFrame(() => searchInput.current?.focus());
  }

  function closeSearch() {
    searchDialog.current?.close();
    setQuery("");
  }

  function readStoredAnalyticsPreference(): boolean {
    try {
      const stored = window.localStorage.getItem(ANALYTICS_STORAGE_KEY);
      return stored ? JSON.parse(stored).analytics === true : false;
    } catch {
      return false;
    }
  }

  function openCookiePreferences() {
    setAnalyticsEnabled(readStoredAnalyticsPreference());
    if (searchDialog.current?.open) searchDialog.current.close();
    if (displayDialog.current?.open) displayDialog.current.close();
    if (cookieDialog.current && !cookieDialog.current.open) {
      cookieDialog.current.showModal();
    }
  }

  function storeCookiePreferences(enabled: boolean) {
    setAnalyticsEnabled(enabled);
    try {
      window.localStorage.setItem(
        ANALYTICS_STORAGE_KEY,
        JSON.stringify({
          essential: true,
          analytics: enabled,
          savedAt: new Date().toISOString(),
        }),
      );
    } catch {
      // The preference remains effective for this preview session.
    }
    cookieDialog.current?.close();
  }

  function saveCookiePreferences(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    storeCookiePreferences(analyticsEnabled);
  }

  function openDisplaySettings() {
    if (searchDialog.current?.open) searchDialog.current.close();
    if (cookieDialog.current?.open) cookieDialog.current.close();
    if (displayDialog.current && !displayDialog.current.open) {
      displayDialog.current.showModal();
    }
  }

  function storeDisplayPreferences(
    nextFontSize: FontSizePreference,
    nextTheme: ThemePreference,
  ) {
    try {
      window.localStorage.setItem(
        DISPLAY_STORAGE_KEY,
        JSON.stringify({
          fontSize: nextFontSize,
          theme: nextTheme,
          savedAt: new Date().toISOString(),
        }),
      );
      window.dispatchEvent(new Event(DISPLAY_CHANGE_EVENT));
    } catch {
      // The SSR-safe defaults remain available when device storage is blocked.
    }
  }

  function isCurrentPage(href: string): boolean {
    if (href === "/projects" && pathname.startsWith("/lab")) return true;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div
      className="site-shell"
      data-font-size={fontSize}
      data-theme={theme}
      data-embed={isEmbed ? "true" : undefined}
    >
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="site-header">
        <div className="page-shell site-header-inner">
          <Link className="site-brand" href="/" aria-label="Math Nomad home">
            <Image
              src="/mathnomad-logo.png"
              alt=""
              aria-hidden="true"
              width={36}
              height={36}
              priority
            />
            <span>Math Nomad</span>
          </Link>

          <nav
            className={`site-navigation ${menuOpen ? "site-navigation-open" : ""}`}
            id="site-navigation"
            aria-label="Primary navigation"
          >
            {navigation.map((item) => (
              <Link
                className="site-navigation-link"
                href={item.href}
                aria-current={isCurrentPage(item.href) ? "page" : undefined}
                key={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <a
              className="site-navigation-link mobile-navigation-external"
              href={repositoryUrl}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a
              className="site-navigation-link mobile-navigation-external"
              href={YOUTUBE_URL}
              target="_blank"
              rel="noreferrer"
            >
              YouTube
            </a>
          </nav>

          <div
            className="site-utilities"
            role="group"
            aria-label="Website links, search and display settings"
          >
            <a
              className="site-icon-link site-social-link"
              href={repositoryUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Math Nomad website repository on GitHub (opens in a new tab)"
              title="GitHub repository"
            >
              <FaGithub aria-hidden="true" size={19} />
            </a>
            <a
              className="site-icon-link site-social-link"
              href={YOUTUBE_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Math Nomad on YouTube (opens in a new tab)"
              title="YouTube channel"
            >
              <FaYoutube aria-hidden="true" size={20} />
            </a>
            <button
              className="site-search-trigger"
              type="button"
              onClick={openSearch}
              aria-haspopup="dialog"
              aria-controls="site-search-dialog"
              title="Search Math Nomad"
            >
              <Search aria-hidden="true" size={19} strokeWidth={1.8} />
              <span className="sr-only">Search Math Nomad</span>
            </button>
            <button
              className="site-icon-link site-display-trigger"
              type="button"
              onClick={openDisplaySettings}
              aria-haspopup="dialog"
              aria-controls="display-settings-dialog"
              aria-label="Display settings"
              title="Display settings"
            >
              <Settings2 aria-hidden="true" size={19} strokeWidth={1.8} />
            </button>
            <button
              className="site-icon-link site-menu-trigger"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="site-navigation"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              title={menuOpen ? "Close menu" : "Menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
            </button>
          </div>
        </div>
      </header>

      {children}

      <footer className="site-footer">
        <div className="page-shell site-footer-inner">
          <div className="site-footer-identity">
            <Link className="footer-brand" href="/">
              Math Nomad
            </Link>
            <p>Mathematics worth returning to.</p>
          </div>

          <div className="site-footer-meta">
            <span>© {new Date().getFullYear()} Math Nomad</span>
            <button type="button" onClick={openCookiePreferences}>
              Cookie preferences
            </button>
            <Link href={journalHref("/feed.xml")}>RSS</Link>
          </div>

          <figure className="site-quote">
            <blockquote>“{currentQuote.text}”</blockquote>
            <figcaption>
              <span>{currentQuote.author}</span>
              <span aria-hidden="true"> · </span>
              {currentQuote.sourceUrl ? (
                <a
                  href={currentQuote.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {currentQuote.source}
                </a>
              ) : (
                <cite>{currentQuote.source}</cite>
              )}
            </figcaption>
          </figure>
        </div>
      </footer>

      <dialog
        className="site-dialog search-dialog"
        id="site-search-dialog"
        ref={searchDialog}
        aria-labelledby="search-dialog-title"
        aria-describedby="search-dialog-description"
        onClose={() => setQuery("")}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeSearch();
        }}
      >
        <div className="dialog-panel">
          <div className="dialog-heading">
            <div>
              <p className="eyebrow">Across Math Nomad</p>
              <h2 id="search-dialog-title">Search</h2>
            </div>
            <button
              className="dialog-close"
              type="button"
              onClick={closeSearch}
              aria-label="Close search"
            >
              <X aria-hidden="true" size={20} />
            </button>
          </div>
          <p className="sr-only" id="search-dialog-description">
            Search articles, notes, projects and Lab interactives.
          </p>
          <form
            className="site-search-form"
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <Search aria-hidden="true" size={20} />
            <label className="sr-only" htmlFor="site-search-input">
              Search Math Nomad
            </label>
            <input
              id="site-search-input"
              ref={searchInput}
              type="search"
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try ‘symmetry’, ‘group actions’ or ‘kolam’"
            />
            <kbd aria-hidden="true">Esc</kbd>
          </form>

          <div className="search-result-heading" aria-live="polite">
            <span>{query ? "Results" : "Suggested entries"}</span>
            <span>
              {results.length} {results.length === 1 ? "entry" : "entries"}
            </span>
          </div>
          {results.length ? (
            <ul className="search-results">
              {results.map((entry) => (
                <li key={`${entry.type}-${entry.href}`}>
                  <Link href={entry.href} onClick={closeSearch}>
                    <span className="search-result-type">{entry.type}</span>
                    <strong>{entry.title}</strong>
                    {entry.description ? <small>{entry.description}</small> : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="search-empty">
              No matches yet. Try a mathematical field, format or technology.
            </p>
          )}
        </div>
      </dialog>

      <dialog
        className="site-dialog display-dialog"
        id="display-settings-dialog"
        ref={displayDialog}
        aria-labelledby="display-dialog-title"
        aria-describedby="display-dialog-description"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            displayDialog.current?.close();
          }
        }}
      >
        <div className="dialog-panel">
          <div className="dialog-heading">
            <div>
              <p className="eyebrow">Reading preferences</p>
              <h2 id="display-dialog-title">Display settings</h2>
            </div>
            <button
              className="dialog-close"
              type="button"
              onClick={() => displayDialog.current?.close()}
              aria-label="Close display settings"
            >
              <X aria-hidden="true" size={20} />
            </button>
          </div>

          <p id="display-dialog-description">
            Choose a comfortable text size and page theme. Preferences are
            stored only on this device.
          </p>

          <fieldset className="display-setting-group">
            <legend>Text size</legend>
            <div className="display-choice-row">
              <button
                type="button"
                aria-pressed={fontSize === "small"}
                onClick={() => storeDisplayPreferences("small", theme)}
              >
                <Type aria-hidden="true" size={15} />
                <span>Small</span>
              </button>
              <button
                type="button"
                aria-pressed={fontSize === "medium"}
                onClick={() => storeDisplayPreferences("medium", theme)}
              >
                <Type aria-hidden="true" size={18} />
                <span>Medium</span>
                <small>Default</small>
              </button>
              <button
                type="button"
                aria-pressed={fontSize === "large"}
                onClick={() => storeDisplayPreferences("large", theme)}
              >
                <Type aria-hidden="true" size={21} />
                <span>Large</span>
              </button>
            </div>
          </fieldset>

          <fieldset className="display-setting-group">
            <legend>Theme</legend>
            <div className="display-choice-row">
              <button
                type="button"
                aria-pressed={theme === "light"}
                onClick={() => storeDisplayPreferences(fontSize, "light")}
              >
                <Sun aria-hidden="true" size={18} />
                <span>Light</span>
              </button>
              <button
                type="button"
                aria-pressed={theme === "dark"}
                onClick={() => storeDisplayPreferences(fontSize, "dark")}
              >
                <Moon aria-hidden="true" size={18} />
                <span>Dark</span>
              </button>
            </div>
          </fieldset>

          <p className="display-setting-status" aria-live="polite">
            {fontSize.charAt(0).toUpperCase() + fontSize.slice(1)} text ·{" "}
            {theme.charAt(0).toUpperCase() + theme.slice(1)} theme
          </p>

          <div className="dialog-actions">
            <button
              className="button button-primary"
              type="button"
              onClick={() => displayDialog.current?.close()}
            >
              Done
            </button>
          </div>
        </div>
      </dialog>

      <dialog
        className="site-dialog cookie-dialog"
        ref={cookieDialog}
        aria-labelledby="cookie-dialog-title"
        aria-describedby="cookie-dialog-description"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            cookieDialog.current?.close();
          }
        }}
      >
        <form className="dialog-panel" onSubmit={saveCookiePreferences}>
          <div className="dialog-heading">
            <div>
              <p className="eyebrow">On this device</p>
              <h2 id="cookie-dialog-title">Cookie preferences</h2>
            </div>
            <button
              className="dialog-close"
              type="button"
              onClick={() => cookieDialog.current?.close()}
              aria-label="Close cookie preferences"
            >
              <X aria-hidden="true" size={20} />
            </button>
          </div>
          <p id="cookie-dialog-description">
            Essential settings keep your reading preferences on this device.
            Optional analytics remain off unless you enable them.
          </p>

          <label className="cookie-option cookie-option-locked">
            <input type="checkbox" checked disabled readOnly />
            <span>
              <strong>Essential</strong>
              <small>Required for basic preferences and accessibility.</small>
            </span>
            <em>Always active</em>
          </label>

          <label className="cookie-option">
            <input
              type="checkbox"
              checked={analyticsEnabled}
              onChange={(event) => setAnalyticsEnabled(event.target.checked)}
            />
            <span>
              <strong>Optional analytics</strong>
              <small>
                Remember whether anonymous usage measurement may be enabled.
              </small>
            </span>
          </label>

          <div className="dialog-actions">
            <button
              className="button button-secondary"
              type="button"
              onClick={() => storeCookiePreferences(false)}
            >
              Use essential only
            </button>
            <button className="button button-primary" type="submit">
              Save preferences
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

export default SiteShell;
