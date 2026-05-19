import { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Card, Form, Button, Badge, InputGroup,} from "react-bootstrap";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { userRole, logoutUser } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate()

  // Pagination & Navigation States
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState(
    "http://127.0.0.1:8000/api/courses/",
  );

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");

  // Form state for Instructors
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("BEGINNER");

  // 1. Fetch courses dynamically based on the current URL configuration
  const fetchCourses = async (url) => {
    try {
      const response = await axios.get(url);
      setCourses(response.data.results);
      setNextPage(response.data.next);
      setPrevPage(response.data.previous);
    } catch (error) {
      console.error("Error fetching courses", error);
    }
  };

  // search or difficulty changes!
  useEffect(() => {
    let baseUrl = `http://127.0.0.1:8000/api/courses/?search=${searchQuery}`;
    if (selectedDifficulty) {
      baseUrl += `&difficulty=${selectedDifficulty}`;
    }
    fetchCourses(baseUrl);
  }, [searchQuery, selectedDifficulty]); // <-- These dependencies tell React to trigger this block on every keypress!

  // 3. Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedDifficulty("");
  };

  // 4. Handle Course Creation
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/api/courses/", {
        title,
        description,
        category,
        difficulty,
      });
      setTitle("");
      setDescription("");
      setCategory("");
      setDifficulty("BEGINNER");
      fetchCourses(currentPageUrl);
    } catch (error) {
      alert("Error creating course.");
      console.error(error.response?.data);
    }
  };

  return (
    <Container className="mt-4">
      {/* Header bar section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>SkillStream Dashboard</h2>
        <div>
          <Badge bg="info" className="me-3 fs-6">
            Role: {userRole}
          </Badge>
          <Button variant="outline-danger" size="sm" onClick={logoutUser}>
            Logout
          </Button>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR PANEL */}
      <Card className="mb-4 bg-light shadow-sm border-0">
        <Card.Body>
          <div className="row align-items-center g-2">
            <Col md={7}>
              <InputGroup size="sm">
                <InputGroup.Text>Search</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Start typing to instantly search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} // <-- Triggers useEffect
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                size="sm"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                <option value="">All Difficulty Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Button
                variant="outline-secondary"
                size="sm"
                type="button"
                onClick={handleResetFilters}
                className="w-100"
              >
                Clear
              </Button>
            </Col>
          </div>
        </Card.Body>
      </Card>
      <Row>
        {/* Course Creation Form Panel */}
        {(userRole === "INSTRUCTOR" || userRole === "ADMIN") && (
          <Col md={4} className="mb-4">
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Create New Course</Card.Title>
                <Form onSubmit={handleCreateCourse}>
                  <Form.Group className="mb-2">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Category</Form.Label>
                    <Form.Control
                      type="text"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Label>Difficulty</Form.Label>
                    <Form.Select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="w-100">
                    Publish Course
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        )}

        {/* Main Content Layout showing results list */}
        <Col md={userRole === "INSTRUCTOR" || userRole === "ADMIN" ? 8 : 12}>
          <h4 className="mb-3">Available Courses</h4>
          {courses.length === 0 ? (
            <p className="text-muted">
              No courses match your filter parameters.
            </p>
          ) : null}
          <Row>
            {courses.map((course) => (
              <Col
                md={userRole === "INSTRUCTOR" || userRole === "ADMIN" ? 6 : 4}
                key={course.id}
                className="mb-3"
              >
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <Badge bg="secondary" className="mb-2">
                      {course.category}
                    </Badge>
                    <Card.Title>{course.title}</Card.Title>
                    <Card.Text
                      className="text-muted"
                      style={{ fontSize: "0.9rem" }}
                    >
                      {course.description.substring(0, 80)}...
                    </Card.Text>
                    <Button
                      variant="primary"
                      size="sm"
                      className="mt-3 w-100"
                      onClick={() => navigate(`/course/${course.id}`)} // Make sure to import useNavigate from 'react-router-dom' at the top if it's missing!
                    >
                      Enter Workspace &rarr;
                    </Button>
                  </Card.Body>
                  <Card.Footer
                    className="bg-white border-0 text-muted"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Instructor: {course.instructor_username} | Level:{" "}
                    {course.difficulty}
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>

          {/* PAGINATION INTERACTION CONTROLS */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <Button
              variant="secondary"
              size="sm"
              disabled={!prevPage}
              onClick={() => setCurrentPageUrl(prevPage)}
            >
              &larr; Previous Page
            </Button>
            <span className="text-muted" style={{ fontSize: "0.85rem" }}>
              Dynamic Batching
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={!nextPage}
              onClick={() => setCurrentPageUrl(nextPage)}
            >
              Next Page &rarr;
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
