/* eslint-disable */
const { listFiles } = require("../../../components/remote-utils");

module.exports = async () => {
  const filePaths = (await listFiles()).filter(
    (filename) =>
      filename.startsWith("website/src/pages/docs") && /\.mdx?$/.test(filename)
  );
  const paths = filePaths.map((filename) =>
    filename
      .replace("website/src/pages/docs/", "")
      .replace(/\.mdx?$/, "")
      .split("/")
  );

  const metaMap = Object.create(null);

  for (const path of paths) {
    const dirPath = "/" + path.slice(0, -1).join("/");
    const filename = path.at(-1);

    metaMap[dirPath] ||= {};
    metaMap[dirPath][filename] = filename;
  }

  return {
    "/": {
      configs: "configs",
      "custom-rules": "custom-rules",
      "getting-started": "getting-started",
      "/getting-started": {
        "parser-options": "parser-options",
        parser: "parser",
      },
      index: "index",
    },
  };
};
