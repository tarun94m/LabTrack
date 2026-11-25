insert into clinics (name, email, country) select * from (values
  ('Harbour Dental, Sydney','harbour@example.com','Australia'),
  ('Kensington Smiles, London','kensington@example.com','United Kingdom'),
  ('Pacific Dental Group, Los Angeles','pacific@example.com','United States'),
  ('Southern Cross Dental, Auckland','southern@example.com','New Zealand')
) v where not exists (select 1 from clinics);
insert into cases (case_ref, clinic_id, patient_ref, kind, status, due_date)
select * from (values
  ('LT-1001',1,'J.M.','Zirconia crown','in_progress', current_date + 1),
  ('LT-1002',2,'A.K.','3-unit bridge','received', current_date + 3),
  ('LT-1003',3,'R.S.','Veneer set (6)','in_progress', current_date - 2),
  ('LT-1004',4,'T.W.','Implant crown','received', current_date + 6),
  ('LT-1005',3,'D.P.','Night guard','received', current_date + 9),
  ('LT-1006',2,'C.L.','E.max crown','ready', current_date),
  ('LT-1007',1,'M.B.','Partial denture','in_progress', current_date + 2),
  ('LT-1008',4,'S.H.','Inlay','received', current_date - 1)
) v where not exists (select 1 from cases);
