DROP DATABASE if exists soam_db ;
CREATE DATABASE soam_db;
\c soam_db;
CREATE TABLE member_types(
    member_type_id int primary key,
    member_type_name varchar(150)
);
    
CREATE TABLE members (
    member_id serial primary key ,
    m_ref varchar(8) unique,
    first_name varchar(100),
    last_name varchar(100),
    adress varchar(100),
    email varchar(50),
    phone varchar(20),
    member_type_id int references member_types(member_type_id)
);

CREATE TABLE feedbacks (
    feedbacks_id int primary key,
    fb_description text,
    member_id int references members(member_id)
);

CREATE TABLE evenements (
    evenement_id int primary key,
    ev_name varchar(100),
    ev_description text,
    ev_date date,
    localisation varchar(50)
);

CREATE TABLE activities (
    activity_id int primary key,
    ac_name varchar(100),
    ac_description text,
    ac_date date,
    evenement_id int references evenements(evenement_id)
);

CREATE TABLE participations (
    member_id int references members(member_id),
    evenement_id int references evenements(evenement_id),
    activity_id int references activities(activity_id)
);

CREATE TABLE asign(
    evenement_id int references evenements(evenement_id),
    activity_id int references activities(activity_id)
);

CREATE TABLE ressources (
    ressource_id int primary key,
    res_type varchar(100),
    res_description text,
    res_count int
);

CREATE TABLE donators (
    donator_id int primary key,
    d_name varchar(150),
    d_contact varchar(250),
    d_description text,
    member_id int references members(member_id)
);

CREATE TABLE finances (
    finances_id int,
    fin_categories varchar(1),
    amount int,
    add_date date default current_date,
    fin_description text,
    donator_id int references donators(donator_id),
    ressource_id int references ressources(ressource_id)
);
