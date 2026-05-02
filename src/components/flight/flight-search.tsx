"use client";

import { Plane, Search } from "lucide-react";
import { FormEvent, useState } from "react";

const searchPresets = [
  { label: "Demo", value: "demo" },
  { label: "DL47", value: "DL47" },
  { label: "BA117", value: "BA117" },
  { label: "EK201", value: "EK201" },
  { label: "AA100", value: "AA100" },
  { label: "Varios", value: "DL47,BA117,EK201,LA8084,AF454,SQ25" },
];

export function FlightSearch({
  onSearch,
  loading,
}: {
  onSearch: (query: string) => void;
  loading: boolean;
}) {
  const [query, setQuery] = useState("DL47");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(query);
  }

  return (
    <div className="w-full max-w-xl rounded-lg border border-black/10 bg-white/95 p-2 shadow-panel backdrop-blur">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-white">
          <Plane size={20} />
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="DL47, BA117, EK201 ou demo"
          className="h-10 min-w-0 flex-1 bg-transparent px-2 text-sm font-medium outline-none placeholder:text-black/45"
          autoComplete="off"
          list="flight-search-options"
        />
        <datalist id="flight-search-options">
          {searchPresets.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {preset.label}
            </option>
          ))}
        </datalist>
        <button
          type="submit"
          disabled={loading}
          className="flex h-10 items-center gap-2 rounded-md bg-foreground px-4 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Search size={17} />
          {loading ? "Buscando" : "Buscar"}
        </button>
      </form>

      <div className="mt-2 flex flex-wrap gap-2 border-t border-black/10 pt-2">
        {searchPresets.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => {
              setQuery(preset.value);
              onSearch(preset.value);
            }}
            disabled={loading}
            className="rounded-md border border-black/10 bg-white px-2.5 py-1 text-xs font-semibold text-foreground transition hover:border-accent hover:bg-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {preset.label}
          </button>
        ))}
        <span className="px-1 py-1 text-xs font-medium text-black/45">Separe voos com virgula ou espaco.</span>
      </div>
    </div>
  );
}
