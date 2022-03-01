CREATE TABLE notes (
    id SERIAL NOT NULL,
    name TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL
);
