import { describe, expect, it } from "vitest";
import { resolveAvatarImageUrl } from "./avatarImage";

describe("resolveAvatarImageUrl", () => {
  it("returns safe local avatar sources unchanged", () => {
    expect(resolveAvatarImageUrl("/avatars/me.png")).toBe("/avatars/me.png");
    expect(resolveAvatarImageUrl("data:image/png;base64,abc")).toBe("data:image/png;base64,abc");
    expect(resolveAvatarImageUrl("blob:http://localhost:3000/avatar")).toBe("blob:http://localhost:3000/avatar");
  });

  it("drops Google-hosted profile photo URLs that rate-limit hotlink requests", () => {
    expect(resolveAvatarImageUrl("https://lh3.googleusercontent.com/a/ACg8ocExample=s96-c")).toBeNull();
    expect(resolveAvatarImageUrl("https://foo.googleusercontent.com/avatar.png")).toBeNull();
  });

  it("keeps other absolute avatar URLs and rejects invalid ones", () => {
    expect(resolveAvatarImageUrl("https://images.example.com/avatar.png")).toBe("https://images.example.com/avatar.png");
    expect(resolveAvatarImageUrl("not a url")).toBeNull();
  });
});
