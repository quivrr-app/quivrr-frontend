import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

for (const region of ["australia", "europe", "indonesia"]) {
  test(`${region} applies Bodhi board search parameters`, () => {
    const source = readFileSync(new URL(`../${region}/index.html`, import.meta.url), "utf8");
    assert.match(source, /new URLSearchParams\(window\.location\.search\)/);
    assert.match(source, /bodhiSearchParams\.get\("brand"\)/);
    assert.match(source, /bodhiSearchParams\.get\("model"\)/);
    assert.match(source, /bodhiSearchParams\.get\("boardSizeId"\)/);
    assert.match(source, /bodhiSearchParams\.get\("volume"\)/);
    assert.match(source, /bodhiSearchParams\.get\("autoSearch"\) === "1"/);
    assert.match(source, /await runSearch\(\)/);
  });
}
