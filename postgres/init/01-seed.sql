-- Crear usuario de prueba (password: 'password')
INSERT INTO "User" (username, password) VALUES
  ('testuser', '$2b$10$J5Xs/sflseV23CZgpH/rOuY4S5nUq0l2mvyBFxkYggyRD6g29Q/9m');

-- Crear algunos mazos de ejemplo
INSERT INTO "Deck" (name, description, "userId") VALUES
  ('Español-Inglés Básico', 'Vocabulario básico para principiantes', 1),
  ('Programación JavaScript', 'Conceptos fundamentales de JS', 1),
  ('Capitales del Mundo', 'Principales capitales y sus países', 1);

-- Crear flashcards para el mazo Español-Inglés
INSERT INTO "Flashcard" (front, back, "deckId") VALUES
  ('Casa', 'House', 1),
  ('Perro', 'Dog', 1),
  ('Gato', 'Cat', 1);

-- Crear flashcards para el mazo JavaScript
INSERT INTO "Flashcard" (front, back, "deckId") VALUES
  ('¿Qué es una Promise?', 'Un objeto que representa la eventual finalización (o falla) de una operación asíncrona', 2),
  ('¿Qué es el hoisting?', 'Comportamiento de JavaScript donde las declaraciones de variables y funciones son movidas al inicio de su scope', 2),
  ('¿Qué es el closure?', 'Una función que tiene acceso a variables en su scope externo incluso después de que la función externa haya retornado', 2);

-- Crear flashcards para el mazo Capitales
INSERT INTO "Flashcard" (front, back, "deckId") VALUES
  ('Francia', 'París', 3),
  ('Japón', 'Tokio', 3),
  ('Argentina', 'Buenos Aires', 3);