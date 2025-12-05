--
-- PostgreSQL database dump
--

-- Dumped from database version 15.12 (Homebrew)
-- Dumped by pg_dump version 15.12 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS shop_db;
--
-- Name: shop_db; Type: DATABASE; Schema: -; Owner: -
--

CREATE DATABASE shop_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C';


\connect shop_db

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_product_reviews_author_gender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_product_reviews_author_gender AS ENUM (
    'male',
    'female'
);


--
-- Name: enum_products_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_products_category AS ENUM (
    'men',
    'women',
    'accessories'
);


--
-- Name: enum_users_gender; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_users_gender AS ENUM (
    'male',
    'female',
    'na'
);


--
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_users_role AS ENUM (
    'admin',
    'user'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_images (
    id integer NOT NULL,
    product_id integer NOT NULL,
    image character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: product_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_images_id_seq OWNED BY public.product_images.id;


--
-- Name: product_properties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_properties (
    id integer NOT NULL,
    product_id integer NOT NULL,
    property_name character varying(255) NOT NULL,
    property_value character varying(255) NOT NULL,
    property_price numeric(20,2) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: product_properties_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_properties_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_properties_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_properties_id_seq OWNED BY public.product_properties.id;


--
-- Name: product_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_reviews (
    id integer NOT NULL,
    product_id integer NOT NULL,
    author_name character varying(255) NOT NULL,
    author_first_name character varying(255),
    author_last_name character varying(255),
    author_gender public.enum_product_reviews_author_gender,
    rating smallint NOT NULL,
    text text NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


--
-- Name: product_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_reviews_id_seq OWNED BY public.product_reviews.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    manufacturer_id smallint NOT NULL,
    name character varying(255) NOT NULL,
    alias character varying(255) NOT NULL,
    short_description text NOT NULL,
    description text NOT NULL,
    price numeric(20,2) NOT NULL,
    image character varying(255) NOT NULL,
    available smallint DEFAULT 1 NOT NULL,
    meta_keywords character varying(255) NOT NULL,
    meta_description character varying(255) NOT NULL,
    meta_title character varying(255) NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    category public.enum_products_category
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role public.enum_users_role DEFAULT 'user'::public.enum_users_role NOT NULL,
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    gender public.enum_users_gender DEFAULT 'na'::public.enum_users_gender NOT NULL,
    city character varying(255),
    about text,
    marketing boolean DEFAULT false NOT NULL,
    notify boolean DEFAULT true NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: product_images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images ALTER COLUMN id SET DEFAULT nextval('public.product_images_id_seq'::regclass);


--
-- Name: product_properties id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_properties ALTER COLUMN id SET DEFAULT nextval('public.product_properties_id_seq'::regclass);


--
-- Name: product_reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_reviews ALTER COLUMN id SET DEFAULT nextval('public.product_reviews_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_images (id, product_id, image, title, "createdAt", "updatedAt") FROM stdin;
1	1	products/product-1.png	Ботинки мужские Classic	2025-12-04 19:20:09.539+03	2025-12-04 19:20:09.539+03
2	2	products/product-2.png	Кеды мужские Street	2025-12-04 19:20:09.542+03	2025-12-04 19:20:09.542+03
3	3	products/product-3.png	Туфли мужские Oxford	2025-12-04 19:20:09.543+03	2025-12-04 19:20:09.543+03
4	4	products/product-4.png	Кроссовки женские LightRun	2025-12-04 19:20:09.545+03	2025-12-04 19:20:09.545+03
5	5	products/product-5.png	Босоножки женские Breeze	2025-12-04 19:20:09.546+03	2025-12-04 19:20:09.546+03
6	6	products/product-6.png	Ботильоны женские City	2025-12-04 19:20:09.549+03	2025-12-04 19:20:09.549+03
7	7	products/product-7.png	Подпятник кожаный	2025-12-04 19:20:09.55+03	2025-12-04 19:20:09.55+03
8	8	products/product-8.png	Носки хлопковые (5 пар)	2025-12-04 19:20:09.551+03	2025-12-04 19:20:09.551+03
9	9	products/product-9.png	Вкладыш в сапог ABB	2025-12-04 19:20:09.554+03	2025-12-04 19:20:09.554+03
\.


--
-- Data for Name: product_properties; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_properties (id, product_id, property_name, property_value, property_price, "createdAt", "updatedAt") FROM stdin;
1	1	Материал верха	эко-кожа	0.00	2025-12-04 19:20:09.461+03	2025-12-04 19:20:09.461+03
2	1	Подошва	ТПР	0.00	2025-12-04 19:20:09.463+03	2025-12-04 19:20:09.463+03
3	1	Сезон	демисезон	0.00	2025-12-04 19:20:09.466+03	2025-12-04 19:20:09.466+03
4	2	Материал верха	текстиль	0.00	2025-12-04 19:20:09.471+03	2025-12-04 19:20:09.471+03
5	2	Стелька	съёмная	0.00	2025-12-04 19:20:09.474+03	2025-12-04 19:20:09.474+03
6	2	Застёжка	шнуровка	0.00	2025-12-04 19:20:09.476+03	2025-12-04 19:20:09.476+03
7	3	Материал верха	эко-кожа	0.00	2025-12-04 19:20:09.488+03	2025-12-04 19:20:09.488+03
8	3	Подклад	текстиль	0.00	2025-12-04 19:20:09.492+03	2025-12-04 19:20:09.492+03
9	3	Подошва	ТПР	0.00	2025-12-04 19:20:09.494+03	2025-12-04 19:20:09.494+03
10	4	Верх	дышащий текстиль	0.00	2025-12-04 19:20:09.499+03	2025-12-04 19:20:09.499+03
11	4	Амортизация	облегчённая	0.00	2025-12-04 19:20:09.502+03	2025-12-04 19:20:09.502+03
12	4	Застёжка	шнуровка	0.00	2025-12-04 19:20:09.505+03	2025-12-04 19:20:09.505+03
13	5	Стелька	мягкая	0.00	2025-12-04 19:20:09.509+03	2025-12-04 19:20:09.509+03
14	5	Подошва	лёгкая	0.00	2025-12-04 19:20:09.511+03	2025-12-04 19:20:09.511+03
15	5	Ремешки	регулируемые	0.00	2025-12-04 19:20:09.512+03	2025-12-04 19:20:09.512+03
16	6	Сезон	демисезон	0.00	2025-12-04 19:20:09.516+03	2025-12-04 19:20:09.516+03
17	6	Колодка	комфортная	0.00	2025-12-04 19:20:09.518+03	2025-12-04 19:20:09.518+03
18	6	Высота	до щиколотки	0.00	2025-12-04 19:20:09.519+03	2025-12-04 19:20:09.519+03
19	7	Материал	натуральная кожа	0.00	2025-12-04 19:20:09.523+03	2025-12-04 19:20:09.523+03
20	7	Назначение	защита и комфорт пятки	0.00	2025-12-04 19:20:09.524+03	2025-12-04 19:20:09.524+03
21	7	Крепление	клеевое	0.00	2025-12-04 19:20:09.526+03	2025-12-04 19:20:09.526+03
22	8	Состав	95% хлопок	0.00	2025-12-04 19:20:09.529+03	2025-12-04 19:20:09.529+03
23	8	Комплект	5 пар	0.00	2025-12-04 19:20:09.53+03	2025-12-04 19:20:09.53+03
24	8	Тип	унисекс	0.00	2025-12-04 19:20:09.532+03	2025-12-04 19:20:09.532+03
25	9	Назначение	поддержка голенища сапога	0.00	2025-12-04 19:20:09.534+03	2025-12-04 19:20:09.534+03
26	9	Размер	универсальный	0.00	2025-12-04 19:20:09.536+03	2025-12-04 19:20:09.536+03
27	9	Материал	пластик	0.00	2025-12-04 19:20:09.537+03	2025-12-04 19:20:09.537+03
\.


--
-- Data for Name: product_reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_reviews (id, product_id, author_name, author_first_name, author_last_name, author_gender, rating, text, "createdAt", "updatedAt") FROM stdin;
1	4	Pavel	\N	\N	\N	5	Nice shoes	2025-12-05 17:31:18.249+03	2025-12-05 17:31:18.249+03
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, manufacturer_id, name, alias, short_description, description, price, image, available, meta_keywords, meta_description, meta_title, "createdAt", "updatedAt", category) FROM stdin;
1	1	Ботинки мужские Classic	p1	Универсальные для межсезонья	Верх — эко-кожа, подклад — текстиль, подошва — ТПР. Подходят для повседневной носки.	4990.00	products/product-1.png	1	Ботинки мужские Classic, Универсальные для межсезонья, мужская обувь	Универсальные для межсезонья. Верх — эко-кожа, подклад — текстиль, подошва — ТПР. Подходят для повседневной носки. (мужская обувь)	Ботинки мужские Classic — мужская обувь — интернет-магазин Сити Класс	2025-12-04 19:20:09.453+03	2025-12-04 19:20:09.453+03	men
2	1	Кеды мужские Street	p2	Лёгкие на каждый день	Дышащий верх, гибкая подошва, комфортная посадка.	3290.00	products/product-2.png	1	Кеды мужские Street, Лёгкие на каждый день, мужская обувь	Лёгкие на каждый день. Дышащий верх, гибкая подошва, комфортная посадка. (мужская обувь)	Кеды мужские Street — мужская обувь — интернет-магазин Сити Класс	2025-12-04 19:20:09.468+03	2025-12-04 19:20:09.468+03	men
3	1	Туфли мужские Oxford	p3	Классика для офиса	Строгий силуэт, практичные материалы, комфорт на весь день.	5490.00	products/product-3.png	1	Туфли мужские Oxford, Классика для офиса, мужская обувь	Классика для офиса. Строгий силуэт, практичные материалы, комфорт на весь день. (мужская обувь)	Туфли мужские Oxford — мужская обувь — интернет-магазин Сити Класс	2025-12-04 19:20:09.481+03	2025-12-04 19:20:09.481+03	men
4	1	Кроссовки женские LightRun	p4	Дышащие и амортизирующие	Дышащий верх, амортизация, классическая шнуровка.	3790.00	products/product-4.png	1	Кроссовки женские LightRun, Дышащие и амортизирующие, женская обувь	Дышащие и амортизирующие. Дышащий верх, амортизация, классическая шнуровка. (женская обувь)	Кроссовки женские LightRun — женская обувь — интернет-магазин Сити Класс	2025-12-04 19:20:09.496+03	2025-12-04 19:20:09.496+03	women
5	1	Босоножки женские Breeze	p5	Лёгкие на каждый день	Лёгкая модель на каждый день, мягкая стелька.	2990.00	products/product-5.png	1	Босоножки женские Breeze, Лёгкие на каждый день, женская обувь	Лёгкие на каждый день. Лёгкая модель на каждый день, мягкая стелька. (женская обувь)	Босоножки женские Breeze — женская обувь — интернет-магазин Сити Класс	2025-12-04 19:20:09.507+03	2025-12-04 19:20:09.507+03	women
6	1	Ботильоны женские City	p6	Удобная колодка на межсезонье	Универсальная модель для межсезонья. Удобная колодка.	4590.00	products/product-6.png	1	Ботильоны женские City, Удобная колодка на межсезонье, женская обувь	Удобная колодка на межсезонье. Универсальная модель для межсезонья. Удобная колодка. (женская обувь)	Ботильоны женские City — женская обувь — интернет-магазин Сити Класс	2025-12-04 19:20:09.514+03	2025-12-04 19:20:09.514+03	women
7	2	Подпятник кожаный	p7	Удобство и защита пятки	Натуральная кожа.	70.00	products/product-7.png	1	Подпятник кожаный, Удобство и защита пятки, аксессуары	Удобство и защита пятки. Натуральная кожа. (аксессуары)	Подпятник кожаный — аксессуары — интернет-магазин Сити Класс	2025-12-04 19:20:09.521+03	2025-12-04 19:20:09.521+03	accessories
8	2	Носки хлопковые (5 пар)	p8	Набор базовых на каждый день	95% хлопок, комфортная резинка, унисекс.	590.00	products/product-8.png	1	Носки хлопковые (5 пар), Набор базовых на каждый день, аксессуары	Набор базовых на каждый день. 95% хлопок, комфортная резинка, унисекс. (аксессуары)	Носки хлопковые (5 пар) — аксессуары — интернет-магазин Сити Класс	2025-12-04 19:20:09.527+03	2025-12-04 19:20:09.527+03	accessories
9	2	Вкладыш в сапог ABB	p9	Форма и аккуратность сапог	Помогает держать форму обуви.	35.00	products/product-9.png	1	Вкладыш в сапог ABB, Форма и аккуратность сапог, аксессуары	Форма и аккуратность сапог. Помогает держать форму обуви. (аксессуары)	Вкладыш в сапог ABB — аксессуары — интернет-магазин Сити Класс	2025-12-04 19:20:09.533+03	2025-12-04 19:20:09.533+03	accessories
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password, role, "createdAt", "updatedAt", first_name, last_name, gender, city, about, marketing, notify) FROM stdin;
1	pavel_maslov@mail.ru	$2b$10$EVv2hTKz.Sfe7ojLZD0S6.OpgYARUjcWNwHFar5V9Zihp8N1LPlKW	admin	2025-12-04 13:03:23.635+03	2025-12-04 13:03:23.635+03	Павел	Маслов	male	Москва	ADMIN	f	t
\.


--
-- Name: product_images_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_images_id_seq', 9, true);


--
-- Name: product_properties_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_properties_id_seq', 27, true);


--
-- Name: product_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_reviews_id_seq', 1, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 9, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: product_properties product_properties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_properties
    ADD CONSTRAINT product_properties_pkey PRIMARY KEY (id);


--
-- Name: product_reviews product_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_email_key1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key1 UNIQUE (email);


--
-- Name: users users_email_key10; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key10 UNIQUE (email);


--
-- Name: users users_email_key11; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key11 UNIQUE (email);


--
-- Name: users users_email_key12; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key12 UNIQUE (email);


--
-- Name: users users_email_key13; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key13 UNIQUE (email);


--
-- Name: users users_email_key14; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key14 UNIQUE (email);


--
-- Name: users users_email_key15; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key15 UNIQUE (email);


--
-- Name: users users_email_key16; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key16 UNIQUE (email);


--
-- Name: users users_email_key17; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key17 UNIQUE (email);


--
-- Name: users users_email_key18; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key18 UNIQUE (email);


--
-- Name: users users_email_key19; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key19 UNIQUE (email);


--
-- Name: users users_email_key2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key2 UNIQUE (email);


--
-- Name: users users_email_key20; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key20 UNIQUE (email);


--
-- Name: users users_email_key21; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key21 UNIQUE (email);


--
-- Name: users users_email_key3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key3 UNIQUE (email);


--
-- Name: users users_email_key4; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key4 UNIQUE (email);


--
-- Name: users users_email_key5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key5 UNIQUE (email);


--
-- Name: users users_email_key6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key6 UNIQUE (email);


--
-- Name: users users_email_key7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key7 UNIQUE (email);


--
-- Name: users users_email_key8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key8 UNIQUE (email);


--
-- Name: users users_email_key9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key9 UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_properties product_properties_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_properties
    ADD CONSTRAINT product_properties_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_reviews product_reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

