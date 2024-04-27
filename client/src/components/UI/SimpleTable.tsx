import React from "react";
import { Table } from "react-bootstrap";

type Props = {
  tableName?: string;
  headers: string[];
  content: Record<string, string | number>[];
};

const SimpleTable: React.FC<Props> = ({ tableName, content, headers }) => {
  return (
    <>
      {tableName && <h3>{tableName}</h3>}
      <Table responsive striped hover variant="dark">
        <thead>
          <tr key="header">
            {headers.map((header, index) => (
              <th scope="col" key={index}>
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {content.map((row, index) => (
            <tr key={index}>
              {headers.map((header, item) => (
                <td key={item}>{row[header]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default SimpleTable;
