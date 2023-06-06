create table reviews (id serial primary key,
data JSONB not null);


\copy reviews (data) from '/path/to/reviews/fitbit_5_reviews_lines.json' with CSV quote 
E'\x01' DELIMITER E'\x02';

--A few commands to check the data
select data->> 'title' from reviews limit 5;

select data->> 'text' AS body from reviews ORDER BY (data->>'count')::int DESC limit 5;

select count(*) from reviews where data @> ('{"stars": "5"}'::jsonb);

--Data Looks good. Create the Index

CREATE INDEX reviews_json_path_ops ON reviews USING gin (data jsonb_path_ops);

--Wait a while and then run the query again with explain select
--You should get an index scan instead of a seq scan
explain select count(*) from reviews where data @> ('{"stars": "5"}'::jsonb);

SELECT *
FROM reviews 
WHERE data @> '{"title": "Good"}';

--Some commands that return the number of rows where the text contains a certain word
--Can start to identify that sleep and battery are very common words
--Though these do not use gin index
SELECT count(*) FROM reviews WHERE (data->>'text') ILIKE '%sleep%';
 count 
-------
   800
(1 row)

wearable_reviews=> SELECT count(*) FROM reviews WHERE (data->>'text') ILIKE '%battery%';
 count 
-------
   826
(1 row)

wearable_reviews=> SELECT count(*) FROM reviews WHERE (data->>'text') ILIKE '%health%';


--Since I will be doing text searches I will add a new gin index
--Creates new text_vector column that is a tsvector of the text column
--That is updated automatically with each new row
ALTER TABLE reviews
ADD COLUMN text_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', data->>'text')) STORED;

CREATE INDEX gin_reviews ON reviews USING gin(text_vector);

--Should retrun Heat Scan
EXPLAIN SELECT data->>'title' 
FROM reviews 
WHERE text_vector @@ to_tsquery('english', 'great');
                                 QUERY PLAN  

