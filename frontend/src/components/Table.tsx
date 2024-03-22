interface Props {
  tableName: string;
  content: object[];
}

const Table = ({ tableName, content }: Props) => {
  let headers = Object.keys(content[0]);

  return (
    <div>
      <h2>{tableName}</h2>
      {content.length === 0 && <p>{tableName + " not available yet!"}</p>}
      <table className="table table-striped table-hover table-dark">
        <thead>
          <tr key="header">
            {headers.map((header) => (
              <th scope="col" key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {content.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((value, column) => (
                <td key={`${index}, ${column}`}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
