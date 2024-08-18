import { useState } from "react";
import { Table, Pagination, Button } from "react-bootstrap";

type Props = {
  tableName?: string;
  headers: string[];
  content: Record<string, string | number>[];
  itemsPerPage?: number;
  actionName?: string;
  onAction?: (id: number | string) => void;
  idColumn?: string;
};

const PaginationTable = ({
  tableName,
  content,
  headers,
  itemsPerPage = 10,
  onAction,
  actionName,
  idColumn,
}: Props) => {
  const [currentPage, setCurrentPage] = useState(1);

  const pages = Math.ceil(content.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = content.slice(indexOfFirstItem, indexOfLastItem);

  const handlePagination = (page: number) => {
    setCurrentPage(page);
  };

  const handleNext = () => {
    if (currentPage === pages) return;
    setCurrentPage((page) => page + 1);
  };

  const handlePrev = () => {
    if (currentPage === 1) return;
    setCurrentPage((page) => page - 1);
  };

  const handleAction = (id: number | string) => {
    if (onAction) {
      onAction(id);
    }
  };

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
            {actionName && <th scope="col">Action</th>}
          </tr>
        </thead>

        <tbody>
          {currentItems.map((row, index) => (
            <tr key={index}>
              {headers.map((header, item) => (
                <td key={item}>{row[header]}</td>
              ))}
              {idColumn && (
                <td>
                  <Button
                    variant="outline-light"
                    size="sm"
                    onClick={() => handleAction(row[idColumn])}
                  >
                    Cancel
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      {pages > 1 && (
        <div className="d-flex justify-content-end">
          <Pagination>
            <Pagination.Prev onClick={handlePrev} />
            {Array.from({ length: pages }).map((_, index) => (
              <Pagination.Item
                key={index}
                active={index + 1 === currentPage}
                onClick={() => handlePagination(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={handleNext} />
          </Pagination>
        </div>
      )}
    </>
  );
};

export default PaginationTable;
