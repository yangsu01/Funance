import { useState } from "react";
import {
  Dropdown,
  InputGroup,
  Form,
  FloatingLabel,
  Col,
  Row,
  Button,
} from "react-bootstrap";

// types
import { GameFilterOptions } from "../../utils/types";

type Props = {
  onSearch: (search: string) => void;
  onFilter: (filter: GameFilterOptions) => void;
  onReset: () => void;
  filter: GameFilterOptions;
};

const GameListOptions = ({ onSearch, onFilter, filter, onReset }: Props) => {
  const [search, setSearch] = useState("");

  const handleFilter = (selectedFilter: GameFilterOptions) => {
    onFilter(selectedFilter);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(search);
  };

  return (
    <Row className="d-flex justify-content-end align-items-center">
      <Col md={6} onSubmit={handleSearch}>
        <Form>
          <InputGroup className="mb-3">
            <FloatingLabel controlId="search" label="Search Game">
              <Form.Control
                required
                type="text"
                placeholder="Search Game"
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />
            </FloatingLabel>
            <Button type="submit" variant="outline-light">
              Search
            </Button>

            <Dropdown
              onSelect={(eventKey) =>
                handleFilter(eventKey as GameFilterOptions)
              }
            >
              <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
                Filter
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item eventKey="All" active={filter === "All"}>
                  All
                </Dropdown.Item>
                <Dropdown.Item
                  eventKey="Not Started"
                  active={filter === "Not Started"}
                >
                  Not Started
                </Dropdown.Item>
                <Dropdown.Item
                  eventKey="In Progress"
                  active={filter === "In Progress"}
                >
                  In Progress
                </Dropdown.Item>
                <Dropdown.Item
                  eventKey="Completed"
                  active={filter === "Completed"}
                >
                  Completed
                </Dropdown.Item>
                <Dropdown.Item eventKey="Joined" active={filter === "Joined"}>
                  Joined
                </Dropdown.Item>
                <Dropdown.Item
                  eventKey="Not Joined"
                  active={filter === "Not Joined"}
                >
                  Not Joined
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Button variant="outline-light" onClick={onReset}>
              Reset
            </Button>
          </InputGroup>
        </Form>
      </Col>
    </Row>
  );
};

export default GameListOptions;
