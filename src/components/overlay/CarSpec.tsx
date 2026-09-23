import type { CarSpecFact } from "../../lib/schema";

export function SpecHighlights({ facts }: { facts: CarSpecFact[] }) {
  return (
    <dl className="grid grid-cols-3 gap-2">
      {facts.map((fact) => (
        <div key={fact.label} className="min-w-0">
          <dt className="text-muted-foreground text-[0.65rem] tracking-wide uppercase">{fact.label}</dt>
          <dd className="truncate text-sm text-white">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SpecSummary({ facts }: { facts: CarSpecFact[] }) {
  return (
    <dl className="mb-6 grid grid-cols-4 gap-2 md:mb-8">
      {facts.map((fact) => (
        <div key={fact.label} className="min-w-0">
          <dt className="text-muted-foreground text-[0.65rem] tracking-wide uppercase">{fact.label}</dt>
          <dd className="truncate text-sm text-white">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SpecSheet({ facts }: { facts: CarSpecFact[] }) {
  return (
    <dl className="grid grid-cols-[minmax(0,8rem)_1fr] gap-x-4 gap-y-2.5 text-sm">
      {facts.map((fact) => (
        <div key={fact.label} className="contents">
          <dt className="text-muted-foreground">{fact.label}</dt>
          <dd className="text-white">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
