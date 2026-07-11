"use client";

import { MapPin, X } from "lucide-react";
import { t, type Locale } from "@/lib/i18n";
import type { Stadium } from "@/lib/stadiums";
import { TOOLS, type ToolId } from "./tools-config";
import AtlasLogo from "../AtlasLogo";

interface Props {
  readonly active: ToolId;
  readonly onSelect: (id: ToolId) => void;
  readonly stadium: Stadium;
  readonly onChangeStadium: () => void;
  readonly locale: Locale;
  /** Mobile drawer close handler; absent on the persistent desktop rail. */
  readonly onCloseDrawer?: () => void;
}

export default function Sidebar({ active, onSelect, stadium, onChangeStadium, locale, onCloseDrawer }: Props) {
  return (
    <div className="flex h-full flex-col gap-1 p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2 text-base font-black tracking-tight text-text">
          <AtlasLogo className="h-8 w-8" />
          AtlasAccess
        </span>
        {onCloseDrawer && (
          <button
            type="button"
            onClick={onCloseDrawer}
            aria-label={t("close", locale)}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-2 md:hidden"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      <nav aria-label="Tools" className="flex flex-col gap-1">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = active === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => onSelect(tool.id)}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                isActive ? "bg-accent-weak text-accent" : "text-muted hover:bg-surface-2 hover:text-text"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {t(tool.labelKey, locale)}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={onChangeStadium}
          className="w-full rounded-xl border border-border bg-surface p-3 text-left transition hover:border-accent/40"
        >
          <span className="flex items-center gap-2 text-sm font-bold text-text">
            <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
            {stadium.name}
          </span>
          <span className="mt-0.5 block text-xs text-muted">
            {stadium.city} · {stadium.countryCode} · {t("changeStadium", locale)}
          </span>
        </button>
      </div>
    </div>
  );
}
