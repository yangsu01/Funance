import { useState } from "react";
import {
  Dropdown,
  InputGroup,
  Form,
  FloatingLabel,
  Col,
  Row,
} from "react-bootstrap";

import { GameFilterOptions, GameSortOptions } from "../../utils/types";

type Props = {
  onSearch: (search: string) => void;
  onFilter: (filter: GameFilterOptions) => void;
  onSort: (sort: GameSortOptions) => void;
};

const GameListOptions = ({ onSearch, onSort, onFilter }: Props) => {
  const [selectedSort, setSelectedSort] = useState("Participants");
  const [selectedFilter, setSelectedFilter] = useState("All");

  const handleSort = (sort: GameSortOptions) => {
    setSelectedSort(sort);
    onSort(sort);
  };

  const handleFilter = (filter: GameFilterOptions) => {
    setSelectedFilter(filter);
    onFilter(filter);
  };

  return (
    <Row className="d-flex justify-content-end align-items-center">
      <Col md={6}>
        <InputGroup className="mb-3">
          <FloatingLabel controlId="search" label="Search Game">
            <Form.Control
              required
              type="text"
              placeholder="Search Game"
              onChange={(e) => {
                onSearch(e.target.value);
              }}
            />
          </FloatingLabel>

          <Dropdown
            onSelect={(eventKey) => handleSort(eventKey as GameSortOptions)}
          >
            <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
              Sort
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item
                eventKey="Participants"
                active={selectedSort === "Participants"}
              >
                Participants
              </Dropdown.Item>
              <Dropdown.Item
                eventKey="Start Date"
                active={selectedSort === "Start Date"}
              >
                Start Date
              </Dropdown.Item>
              <Dropdown.Item
                eventKey="Alphabetical"
                active={selectedSort === "Alphabetical"}
              >
                Alphabetical
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown
            onSelect={(eventKey) => handleFilter(eventKey as GameFilterOptions)}
          >
            <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
              Filter
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item eventKey="All" active={selectedFilter === "All"}>
                All
              </Dropdown.Item>
              <Dropdown.Item
                eventKey="Not Started"
                active={selectedFilter === "Not Started"}
              >
                Not Started
              </Dropdown.Item>
              <Dropdown.Item
                eventKey="In Progress"
                active={selectedFilter === "In Progress"}
              >
                In Progress
              </Dropdown.Item>
              <Dropdown.Item
                eventKey="Completed"
                active={selectedFilter === "Completed"}
              >
                Completed
              </Dropdown.Item>
              <Dropdown.Item
                eventKey="Public"
                active={selectedFilter === "Public"}
              >
                Public
              </Dropdown.Item>
              <Dropdown.Item
                eventKey="Private"
                active={selectedFilter === "Private"}
              >
                Private
              </Dropdown.Item>
              <Dropdown.Item
                eventKey="Not Joined"
                active={selectedFilter === "Not Joined"}
              >
                Not Joined
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </InputGroup>
      </Col>
    </Row>
  );
};

export default GameListOptions;
