import { visit } from "unist-util-visit";

// The page template renders the post title as the only h1.
export default function rehypeDemoteH1() {
  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "h1") node.tagName = "h2";
    });
  };
}
