import { describe, it, expect, beforeEach, vi } from "vitest";
import { tryClickSkipButton } from "../../src/content/handlers/skip-button";

describe("tryClickSkipButton", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("should click .ytp-ad-skip-button when present", () => {
    const button = document.createElement("button");
    button.className = "ytp-ad-skip-button";
    button.click = vi.fn();
    document.body.appendChild(button);

    const result = tryClickSkipButton();

    expect(result).toBe(true);
    expect(button.click).toHaveBeenCalledOnce();
  });

  it("should click .ytp-ad-skip-button-modern when present", () => {
    const button = document.createElement("button");
    button.className = "ytp-ad-skip-button-modern";
    button.click = vi.fn();
    document.body.appendChild(button);

    const result = tryClickSkipButton();

    expect(result).toBe(true);
    expect(button.click).toHaveBeenCalledOnce();
  });

  it("should return false when no skip button is found", () => {
    const result = tryClickSkipButton();
    expect(result).toBe(false);
  });

  it("should click only the first matching button", () => {
    const button1 = document.createElement("button");
    button1.className = "ytp-ad-skip-button";
    button1.click = vi.fn();
    document.body.appendChild(button1);

    const button2 = document.createElement("button");
    button2.className = "ytp-ad-skip-button-modern";
    button2.click = vi.fn();
    document.body.appendChild(button2);

    tryClickSkipButton();

    expect(button1.click).toHaveBeenCalledOnce();
    expect(button2.click).not.toHaveBeenCalled();
  });
});
