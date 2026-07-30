import { act, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fireIntersections } from "../../test/setup";
import Reveal from "./Reveal";

describe("Reveal", () => {
  it("starts unrevealed and reveals once on intersection", () => {
    const { container } = render(
      <Reveal>
        <p>hello</p>
      </Reveal>,
    );
    const wrapper = container.firstElementChild;
    expect(wrapper?.className).toContain("reveal");
    expect(wrapper?.className).not.toContain("reveal-visible");

    act(() => fireIntersections());
    expect(wrapper?.className).toContain("reveal-visible");
  });

  it("always renders children in the DOM (CSS-only hiding)", () => {
    const { getByText } = render(
      <Reveal>
        <p>content</p>
      </Reveal>,
    );
    expect(getByText("content")).toBeTruthy();
  });
});
