import { getCar } from "../../cars";
import { useConfig } from "../../lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function SavedBuilds({ compact }: { compact?: boolean }) {
  const saved = useConfig((state) => state.saved);
  const deleteBuild = useConfig((state) => state.deleteBuild);

  if (saved.length === 0) return null;

  return (
    <section className={compact ? "mt-10" : "mt-14 sm:mt-20"}>
      <div className={compact ? "mb-5" : "mb-8"}>
        <p className="mb-2 text-xs font-medium tracking-[0.16em] text-white uppercase">
          Your garage
        </p>
        <h2 className="font-heading text-2xl font-medium">Saved configurations</h2>
      </div>
      <div className={compact ? "grid gap-4" : "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"}>
        {saved.map((entry) => {
          const car = getCar(entry.build.slug);
          return (
            <Card key={entry.id} size="sm">
              {entry.thumbnail ? (
                <img src={entry.thumbnail} alt={entry.name} className="h-36 w-full object-cover" />
              ) : (
                <div className="bg-muted h-36 w-full" />
              )}
              <CardHeader>
                <p className="text-xs text-white uppercase tracking-wider">{car?.name || entry.build.slug}</p>
                <CardTitle>{entry.name}</CardTitle>
              </CardHeader>
              <CardFooter className="gap-2">
                <Button asChild size="sm">
                  <a href={`/configure/${entry.build.slug}?build=${entry.id}`}>Open</a>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteBuild(entry.id)}>
                  Remove
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
