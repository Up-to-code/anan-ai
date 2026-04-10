import { BarChart3 } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import StatCard from "./StatCard";

describe("StatCard", () => {
  it("renders the sharpened metric card shell", () => {
    const markup = renderToStaticMarkup(
      <StatCard label="الطلبات" value="245" hint="آخر 30 يوم" icon={BarChart3} />,
    );

    expect(markup).toContain("rounded-lg");
    expect(markup).toContain("border-b");
    expect(markup).toContain("آخر 30 يوم");
  });

  it("renders positive and negative deltas with directional labels", () => {
    const positiveMarkup = renderToStaticMarkup(<StatCard label="الطلبات" value="245" delta={0.12} />);
    const negativeMarkup = renderToStaticMarkup(<StatCard label="الطلبات" value="245" delta={-0.08} />);

    expect(positiveMarkup).toContain("زيادة");
    expect(positiveMarkup).toContain("border-emerald-500/30");
    expect(negativeMarkup).toContain("نقصان");
    expect(negativeMarkup).toContain("border-rose-500/30");
  });
});
