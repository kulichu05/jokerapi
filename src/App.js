import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Button, Container, Text, Grid, Card, Row } from "@nextui-org/react";

const api = "https://v2.jokeapi.dev/joke/";

const categorys = [
  "Programming",
  "Miscellaneous",
  "Dark",
  "Pun",
  "Spooky",
  "Christmas",
];
const jokeTypes = ["single", "twopart"];
const additionalParams = (type) => {
  switch (type) {
    case 0:
      return { type: jokeTypes[type] };
    case 1:
      return { type: jokeTypes[type] };
    default:
      return null;
  }
};

const jokesFormatter = (joke) => {
  if (joke.type === "single") {
    return joke.joke;
  } else {
    return `${joke.setup} ${joke.delivery}`;
  }
};

const App = () => {
  const [jokes, setJokes] = useState([]);
  const [endOfList, setEndOfList] = useState(false);

  const [filters, setFilters] = useState({
    page: 1,
    categorys: [],
  });
  const handlePageChange = (newPage) => {
    fetchJokes(newPage);
  };

  const fetchJokes = useCallback(
    async (pageNumber = 1) => {
      try {
        const response = await axios.get(
          api +
            (filters.categorys.length ? filters.categorys.join(",") : "Any"),
          {
            params: {
              amount: 10,
              idRange: `${(pageNumber - 1) * 10}-${pageNumber * 10}`,
              ...additionalParams(filters.type),
            },
          }
        );
        const newJokes = response.data.jokes.map(jokesFormatter);
        setFilters((prev) => {
          return { ...prev, page: pageNumber };
        });
        setEndOfList(false);
        setJokes(newJokes);
      } catch (error) {
        setEndOfList(true);
      }
    },
    [filters.categorys, filters.type]
  );
  const updateoJoke = async (id) => {
    const response = await axios.get(
      api + (filters.categorys.length ? filters.categorys.join(",") : "Any"),
      {
        params: {
          amount: 1,
          ...additionalParams(filters.type),
        },
      }
    );
    const updatedJoke = jokesFormatter(response.data);
    setJokes((prev) => {
      const newData = [...prev];
      newData[id] = updatedJoke;
      return newData;
    });
  };

  useEffect(() => {
    fetchJokes();
  }, [fetchJokes]);
  console.log(filters);
  return (
    <Container>
      <Grid.Container justify="space-between" css={{ p: "10px" }}>
        <Grid>
          <Button.Group css={{ m: 0 }} vertical={window.innerWidth < 768}>
            {categorys.map((cat, index) => {
              return (
                <Button
                  key={index}
                  css={{
                    opacity:
                      filters.categorys.length &&
                      filters.categorys.includes(cat)
                        ? 0.5
                        : 1,
                  }}
                  color={
                    filters.categorys.length && filters.categorys.includes(cat)
                      ? "primary"
                      : "error"
                  }
                  onClick={() => {
                    setFilters((prev) => {
                      let newCategorys = [...prev.categorys];
                      if (
                        filters.categorys.length &&
                        prev.categorys.includes(cat)
                      ) {
                        newCategorys = newCategorys.filter(
                          (actCat) => actCat !== cat
                        );
                      } else {
                        newCategorys = [...newCategorys, cat];
                      }
                      return { ...prev, categorys: newCategorys };
                    });
                  }}
                >
                  {cat}
                </Button>
              );
            })}
          </Button.Group>
        </Grid>
        <Grid>
          <Button.Group vertical={window.innerWidth < 768}>
            {jokeTypes.map((type, index) => {
              return (
                <Button
                  key={index}
                  css={{
                    opacity: filters.type === index ? 0.5 : 1,
                  }}
                  onClick={() => {
                    setFilters((prev) => {
                      if (prev.type === index) return { ...prev, type: null };
                      return { ...prev, type: index };
                    });
                  }}
                >
                  {type}
                </Button>
              );
            })}
          </Button.Group>
        </Grid>
      </Grid.Container>
      <Grid.Container
        gap={2}
        justify={window.innerWidth < 768 ? "center" : "start"}
      >
        {jokes.length &&
          jokes.map((joke, index) => (
            <Grid key={index} xs={9} sm={6} md={3}>
              <Card css={{ mw: "330px" }}>
                <Card.Body css={{ width: "auto" }}>
                  <Text css={{ width: "auto", wordWrap: "break-word" }}>
                    {joke}
                  </Text>
                </Card.Body>
                <Card.Divider />
                <Card.Footer>
                  <Row justify="center">
                    <Button
                      onClick={() => {
                        updateoJoke(index);
                      }}
                    >
                      Update
                    </Button>
                  </Row>
                </Card.Footer>
              </Card>
            </Grid>
          ))}
      </Grid.Container>
      <Grid.Container justify="center" css={{ p: "10px" }}>
        <Grid>
          <Button.Group>
            <Button
              disabled={filters.page === 1}
              onClick={() => handlePageChange(filters.page - 1)}
            >
              {"<"}
            </Button>

            <Button disabled>{filters.page}</Button>

            <Button
              disabled={endOfList}
              onClick={() => handlePageChange(filters.page + 1)}
            >
              {">"}
            </Button>
          </Button.Group>
        </Grid>
      </Grid.Container>
    </Container>
  );
};

export default App;
