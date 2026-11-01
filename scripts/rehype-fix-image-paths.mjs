import { visit } from "unist-util-visit";

/**
 * Rehype plugin to rewrite image paths at compile time.
 * Transforms:
 *   ../../public/foo → /foo
 *   public/foo → /foo
 * Leaves absolute https:// URLs unchanged.
 */
export default function rehypeFixImagePaths() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "img" && node.properties?.src) {
        let src = node.properties.src;

        if (typeof src === "string" && !src.startsWith("http")) {
          if (src.startsWith("../../public/")) {
            src = src.replace("../../public/", "/");
          } else if (src.startsWith("public/")) {
            src = src.replace("public/", "/");
          }

          node.properties.src = src;
        }
      }
    });
  };
}
