"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { LINK_TYPES, typeMeta } from "@/lib/link-types";
import { createLink, deleteLink, reorderLink, toggleLinkActive, updateLink } from "./actions";

export type EditorLink = {
  id: string;
  type: string;
  label: string;
  sub: string | null;
  destination: string;
  active: boolean;
  position: number;
};

function TypeIcon({ type, size = 16 }: { type: string; size?: number }) {
  const meta = typeMeta(type);
  const Icon = meta.icon;
  return (
    <span
      className="inline-flex items-center justify-center rounded-full shrink-0"
      style={{ backgroundColor: `${meta.color}1a`, width: size + 16, height: size + 16 }}
    >
      <Icon className="shrink-0" style={{ width: size, height: size, color: meta.color }} />
    </span>
  );
}

function LinkRow({
  link,
  isFirst,
  isLast,
  isReordering,
  onChange,
  onRemove,
  onReorder,
}: {
  link: EditorLink;
  isFirst: boolean;
  isLast: boolean;
  isReordering: boolean;
  onChange: (patch: Partial<EditorLink>) => void;
  onRemove: () => void;
  onReorder: (direction: "up" | "down") => void;
}) {
  const [isPending, startTransition] = useTransition();
  const meta = typeMeta(link.type);

  function persist(patch: { type?: string; label?: string; sub?: string; destination?: string }) {
    startTransition(async () => {
      await updateLink(link.id, patch);
    });
  }

  function handleToggle() {
    const next = !link.active;
    onChange({ active: next });
    startTransition(async () => {
      await toggleLinkActive(link.id, next);
    });
  }

  function handleDelete() {
    onRemove();
    startTransition(async () => {
      await deleteLink(link.id);
    });
  }

  return (
    <div
      className="rounded-[14px] border border-[#33373b] bg-white/[0.02] p-4 flex flex-col gap-3 transition-colors hover:border-[#454951]"
      style={link.active ? { boxShadow: `inset 3px 0 0 0 ${meta.color}` } : undefined}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <TypeIcon type={link.type} />
        <select
          value={link.type}
          onChange={(e) => {
            onChange({ type: e.target.value });
            persist({ type: e.target.value });
          }}
          className="rounded-[8px] border border-[#33373b] bg-[#18181a] px-2.5 py-1.5 text-sm text-white outline-none focus:border-[#54e0ff] cursor-pointer"
        >
          {LINK_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-1.5">
          {(isPending || isReordering) && <Loader2 className="size-3.5 animate-spin text-[#7a7a83]" />}
          <button
            type="button"
            onClick={handleToggle}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
              link.active
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-white/5 text-[#7a7a83] border-[#33373b]"
            }`}
          >
            {link.active ? "Active" : "Inactive"}
          </button>
          <button
            type="button"
            onClick={() => onReorder("up")}
            disabled={isFirst}
            className="p-1.5 rounded-md border border-[#33373b] text-[#7a7a83] hover:text-white hover:border-[#54e0ff]/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            aria-label="Move up"
          >
            <ArrowUp className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onReorder("down")}
            disabled={isLast}
            className="p-1.5 rounded-md border border-[#33373b] text-[#7a7a83] hover:text-white hover:border-[#54e0ff]/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            aria-label="Move down"
          >
            <ArrowDown className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="p-1.5 rounded-md border border-[#33373b] text-[#7a7a83] hover:text-red-400 hover:border-red-400/40 cursor-pointer transition-colors"
            aria-label="Delete link"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      <input
        value={link.label}
        onChange={(e) => onChange({ label: e.target.value })}
        onBlur={(e) => persist({ label: e.target.value })}
        placeholder={meta.placeholder}
        className="w-full rounded-[8px] border border-[#33373b] bg-[#18181a] px-3 py-2 text-sm text-white outline-none focus:border-[#54e0ff] placeholder:text-[#54545a]"
      />
      <input
        value={link.sub ?? ""}
        onChange={(e) => onChange({ sub: e.target.value })}
        onBlur={(e) => persist({ sub: e.target.value })}
        placeholder="Sub-text (optional)"
        className="w-full rounded-[8px] border border-[#33373b] bg-[#18181a] px-3 py-2 text-sm text-white outline-none focus:border-[#54e0ff] placeholder:text-[#54545a]"
      />
      <input
        value={link.destination}
        onChange={(e) => onChange({ destination: e.target.value })}
        onBlur={(e) => persist({ destination: e.target.value })}
        placeholder={meta.destinationPlaceholder}
        className="w-full rounded-[8px] border border-[#33373b] bg-[#18181a] px-3 py-2 text-sm text-white outline-none focus:border-[#54e0ff] placeholder:text-[#54545a]"
      />
    </div>
  );
}

export function LinksTab({
  links,
  onLinksChange,
}: {
  links: EditorLink[];
  onLinksChange: (links: EditorLink[]) => void;
}) {
  const [newType, setNewType] = useState("custom");
  const [newLabel, setNewLabel] = useState("");
  const [isAdding, startAdding] = useTransition();
  const [, startReordering] = useTransition();
  const [pendingReorderId, setPendingReorderId] = useState<string | null>(null);

  const sorted = [...links].sort((a, b) => a.position - b.position);
  const newMeta = typeMeta(newType);

  function updateAt(id: string, patch: Partial<EditorLink>) {
    onLinksChange(links.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function removeAt(id: string) {
    onLinksChange(links.filter((l) => l.id !== id));
  }

  function handleReorder(id: string, direction: "up" | "down") {
    const index = sorted.findIndex((l) => l.id === id);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (index === -1 || swapIndex < 0 || swapIndex >= sorted.length) return;

    const a = sorted[index];
    const b = sorted[swapIndex];

    onLinksChange(
      links.map((l) => {
        if (l.id === a.id) return { ...l, position: b.position };
        if (l.id === b.id) return { ...l, position: a.position };
        return l;
      })
    );

    setPendingReorderId(id);
    startReordering(async () => {
      await reorderLink(id, direction);
      setPendingReorderId(null);
    });
  }

  function handleAdd() {
    if (!newLabel.trim()) return;
    startAdding(async () => {
      const result = await createLink({
        type: newType,
        label: newLabel,
        sub: "",
        destination: "",
      });
      if (result.success && result.id) {
        onLinksChange([
          ...links,
          {
            id: result.id,
            type: newType,
            label: newLabel.trim(),
            sub: null,
            destination: "",
            active: true,
            position: links.length,
          },
        ]);
        setNewLabel("");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {sorted.length === 0 && (
        <div className="rounded-[14px] border border-dashed border-[#33373b] p-8 flex flex-col items-center text-center gap-2">
          <span className="inline-flex items-center justify-center size-11 rounded-full bg-[#54e0ff]/10 border border-[#54e0ff]/20 mb-1">
            <Sparkles className="size-5 text-[#54e0ff]" />
          </span>
          <p className="text-sm font-medium text-white">No links yet</p>
          <p className="text-sm text-[#7a7a83]">Add your first one below to see it go live.</p>
        </div>
      )}
      {sorted.map((link, i) => (
        <LinkRow
          key={link.id}
          link={link}
          isFirst={i === 0}
          isLast={i === sorted.length - 1}
          isReordering={pendingReorderId === link.id}
          onChange={(patch) => updateAt(link.id, patch)}
          onRemove={() => removeAt(link.id)}
          onReorder={(direction) => handleReorder(link.id, direction)}
        />
      ))}

      <div className="rounded-[14px] border border-[#33373b] bg-gradient-to-br from-[#54e0ff]/[0.06] to-transparent p-5 flex flex-col gap-3">
        <p className="text-sm font-semibold text-white flex items-center gap-2">
          <Plus className="size-4 text-[#54e0ff]" />
          Add a link
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2">
            <TypeIcon type={newType} />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className="rounded-[8px] border border-[#33373b] bg-[#18181a] px-2.5 py-2 text-sm text-white outline-none focus:border-[#54e0ff] cursor-pointer"
            >
              {LINK_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder={newMeta.placeholder}
            className="flex-1 rounded-[8px] border border-[#33373b] bg-[#18181a] px-3 py-2 text-sm text-white outline-none focus:border-[#54e0ff] placeholder:text-[#54545a]"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newLabel.trim() || isAdding}
            className="inline-flex items-center justify-center gap-1.5 rounded-[8px] px-4 py-2 text-sm font-medium bg-white text-[#18181a] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {isAdding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
