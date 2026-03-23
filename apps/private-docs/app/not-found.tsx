import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <Badge variant="outline" className="mx-auto border-border text-muted-foreground">
            404
          </Badge>
          <CardTitle className="mt-2 text-2xl">Handbook page not found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-7 text-muted-foreground">
            The requested page does not exist in the current private handbook set.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Unlock Screen
            </Link>
            <Link
              href="/docs/overview"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              Handbook Overview
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
