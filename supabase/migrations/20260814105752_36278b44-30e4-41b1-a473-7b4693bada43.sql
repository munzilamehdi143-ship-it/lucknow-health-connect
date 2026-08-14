-- ENUMS
CREATE TYPE public.app_role AS ENUM ('platform_admin','hospital_admin','patient');
CREATE TYPE public.hospital_type AS ENUM ('government','private');
CREATE TYPE public.verification_status AS ENUM ('pending','verified','suspended');
CREATE TYPE public.availability_mode AS ENUM ('live','verified_schedule','confirmation_required','unavailable');
CREATE TYPE public.appointment_status AS ENUM ('pending_confirmation','confirmed','cancelled','completed','rescheduled');
CREATE TYPE public.payment_status AS ENUM ('unpaid','paid','refunded','failed');

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- HOSPITALS
CREATE TABLE public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type public.hospital_type NOT NULL,
  address TEXT NOT NULL,
  locality TEXT,
  city TEXT NOT NULL DEFAULT 'Lucknow',
  state TEXT NOT NULL DEFAULT 'Uttar Pradesh',
  pincode TEXT,
  phone TEXT,
  website TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  google_maps_url TEXT,
  departments TEXT[] NOT NULL DEFAULT '{}',
  specializations TEXT[] NOT NULL DEFAULT '{}',
  facilities TEXT[] NOT NULL DEFAULT '{}',
  emergency_available BOOLEAN,
  opd_timings TEXT,
  photo_url TEXT,
  data_source TEXT,
  verification_status public.verification_status NOT NULL DEFAULT 'pending',
  last_verified_at DATE,
  phase INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hospitals TO anon;
GRANT SELECT ON public.hospitals TO authenticated;
GRANT ALL ON public.hospitals TO service_role;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER hospitals_updated BEFORE UPDATE ON public.hospitals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, hospital_id)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;
CREATE OR REPLACE FUNCTION public.is_hospital_admin(_user_id UUID, _hospital_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'hospital_admin' AND hospital_id = _hospital_id);
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'platform_admin'));
CREATE POLICY "platform admin manages roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'platform_admin')) WITH CHECK (public.has_role(auth.uid(),'platform_admin'));

CREATE POLICY "hospitals public read" ON public.hospitals FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "platform admin manages hospitals" ON public.hospitals FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'platform_admin')) WITH CHECK (public.has_role(auth.uid(),'platform_admin'));
CREATE POLICY "hospital admin updates own hospital" ON public.hospitals FOR UPDATE TO authenticated
  USING (public.is_hospital_admin(auth.uid(), id)) WITH CHECK (public.is_hospital_admin(auth.uid(), id));

-- DOCTORS
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  photo_url TEXT,
  qualification TEXT,
  registration_number TEXT,
  registration_council TEXT,
  specialization TEXT NOT NULL,
  sub_specialization TEXT,
  department TEXT,
  years_experience INTEGER,
  consultation_fee NUMERIC(10,2),
  fee_verified BOOLEAN NOT NULL DEFAULT false,
  languages TEXT[] NOT NULL DEFAULT '{}',
  profile TEXT,
  opd_schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
  availability_mode public.availability_mode NOT NULL DEFAULT 'confirmation_required',
  verification_status public.verification_status NOT NULL DEFAULT 'pending',
  last_verified_at DATE,
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.doctors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.doctors TO authenticated;
GRANT ALL ON public.doctors TO service_role;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER doctors_updated BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "verified doctors public" ON public.doctors FOR SELECT TO anon, authenticated USING (verification_status = 'verified');
CREATE POLICY "admins read all doctors" ON public.doctors FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'platform_admin') OR public.is_hospital_admin(auth.uid(), hospital_id));
CREATE POLICY "platform admin manages doctors" ON public.doctors FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'platform_admin')) WITH CHECK (public.has_role(auth.uid(),'platform_admin'));
CREATE POLICY "hospital admin manages own doctors" ON public.doctors FOR ALL TO authenticated
  USING (public.is_hospital_admin(auth.uid(), hospital_id)) WITH CHECK (public.is_hospital_admin(auth.uid(), hospital_id));

-- APPOINTMENTS
CREATE SEQUENCE public.appointment_seq;
CREATE OR REPLACE FUNCTION public.generate_appointment_number() RETURNS TEXT
LANGUAGE sql VOLATILE SET search_path = public AS $$
  SELECT 'APP-' || to_char(now() AT TIME ZONE 'Asia/Kolkata','YYYYMMDD') || '-' || lpad(nextval('public.appointment_seq')::text, 5, '0');
$$;

CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_number TEXT NOT NULL UNIQUE DEFAULT public.generate_appointment_number(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  patient_email TEXT,
  patient_age INTEGER,
  patient_gender TEXT,
  reason TEXT,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  doctor_name TEXT,
  doctor_specialization TEXT,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE RESTRICT,
  hospital_name TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  consultation_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  platform_fee NUMERIC(10,2) NOT NULL DEFAULT 20,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_status public.payment_status NOT NULL DEFAULT 'unpaid',
  payment_id TEXT,
  status public.appointment_status NOT NULL DEFAULT 'pending_confirmation',
  availability_mode public.availability_mode NOT NULL DEFAULT 'confirmation_required',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER appointments_updated BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "patients read own appointments" ON public.appointments FOR SELECT TO authenticated
  USING (patient_id = auth.uid() OR public.has_role(auth.uid(),'platform_admin') OR public.is_hospital_admin(auth.uid(), hospital_id));
CREATE POLICY "patients create own appointments" ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (patient_id = auth.uid());
CREATE POLICY "patients update own appointments" ON public.appointments FOR UPDATE TO authenticated
  USING (patient_id = auth.uid() OR public.has_role(auth.uid(),'platform_admin') OR public.is_hospital_admin(auth.uid(), hospital_id))
  WITH CHECK (patient_id = auth.uid() OR public.has_role(auth.uid(),'platform_admin') OR public.is_hospital_admin(auth.uid(), hospital_id));

-- HOSPITAL REGISTRATIONS
CREATE TABLE public.hospital_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_name TEXT NOT NULL,
  hospital_type public.hospital_type,
  address TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Lucknow',
  pincode TEXT,
  registration_details TEXT,
  contact_person TEXT NOT NULL,
  official_email TEXT NOT NULL,
  phone TEXT NOT NULL,
  website TEXT,
  departments TEXT,
  doctors_info TEXT,
  appointment_system TEXT,
  status public.verification_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.hospital_registrations TO anon;
GRANT SELECT, INSERT, UPDATE ON public.hospital_registrations TO authenticated;
GRANT ALL ON public.hospital_registrations TO service_role;
ALTER TABLE public.hospital_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone submits registration" ON public.hospital_registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "platform admin reviews registrations" ON public.hospital_registrations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'platform_admin')) WITH CHECK (public.has_role(auth.uid(),'platform_admin'));

-- SEED: REAL LUCKNOW HOSPITALS
INSERT INTO public.hospitals (slug,name,type,address,locality,pincode,phone,website,latitude,longitude,google_maps_url,departments,specializations,facilities,emergency_available,opd_timings,data_source,verification_status,last_verified_at,phase) VALUES
('kgmu','King George''s Medical University','government','Shah Mina Road, Chowk, Lucknow, Uttar Pradesh','Chowk','226003','+91-522-2257450','https://www.kgmu.org',26.8698,80.9128,'https://www.google.com/maps/search/?api=1&query=26.8698,80.9128',
 ARRAY['General Medicine','General Surgery','Cardiology','Neurology','Orthopaedics','Paediatrics','Obstetrics & Gynaecology','Dermatology','Psychiatry','Radiology','Dentistry'],
 ARRAY['Trauma Care','Cardiovascular Sciences','Neurosciences','Oncology','Dental Sciences'],
 ARRAY['24x7 Emergency & Trauma Centre','ICU','Blood Bank','Pharmacy','Diagnostic Laboratory','Ambulance'],
 true,'OPD registration typically 08:00–13:00 (Mon–Sat). Confirm with hospital.','Official hospital website (kgmu.org)','verified','2026-08-14',1),
('sgpgi','Sanjay Gandhi Postgraduate Institute of Medical Sciences','government','Raebareli Road, Lucknow, Uttar Pradesh','Raebareli Road','226014','+91-522-2668700','https://www.sgpgims.org.in',26.7444,80.9420,'https://www.google.com/maps/search/?api=1&query=26.7444,80.9420',
 ARRAY['Cardiology','Nephrology','Neurology','Gastroenterology','Endocrinology','Urology','Medical Oncology','Hepatology','Neurosurgery','Cardiovascular & Thoracic Surgery'],
 ARRAY['Super-speciality tertiary care','Organ transplant','Advanced diagnostics'],
 ARRAY['Emergency Medicine','ICU','Blood Bank','Advanced Imaging','Pharmacy'],
 true,'OPD by department schedule (Mon–Sat). Confirm with hospital.','Official hospital website (sgpgims.org.in)','verified','2026-08-14',1),
('rmlims','Dr. Ram Manohar Lohia Institute of Medical Sciences','government','Vibhuti Khand, Gomti Nagar, Lucknow, Uttar Pradesh','Gomti Nagar','226010','+91-522-4918500','https://www.drrmlims.ac.in',26.8130,81.0060,'https://www.google.com/maps/search/?api=1&query=26.8130,81.0060',
 ARRAY['General Medicine','Cardiology','Nephrology','Neurology','Orthopaedics','Paediatrics','Obstetrics & Gynaecology','Gastroenterology','Pulmonary Medicine'],
 ARRAY['Cardiac Sciences','Renal Sciences','Critical Care'],
 ARRAY['24x7 Emergency','ICU','Blood Bank','Diagnostics','Pharmacy'],
 true,'OPD typically 09:00–14:00 (Mon–Sat). Confirm with hospital.','Official hospital website (drrmlims.ac.in)','verified','2026-08-14',1),
('civil-hospital-lucknow','Civil Hospital Lucknow','government','Sardar Patel Marg, Hazratganj, Lucknow, Uttar Pradesh','Hazratganj','226001','+91-522-2239006',NULL,26.8467,80.9462,'https://www.google.com/maps/search/?api=1&query=26.8467,80.9462',
 ARRAY['General Medicine','General Surgery','Orthopaedics','Paediatrics','Obstetrics & Gynaecology','ENT','Ophthalmology','Dermatology'],
 ARRAY['Secondary care','Government health schemes'],
 ARRAY['Emergency','Diagnostic Laboratory','Pharmacy','Ambulance'],
 true,'OPD timings to be confirmed by hospital.','Uttar Pradesh state health services','pending',NULL,2),
('balrampur-hospital','Balrampur Hospital','government','Golaganj, Lucknow, Uttar Pradesh','Golaganj','226018','+91-522-2224447',NULL,26.8570,80.9350,'https://www.google.com/maps/search/?api=1&query=26.8570,80.9350',
 ARRAY['General Medicine','General Surgery','Orthopaedics','Paediatrics','Obstetrics & Gynaecology','ENT','Ophthalmology'],
 ARRAY['Secondary care','Government health schemes'],
 ARRAY['24x7 Emergency','Diagnostics','Pharmacy','Ambulance'],
 true,'OPD timings to be confirmed by hospital.','Uttar Pradesh state health services','pending',NULL,2),
('apollo-medics','Apollo Medics Super Speciality Hospitals','private','Kanpur–Lucknow Road, Sector B, LDA Colony, Lucknow, Uttar Pradesh','LDA Colony','226012','+91-522-6789999','https://lucknow.apollohospitals.com',26.7830,80.8990,'https://www.google.com/maps/search/?api=1&query=26.7830,80.8990',
 ARRAY['Cardiology','Cardiac Surgery','Neurology','Neurosurgery','Orthopaedics','Oncology','Nephrology','Gastroenterology','Paediatrics','Obstetrics & Gynaecology'],
 ARRAY['Cardiac Sciences','Neurosciences','Orthopaedics & Joint Replacement','Oncology'],
 ARRAY['24x7 Emergency','ICU','Cath Lab','MRI & CT','Blood Bank','Pharmacy','Ambulance'],
 true,'OPD typically 09:00–18:00. Confirm with hospital.','Official hospital website (apollohospitals.com)','verified','2026-08-14',1),
('medanta-lucknow','Medanta Super Speciality Hospital, Lucknow','private','Sector A, Pocket 1, Amar Shaheed Path, Golf City, Lucknow, Uttar Pradesh','Golf City','226030','+91-522-4505050','https://www.medanta.org/lucknow-hospital',26.7710,80.9450,'https://www.google.com/maps/search/?api=1&query=26.7710,80.9450',
 ARRAY['Cardiology','Cardiac Surgery','Neurology','Neurosurgery','Orthopaedics','Oncology','Gastroenterology','Nephrology','Urology','Paediatrics'],
 ARRAY['Heart Institute','Neurosciences','Cancer Institute','Bone & Joint Institute'],
 ARRAY['24x7 Emergency','ICU','Cath Lab','Advanced Imaging','Blood Bank','Pharmacy','Ambulance'],
 true,'OPD typically 09:00–18:00. Confirm with hospital.','Official hospital website (medanta.org)','verified','2026-08-14',1),
('chandan-hospital','Chandan Hospital','private','Vijayant Khand, Gomti Nagar, Lucknow, Uttar Pradesh','Gomti Nagar','226010','+91-522-6600000','https://www.chandanhospital.co.in',26.8480,81.0080,'https://www.google.com/maps/search/?api=1&query=26.8480,81.0080',
 ARRAY['Cardiology','Neurology','Orthopaedics','Gastroenterology','Nephrology','General Medicine','Paediatrics','Obstetrics & Gynaecology'],
 ARRAY['Multi-speciality tertiary care'],
 ARRAY['24x7 Emergency','ICU','Diagnostics','Pharmacy','Ambulance'],
 true,'OPD timings to be confirmed by hospital.','Official hospital website (chandanhospital.co.in)','pending',NULL,2),
('health-city-vistaar','Health City Vistaar','private','Vipul Khand, Gomti Nagar, Lucknow, Uttar Pradesh','Gomti Nagar','226010','+91-522-4022222',NULL,26.8600,81.0130,'https://www.google.com/maps/search/?api=1&query=26.8600,81.0130',
 ARRAY['Orthopaedics','Neurosurgery','General Medicine','General Surgery','Critical Care'],
 ARRAY['Trauma & Orthopaedics','Neurosciences'],
 ARRAY['24x7 Emergency','ICU','Diagnostics','Pharmacy'],
 true,'OPD timings to be confirmed by hospital.','Hospital listing awaiting verification','pending',NULL,2),
('shekhar-hospital','Shekhar Hospital','private','Indira Nagar, Lucknow, Uttar Pradesh','Indira Nagar','226016','+91-522-2716000',NULL,26.8880,80.9770,'https://www.google.com/maps/search/?api=1&query=26.8880,80.9770',
 ARRAY['General Medicine','Paediatrics','Obstetrics & Gynaecology','Orthopaedics','General Surgery'],
 ARRAY['Multi-speciality care'],
 ARRAY['Emergency','ICU','Diagnostics','Pharmacy'],
 true,'OPD timings to be confirmed by hospital.','Hospital listing awaiting verification','pending',NULL,2),
('regency-lucknow','Regency Multi Super Speciality Hospital','private','Lucknow, Uttar Pradesh (full address awaiting verification)',NULL,NULL,NULL,'https://www.regencyhealthcare.in',26.8467,80.9462,'https://www.google.com/maps/search/?api=1&query=Regency+Hospital+Lucknow',
 ARRAY['Cardiology','Orthopaedics','General Medicine','Critical Care'],
 ARRAY['Multi super-speciality care'],
 ARRAY['Emergency','ICU','Diagnostics'],
 NULL,'OPD timings to be confirmed by hospital.','Awaiting verification from hospital','pending',NULL,2),
('dr-kns-memorial','Dr. KNS Memorial Hospital','private','Barabanki Road, Chinhat, Lucknow, Uttar Pradesh','Chinhat','226028',NULL,NULL,26.8880,81.0530,'https://www.google.com/maps/search/?api=1&query=26.8880,81.0530',
 ARRAY['General Medicine','General Surgery','Orthopaedics','Paediatrics','Obstetrics & Gynaecology'],
 ARRAY['Multi-speciality care'],
 ARRAY['Emergency','ICU','Diagnostics','Pharmacy'],
 NULL,'OPD timings to be confirmed by hospital.','Awaiting verification from hospital','pending',NULL,2);