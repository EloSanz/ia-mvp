-- Crear algunos mazos de ejemplo
INSERT INTO "Deck" (name, description) VALUES
  ('Español-Inglés Básico', 'Vocabulario básico para principiantes'),
  ('Programación JavaScript', 'Conceptos fundamentales de JS'),
  ('Capitales del Mundo', 'Principales capitales y sus países');

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