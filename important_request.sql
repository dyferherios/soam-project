-- Insert data into member_types
INSERT INTO member_types (member_type_id, member_type_name)
VALUES (1, 'Personnal'), (2, 'Member'), (3, 'Volunteer');

-- Insert data into members
INSERT INTO members (m_ref, first_name, last_name, adress, email, phone, member_type_id)
VALUES 
('M0001', 'John', 'Doe', '123 Main St', 'john.doe@example.com', '123-456-7890', 1),
('M0002', 'Jane', 'Smith', '456 Elm St', 'jane.smith@example.com', '234-567-8901', 2),
('M0003', 'Emily', 'Jones', '789 Maple Ave', 'emily.jones@example.com', '345-678-9012', 3);

-- Insert data into feedbacks
INSERT INTO feedbacks (feedbacks_id, fb_description, member_id)
VALUES 
(1, 'Great event, well organized!', 1),
(2, 'Had a fantastic time, looking forward to the next one.', 2),
(3, 'Could use more activities for kids.', 3);

-- Insert data into evenements
INSERT INTO evenements (evenement_id, ev_name, ev_description, ev_date, localisation)
VALUES 
(1, 'Annual Gala', 'A grand annual gala with dinner and entertainment.', '2024-06-15', 'Grand Ballroom'),
(2, 'Tech Conference', 'A conference showcasing the latest in tech innovations.', '2024-07-20', 'Convention Center'),
(3, 'Charity Run', 'A 5k run to raise funds for local charities.', '2024-08-25', 'City Park');

-- Insert data into activities
INSERT INTO activities (activity_id, ac_name, ac_description, ac_date, evenement_id)
VALUES 
(1, 'Opening Ceremony', 'The official opening ceremony of the event.', '2024-06-15', 1),
(2, 'Keynote Speech', 'Keynote speech by a renowned tech leader.', '2024-07-20', 2),
(3, 'Warm-up Session', 'A warm-up session before the run.', '2024-08-25', 3);

INSERT INTO activities (activity_id, ac_name, ac_description, ac_date)
VALUES 
(4, 'Opening Classroom', 'The official opening Classroom.', '2024-05-05');

-- Insert data into participations
INSERT INTO participations (member_id, evenement_id, activity_id)
VALUES 
(1, 1, 1),
(2, 2, 2),
(3, 3, 3);

-- Insert data into asign
INSERT INTO asign (evenement_id, activity_id)
VALUES 
(1, 1),
(2, 2),
(3, 3);

-- Insert data into ressources
INSERT INTO ressources (ressource_id, res_type, res_description, res_count)
VALUES 
(1, 'Projector', 'High definition projector for presentations.', 5),
(2, 'Chair', 'Comfortable chairs for the event.', 200),
(3, 'Table', 'Large tables for dining and exhibits.', 50);

-- Insert data into donators
INSERT INTO donators (donator_id, d_name, d_contact, d_description, member_id)
VALUES 
(1, 'Acme Corp', 'contact@acme.com', 'Corporate sponsor for the annual gala.', 1),
(2, 'Tech Innovators', 'info@techinnovators.com', 'Sponsor for the tech conference.', 2),
(3, 'Local Charity', 'support@localcharity.org', 'Partner for the charity run.', 3);

-- Insert data into finances
INSERT INTO finances (finances_id,amount, add_date, fin_description, fin_categories, donator_id, ressource_id)
VALUES 
(1, 500000,'2024-05-10', 'Donation for event organization.', 'D', 1, 1),
(2, 200000, '2024-06-01', 'Sponsorship for tech equipment.', 'R', 2, 2),
(3, 3000000,'2024-07-15', 'Contribution for charity run.', 'D', 3, 3);

--show all type of the members
select members.first_name, member_types.member_type_name from members inner join member_types on member_types.member_type_id = members.member_type_id;

select sum(amount) as depot from finances where fin_categories='D';
select sum(amount) as retrait from finances where fin_categories='R';


-- Lister tous les membres avec leur type de membre :
SELECT m.member_id, m.first_name, m.last_name, mt.member_type_name
FROM members m
JOIN member_types mt ON m.member_type_id = mt.member_type_id;

-- Lister tous les feedbacks avec les informations des membres :
SELECT f.feedbacks_id, f.fb_description, m.first_name, m.last_name
FROM feedbacks f
JOIN members m ON f.member_id = m.member_id;

-- Lister tous les activités avec leurs événements :
SELECT a.ac_name, e.ev_name 
FROM evenements e
JOIN activities a ON e.evenement_id = a.evenement_id 
order by ev_name desc;

-- Lister toutes les participations des membres aux événements et activités :
SELECT p.member_id, m.first_name, m.last_name,a.ac_name, e.ev_name 
FROM participations p
JOIN members m ON p.member_id = m.member_id
JOIN evenements e ON p.evenement_id = e.evenement_id
JOIN activities a ON p.activity_id = a.activity_id;

-- Compter le nombre total de membres par type de membre :
SELECT mt.member_type_name, COUNT(m.member_id) AS total_members
FROM member_types mt
LEFT JOIN members m ON mt.member_type_id = m.member_type_id
GROUP BY mt.member_type_name;

-- Trouver le nombre total de feedbacks pour chaque membre :
SELECT m.first_name, m.last_name, COUNT(f.feedbacks_id) AS total_feedbacks
FROM members m
LEFT JOIN feedbacks f ON m.member_id = f.member_id
GROUP BY m.member_id, m.first_name, m.last_name;

-- Lister tous les donateurs avec les membres associés :
SELECT d.donator_id, d.d_name, m.first_name, m.last_name
FROM donators d
JOIN members m ON d.member_id = m.member_id;

-- Lister toutes les ressources utilisées dans les finances :
SELECT r.ressource_id, r.res_type, r.res_description, f.amount
FROM ressources r
JOIN finances f ON r.ressource_id = f.ressource_id;
