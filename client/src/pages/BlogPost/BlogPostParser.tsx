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
              className="img-fluid rounded mx-auto d-block"
            />
          );
        },

        // rendering text
        [BLOCKS.PARAGRAPH]: (_: Node, children: React.ReactNode) => {
          const childrenArray = React.Children.toArray(children);

          if (
            childrenArray.length > 0 &&
            String(childrenArray[0]).startsWith("$$")
          ) {
            return <p className="fs-5 equation">{children}</p>;
          }
          return <p className="fs-5">{children}</p>;
        },

        // rendering table
        [BLOCKS.TABLE]: (_: Node, children: React.ReactNode) => (
          <div className="table-responsive">
            <table className="table table-striped table-sm">
              <tbody>{children}</tbody>
            </table>
          </div>
        ),
        // table row
        [BLOCKS.TABLE_ROW]: (_: Node, children: React.ReactNode) => {
          const childrenArray = React.Children.toArray(children);
          if (
            React.isValidElement(childrenArray[0]) &&
            childrenArray[0].type === "thead"
          ) {
            return <thead>{children}</thead>;
          }
          return <tr>{children}</tr>;
        },
        // table header cell
        [BLOCKS.TABLE_HEADER_CELL]: (_: Node, children: React.ReactNode) => {
          return <th className="p-3">{children}</th>;
        },
        // table cell
        [BLOCKS.TABLE_CELL]: (_: Node, children: React.ReactNode) => (
          <td className="ps-3">{children}</td>
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
