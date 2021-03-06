import { cp, Majo } from "../src";
import { src, dist } from "./util";

const BANNER = "/* Banner*/";

function assertStream(stream: Majo) {
  stream.fileList.forEach((filename) => {
    if (filename.endsWith(".ts")) {
      expect(stream.fileContents(filename).startsWith(BANNER)).toBe(true);
    } else {
      expect(stream.fileContents(filename).startsWith(BANNER)).toBe(false);
    }
  });
}

describe("transform option", () => {
  it("transform - add banner for all ts files - array usage", async () => {
    const stream = await cp({
      src,
      dist,
      write: false,
      files: [
        "**",
        ["**/*.ts", { transform: (content) => `${BANNER}\n${content}` }],
      ],
    });
    assertStream(stream);
  });

  it("transform - asynchronous transformer", async () => {
    const stream = await cp({
      src,
      dist,
      write: false,
      files: [
        "**",
        [
          "**/*.ts",
          {
            transform: async (content) => {
              await new Promise((resolve) => setTimeout(resolve, 100));
              return `${BANNER}\n${content}`;
            },
          },
        ],
      ],
    });
    assertStream(stream);
  });

  it("transform - add banner for all ts files - object usage", async () => {
    const stream = await cp({
      src,
      dist,
      write: false,
      files: {
        "**": true,
        "**/*.ts": { transform: (content) => `${BANNER}\n${content}` },
      },
    });
    assertStream(stream);
  });

  it("transform - get filename throw 2nd parameters", async () => {
    await cp({
      src,
      dist,
      write: false,
      files: {
        "**": true,
        "src/index.ts": {
          transform: (content, fileanme) => {
            expect(fileanme).toBe("src/index.ts");
            return content;
          },
        },
      },
    });
  });

  it("transform - emit extra file", async () => {
    const stream = await cp({
      src,
      dist,
      write: false,
      files: {
        "**": true,
        "src/index.ts": {
          transform: (content, fileanme, context) => {
            context.emitFile("src/index.js.map", "MAP");
            return content;
          },
        },
      },
    });

    expect(stream.fileList).toEqual([
      "package.json",
      "src/bin.ts",
      "src/index.js.map",
      "src/index.ts",
    ]);

    expect(stream.fileContents("src/index.js.map")).toBe("MAP");
  });
});
