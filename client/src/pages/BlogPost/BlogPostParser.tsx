import React from "react";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";

// context
import { MathJax, MathJaxContext } from "better-react-mathjax";

// types
import { Document, BLOCKS, Node } from "@contentful/rich-text-types";
import { BlogLinks } from "../../utils/types";

type Props = {
  content: Document;
  links: BlogLinks;
};

const config = {
  loader: { load: ["[tex]/html"] },
  tex: {
    packages: { "[+]": ["html"] },
    inlineMath: [["$", "$"]],
    displayMath: [["$$", "$$"]],
  },
};

const BlogPostParser = ({ content, links }: Props) => {
  const renderOptions = (links: BlogLinks) => {
    // create asset map
    const assetMap = new Map();
    if (links) {
      for (const asset of links.assets.block) {
        assetMap.set(asset.sys.id, asset);
      }
    }

    return {
      renderNode: {
        // rendering assets
        [BLOCKS.EMBEDDED_ASSET]: (node: Node) => {
          const asset = assetMap.get(node.data.target.sys.id);
          return (
            <img
              src={asset.url}
              alt={asset.title}
              className="img-fluid center"
            />
          );
        },

        // rendering text
        [BLOCKS.PARAGRAPH]: (_: Node, children: React.ReactNode) => {
          return <p className="fs-5">{children}</p>;
        },

        // rendering table
        [BLOCKS.TABLE]: (_: Node, children: React.ReactNode) => (
          <div className="table-responsive">
            <table className="table table-striped table-sm table-bordered">
              <tbody>{children}</tbody>
            </table>
          </div>
        ),
        [BLOCKS.TABLE_ROW]: (_: Node, children: React.ReactNode) => (
          <tr>{children}</tr>
        ),
        [BLOCKS.TABLE_CELL]: (_: Node, children: React.ReactNode) => (
          <td>{children}</td>
        ),
      },
    };
  };

  return (
    <MathJaxContext version={3} config={config}>
      <MathJax>
        {documentToReactComponents(content, renderOptions(links))}
      </MathJax>
    </MathJaxContext>
  );
};

export default BlogPostParser;
