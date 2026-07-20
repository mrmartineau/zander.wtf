import {
  Action,
  ActionPanel,
  Icon,
  List,
  getPreferenceValues,
} from "@raycast/api";
import { useFetch } from "@raycast/utils";
import { useState } from "react";

const TYPES = [
  { id: "", title: "All Types", icon: Icon.MagnifyingGlass },
  { id: "blog", title: "Blog", icon: Icon.Pencil },
  { id: "note", title: "Code Note", icon: Icon.CodeBlock },
  { id: "project", title: "Project", icon: Icon.Hammer },
  { id: "worklog", title: "Worklog", icon: Icon.Calendar },
  { id: "page", title: "Page", icon: Icon.Document },
] as const;

type ResultType = (typeof TYPES)[number]["id"];

interface SearchResult {
  title: string;
  url: string;
  type: Exclude<ResultType, "">;
  date: string;
  tags: string;
  emoji: string;
  snippet: string;
  score: number;
}

interface SearchResponse {
  query: string;
  results: SearchResult[];
}

const typeMeta = (type: string) => TYPES.find((t) => t.id === type) ?? TYPES[0];

const stripMarks = (html: string) =>
  html
    .replace(/<\/?mark>/g, "")
    .replace(/\s+/g, " ")
    .trim();

export default function Search() {
  const { baseUrl } = getPreferenceValues<{ baseUrl: string }>();
  const site = (baseUrl || "https://zander.wtf").replace(/\/$/, "");
  const [query, setQuery] = useState("");
  const [type, setType] = useState<ResultType>("");

  const params = new URLSearchParams({ q: query, limit: "25" });
  if (type) params.set("type", type);

  const { data, isLoading } = useFetch<SearchResponse>(
    `${site}/api/search?${params.toString()}`,
    {
      execute: query.trim().length >= 2,
      keepPreviousData: true,
    },
  );

  const results = query.trim().length >= 2 ? (data?.results ?? []) : [];

  return (
    <List
      isLoading={isLoading}
      searchText={query}
      onSearchTextChange={setQuery}
      throttle
      searchBarPlaceholder="Search zander.wtf..."
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter by type"
          storeValue
          onChange={(value) => setType(value as ResultType)}
        >
          {TYPES.map((t) => (
            <List.Dropdown.Item
              key={t.id}
              value={t.id}
              title={t.title}
              icon={t.icon}
            />
          ))}
        </List.Dropdown>
      }
    >
      <List.EmptyView
        icon={Icon.MagnifyingGlass}
        title={
          query.trim().length >= 2
            ? "No results"
            : "Search blog posts, code notes, projects and more"
        }
      />
      {results.map((result) => (
        <List.Item
          key={result.url}
          icon={result.emoji || typeMeta(result.type).icon}
          title={result.title}
          subtitle={stripMarks(result.snippet)}
          accessories={[
            { tag: typeMeta(result.type).title },
            ...(result.date ? [{ date: new Date(result.date) }] : []),
          ]}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={result.url} />
              <Action.CopyToClipboard
                title="Copy URL"
                content={result.url}
                shortcut={{ modifiers: ["cmd"], key: "c" }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
