import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { TOOLS, CATEGORY_LABELS, type ToolCategory } from "@/lib/tools";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Lang } from "@/i18n/translations";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function placeholder(lang: Lang) {
  if (lang === "ko") return "계산기 검색...";
  if (lang === "fr") return "Rechercher...";
  return "Search tools...";
}

function noResults(lang: Lang) {
  if (lang === "ko") return "검색 결과가 없습니다.";
  if (lang === "fr") return "Aucun résultat.";
  return "No results found.";
}

const CATEGORIES: ToolCategory[] = ["ai", "fr", "finance", "life", "unit", "etc", "entertainment"];

export default function SearchDialog({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

  const select = useCallback(
    (path: string) => {
      onOpenChange(false);
      navigate(path);
    },
    [navigate, onOpenChange],
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={placeholder(lang)} />
      <CommandList>
        <CommandEmpty>{noResults(lang)}</CommandEmpty>
        {CATEGORIES.map((cat) => {
          const tools = TOOLS.filter((tool) => tool.category === cat);
          if (tools.length === 0) return null;
          const heading = CATEGORY_LABELS[cat][lang];
          return (
            <CommandGroup key={cat} heading={heading}>
              {tools.map((tool) => {
                const title = t(tool.titleKey as Parameters<typeof t>[0]);
                const desc = t(tool.descKey as Parameters<typeof t>[0]);
                const searchValue = `${title} ${desc} ${tool.keywords.join(" ")}`;
                return (
                  <CommandItem
                    key={tool.id}
                    value={searchValue}
                    onSelect={() => select(tool.path)}
                    className="flex items-center gap-2.5 cursor-pointer"
                  >
                    <span className="text-xl leading-none">{tool.emoji}</span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-sm text-foreground truncate">
                        {title}
                        {tool.badge && (
                          <span
                            className={`ml-1.5 px-1 py-0.5 text-[10px] font-bold rounded uppercase leading-none ${
                              tool.badge === "hot"
                                ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                                : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                            }`}
                          >
                            {tool.badge}
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">{desc}</span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
