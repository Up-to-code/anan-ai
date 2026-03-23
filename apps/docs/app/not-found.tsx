import Link from "next/link";
import { Button } from "@/components/ui/button";
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
          <CardTitle className="mt-2 text-2xl">Documentation page not found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-7 text-muted-foreground">
            The page you requested does not exist in the current documentation version.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" render={<Link href="/" />}>
              Docs Home
            </Button>
            <Button render={<Link href="/docs/getting-started" />}>Getting Started</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
