import { JSDOM } from "jsdom";

export const addHeadingLinks = (html) => {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  doc.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((heading) => {
    const id = heading.textContent
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");

    heading.id = id;

    const anchor = doc.createElement("a");
    anchor.href = `#${id}`;
    anchor.setAttribute(
      "onclick",
      `navigator.clipboard.writeText(window.location.origin + window.location.pathname + '#${id}')`,
    );

    while (heading.firstChild) {
      anchor.appendChild(heading.firstChild);
    }

    heading.appendChild(anchor);
  });

  return doc.body.innerHTML;
};
