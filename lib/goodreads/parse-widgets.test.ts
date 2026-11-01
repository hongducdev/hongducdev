import { describe, expect, test } from "bun:test";
import { extractWidgetHtml, parseChallenge, parseCurrentlyReading } from "./parse-widgets";

const reading = `  var widget_code = '<div class=\\"gr_custom_each_container_\\">\\n<div class=\\"gr_custom_book_container_\\">\\n<a title=\\"x\\" href=\\"https://www.goodreads.com/review/show/9?utm_medium=api\\"><img alt=\\"x\\" src=\\"https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/1791932766l/261167268._SY75_.jpg\\" /><\\/a>\\n<\\/div>\\n<div class=\\"gr_custom_title_\\">\\n<a rel=\\"nofollow\\" href=\\"https://www.goodreads.com/review/show/9?utm_medium=api&amp;utm_source=custom_widget\\">Đại Minh &amp; Co<\\/a>\\n<\\/div>\\n<div class=\\"gr_custom_author_\\">\\n by <a rel=\\"nofollow\\" href=\\"https://www.goodreads.com/author/show/1.Ma\\">Ma Boyong<\\/a>\\n<\\/div>\\n<\\/div>\\n';
  var widget_div = document.getElementById('gr_custom_widget_')`;

const challenge = `document.getElementById('gr_challenge_progress_body_11680').innerHTML='<h3><a href=\\"https://www.goodreads.com/challenges/11680-2026-reading-challenge?utm_medium=api\\">2026 Reading Challenge<\\/a><\\/h3>read 30 books toward his goal of 50 books.<a href=\\"https://www.goodreads.com/user_challenges/1\\">30 of 50 (60%)<\\/a>';`;

describe("goodreads widget parsing", () => {
  test("reads the currently-reading shelf and links to the public book page", () => {
    expect(parseCurrentlyReading(reading)).toEqual([
      { title: "Đại Minh & Co", author: "Ma Boyong", url: "https://www.goodreads.com/book/show/261167268" },
    ]);
  });

  test("returns an empty shelf when the widget has no books", () => {
    expect(parseCurrentlyReading("var widget_code = '<h2>none<\\/h2>';\n")).toEqual([]);
  });

  test("reads challenge progress and goal", () => {
    expect(parseChallenge(challenge)).toEqual({
      year: 2026,
      read: 30,
      goal: 50,
      url: "https://www.goodreads.com/challenges/11680-2026-reading-challenge",
    });
  });

  test("rejects responses without an HTML payload", () => {
    expect(() => extractWidgetHtml("<html>Sign in</html>")).toThrow();
    expect(() => parseChallenge("var widget_code = '<p>nothing<\\/p>';")).toThrow();
  });
});
