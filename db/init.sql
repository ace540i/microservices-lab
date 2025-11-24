CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    text VARCHAR(255) NOT NULL
);

-- Insert 50 rows
DO $$
BEGIN
  FOR i IN 1..50 LOOP
    INSERT INTO messages (text) VALUES (concat('Hello message #', i));
  END LOOP;
END;
$$;
