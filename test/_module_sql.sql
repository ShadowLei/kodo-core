

-- 1. create default
> psql postgres
CREATE USER kodo WITH PASSWORD 'abc!@#123';
create database kodo_test;
GRANT CONNECT ON DATABASE kodo_test TO kodo;
GRANT USAGE, CREATE ON DATABASE kodo_test TO kodo;
GRANT USAGE, CREATE ON SCHEMA public TO kodo;

GRANT ALL PRIVILEGES ON "order" TO kodo;
GRANT ALL PRIVILEGES ON "payment" TO kodo;
GRANT ALL PRIVILEGES ON "payment-detail" TO kodo;
GRANT ALL PRIVILEGES ON "owner" TO kodo;

-- 2.
> psql -U kodo -h localhost -d kodo_test

-- use kodo_test;
-- > \c kodo_test;

create table "order" (
    "id" varchar(64) primary key,
    "logid" varchar(64),
    "operator" varchar(255) null,
    "ts" timestamp default now()
);

create table "payment" (
    id varchar(64) primary key,
    orderid varchar(64),
    amount decimal(9, 2),
    operator varchar(255) null,
    ts timestamp default now()
);

create table "payment-detail" (
    id varchar(64) primary key,
    paymentid varchar(64),
    amount decimal(9, 2),
    "desc" varchar(255) null,
    ts timestamp default now()
);

create table "owner" (
    id varchar(64) primary key,
    orderid varchar(64),
   "name" varchar(255),
    ts timestamp default now()
);

INSERT INTO table_name (column1, column2, column3)
VALUES (value1, value2, value3);

insert into "order" (id, logid, operator)
values
('o1', '111', NULL),
('o2', 'shadow', NULL),
('o3', 'P12345', 'Shadow'),
('o4', 'P12345', 'Allen');

insert into "payment" (id, orderid, amount)
values
('p1-1', 'o1', 500),
('p3-1', 'o3', 1300),
('p3-2', 'o3', 2500),
('p4-1', 'o4', 1100),
('px-1', 'xxx', 5600),
('px-2', 'xxx', 9000);

insert into "owner" (id, orderid, "name")
values
('oo3-1', 'o3', 'LPSV0001');

insert into "payment-detail" (id, paymentid, amount, "desc")
values
('pd3-1', 'p3-1', 2400, 'shaodw - payment on 2023'),
('pd3-2', 'p3-2', 2800, 'shaodw - payment on 2024');
