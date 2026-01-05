--
-- PostgreSQL database dump
--

\restrict nZJCsdhS4dIj8aN3h8TWYSVS23QbdN1wVBCSpQmdTRSIjfd2X5lAvy4z1BAIJEB

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.0

-- Started on 2025-12-29 11:21:57

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 241 (class 1255 OID 18569)
-- Name: calculate_payroll(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_payroll(p_employee_id character varying, p_month character varying) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_base_salary DECIMAL;
  v_attendance_days INT;
  v_calculated_salary DECIMAL;
BEGIN
  SELECT salary INTO v_base_salary FROM employees WHERE id = p_employee_id;
  
  -- Count present days in the month
  SELECT COUNT(*) INTO v_attendance_days
  FROM attendance
  WHERE employeeId = p_employee_id
    AND date >= (p_month || '-01')::DATE
    AND date <= ((p_month || '-01')::DATE + INTERVAL '1 month' - INTERVAL '1 day');
  
  v_calculated_salary := (v_base_salary / 30) * COALESCE(v_attendance_days, 0);
  
  RETURN v_calculated_salary;
END;
$$;


ALTER FUNCTION public.calculate_payroll(p_employee_id character varying, p_month character varying) OWNER TO postgres;

--
-- TOC entry 240 (class 1255 OID 18568)
-- Name: get_employee_attendance(character varying, date, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_employee_attendance(p_employee_id character varying, p_start_date date, p_end_date date) RETURNS TABLE(total_present integer, total_absent integer, total_halfday integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE status = 'Present')::INT as total_present,
    COUNT(*) FILTER (WHERE status = 'Absent')::INT as total_absent,
    COUNT(*) FILTER (WHERE status = 'Half Day')::INT as total_halfday
  FROM attendance
  WHERE employeeId = p_employee_id
    AND date >= p_start_date
    AND date <= p_end_date;
END;
$$;


ALTER FUNCTION public.get_employee_attendance(p_employee_id character varying, p_start_date date, p_end_date date) OWNER TO postgres;

--
-- TOC entry 242 (class 1255 OID 18570)
-- Name: update_employee_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_employee_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_employee_timestamp() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 223 (class 1259 OID 18288)
-- Name: assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assets (
    id character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(100),
    description text,
    serialnumber character varying(100),
    assignedto character varying(50),
    assignedtoname character varying(255),
    status character varying(50) DEFAULT 'Available'::character varying,
    purchasedate date,
    purchasecost numeric(12,2),
    branchid character varying(50),
    location character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.assets OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 18303)
-- Name: attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance (
    id character varying(50) NOT NULL,
    employeeid character varying(50) NOT NULL,
    employeename character varying(255),
    employeeavatar character varying(500),
    date date NOT NULL,
    checkin character varying(50),
    checkout character varying(50),
    status character varying(50) DEFAULT 'Present'::character varying,
    workhours character varying(50),
    branchid character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.attendance OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 18263)
-- Name: branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branches (
    id character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    location character varying(255),
    city character varying(100),
    state character varying(100),
    zipcode character varying(20),
    country character varying(100),
    managerids text[],
    employeecount integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.branches OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 18389)
-- Name: candidates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidates (
    id character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255),
    phone character varying(20),
    jobid character varying(50),
    jobtitle character varying(255),
    resume character varying(500),
    coverletter text,
    status character varying(50) DEFAULT 'Applied'::character varying,
    applieddate date,
    interviewdate date,
    interviewnotes text,
    rating numeric(3,1),
    branchid character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.candidates OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 18275)
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    managerids text[],
    employeecount integer DEFAULT 0,
    branchid character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 18245)
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    designation character varying(100),
    department character varying(100),
    branchid character varying(50),
    joindate date,
    status character varying(50) DEFAULT 'Active'::character varying,
    salary numeric(12,2),
    avatar character varying(500),
    address text,
    city character varying(100),
    state character varying(100),
    zipcode character varying(20),
    country character varying(100),
    emergencycontact character varying(255),
    emergencyphone character varying(20),
    bankaccount character varying(50),
    bankname character varying(100),
    ifsccode character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 18482)
-- Name: groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.groups (
    id character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    members text[],
    createdby character varying(50),
    branchid character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.groups OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 18541)
-- Name: holidays; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.holidays (
    id character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    date date NOT NULL,
    description text,
    type character varying(50),
    branchid character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.holidays OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 18375)
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    department character varying(100),
    location character varying(255),
    salary_range character varying(100),
    jobtype character varying(50),
    posteddate date,
    status character varying(50) DEFAULT 'Open'::character varying,
    branchid character varying(50),
    createdby character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 18355)
-- Name: leaves; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leaves (
    id character varying(50) NOT NULL,
    employeeid character varying(50) NOT NULL,
    employeename character varying(255),
    leavetype character varying(100),
    startdate date,
    enddate date,
    duration integer,
    reason text,
    status character varying(50) DEFAULT 'Pending'::character varying,
    approvedby character varying(255),
    approveddate date,
    branchid character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.leaves OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 18470)
-- Name: logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logs (
    id character varying(50) NOT NULL,
    userid character varying(50),
    username character varying(255),
    userrole character varying(50),
    action character varying(255),
    module character varying(100),
    details text,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    branchid character varying(50),
    ipaddress character varying(45)
);


ALTER TABLE public.logs OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 18429)
-- Name: payroll; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payroll (
    id character varying(50) NOT NULL,
    employeeid character varying(50) NOT NULL,
    employeename character varying(255),
    month character varying(7),
    basesalary numeric(12,2),
    allowances numeric(12,2) DEFAULT 0,
    deductions numeric(12,2) DEFAULT 0,
    tax numeric(12,2) DEFAULT 0,
    netsalary numeric(12,2),
    status character varying(50) DEFAULT 'Pending'::character varying,
    paiddate date,
    branchid character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.payroll OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 18523)
-- Name: policies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.policies (
    id character varying(50) NOT NULL,
    categoryid character varying(50),
    title character varying(255) NOT NULL,
    content text,
    version integer DEFAULT 1,
    effectivedate date,
    createdby character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.policies OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 18512)
-- Name: policy_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.policy_categories (
    id character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.policy_categories OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 18450)
-- Name: reimbursements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reimbursements (
    id character varying(50) NOT NULL,
    employeeid character varying(50) NOT NULL,
    employeename character varying(255),
    amount numeric(12,2),
    category character varying(100),
    description text,
    status character varying(50) DEFAULT 'Pending'::character varying,
    submitteddate date,
    approveddate date,
    approvedby character varying(255),
    receipt character varying(500),
    branchid character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.reimbursements OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 18343)
-- Name: shifts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shifts (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    starttime time without time zone,
    endtime time without time zone,
    branchid character varying(50),
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.shifts OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 18555)
-- Name: system_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_config (
    id character varying(50) DEFAULT 'default'::character varying NOT NULL,
    companyname character varying(255),
    companylogo character varying(500),
    companyemail character varying(255),
    companyphone character varying(20),
    companyaddress text,
    financialyearstart integer,
    defaultleaveyear integer DEFAULT 20,
    workingdaysperweek integer DEFAULT 5,
    overtimerate numeric(5,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.system_config OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 18408)
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    assignedto character varying(50),
    assignedtoname character varying(255),
    status character varying(50) DEFAULT 'Todo'::character varying,
    priority character varying(50) DEFAULT 'Medium'::character varying,
    duedate date,
    completeddate date,
    branchid character varying(50),
    createdby character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 18494)
-- Name: teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teams (
    id character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    leaderid character varying(50),
    leadername character varying(255),
    members text[],
    branchid character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.teams OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 18324)
-- Name: timesheets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.timesheets (
    id character varying(50) NOT NULL,
    employeeid character varying(50) NOT NULL,
    employeename character varying(255),
    date date NOT NULL,
    clockin timestamp without time zone,
    clockout timestamp without time zone,
    duration integer,
    status character varying(50) DEFAULT 'Working'::character varying,
    branchid character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.timesheets OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 18225)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    avatar character varying(500),
    designation character varying(100),
    status character varying(50) DEFAULT 'Active'::character varying,
    branchids text[],
    linkedemployeeid character varying(50),
    accessmodules text[] DEFAULT ARRAY['dashboard'::text],
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    password character varying(255),
    password_hash character varying(255),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'manager'::character varying, 'employee'::character varying, 'super_admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 5254 (class 0 OID 18288)
-- Dependencies: 223
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assets (id, name, type, description, serialnumber, assignedto, assignedtoname, status, purchasedate, purchasecost, branchid, location, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5255 (class 0 OID 18303)
-- Dependencies: 224
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attendance (id, employeeid, employeename, employeeavatar, date, checkin, checkout, status, workhours, branchid, created_at, updated_at) FROM stdin;
at-1766486977558	u-1	Admin User		2025-12-23	10:49	-	Present	Working...	\N	2025-12-23 10:49:37.562001	2025-12-23 10:49:37.562001
at-1766487038270	u-1	Admin User		2025-12-23	10:50	-	Present	Working...	\N	2025-12-23 10:50:38.276785	2025-12-23 10:50:38.276785
at-1766487040200	u-1	Admin User		2025-12-23	10:50	-	Present	Working...	\N	2025-12-23 10:50:40.20173	2025-12-23 10:50:40.20173
at-1766487040652	u-1	Admin User		2025-12-23	10:50	-	Present	Working...	\N	2025-12-23 10:50:40.653903	2025-12-23 10:50:40.653903
at-1766487040852	u-1	Admin User		2025-12-23	10:50	-	Present	Working...	\N	2025-12-23 10:50:40.853897	2025-12-23 10:50:40.853897
at-1766487041022	u-1	Admin User		2025-12-23	10:50	-	Present	Working...	\N	2025-12-23 10:50:41.023994	2025-12-23 10:50:41.023994
at-1766487041183	u-1	Admin User		2025-12-23	10:50	-	Present	Working...	\N	2025-12-23 10:50:41.185374	2025-12-23 10:50:41.185374
at-1766487041340	u-1	Admin User		2025-12-23	10:50	-	Present	Working...	\N	2025-12-23 10:50:41.342402	2025-12-23 10:50:41.342402
at-1766487080740	u-1	Admin User		2025-12-23	10:51	-	Present	Working...	\N	2025-12-23 10:51:20.743318	2025-12-23 10:51:20.743318
at-1766487104895	u-1	Admin User		2025-12-23	10:51	-	Present	Working...	\N	2025-12-23 10:51:44.900639	2025-12-23 10:51:44.900639
at-1766487166097	u-1	Admin User		2025-12-23	10:52	-	Present	Working...	\N	2025-12-23 10:52:46.09978	2025-12-23 10:52:46.09978
at-1766487166688	u-1	Admin User		2025-12-23	10:52	-	Present	Working...	\N	2025-12-23 10:52:46.689828	2025-12-23 10:52:46.689828
at-1766487166965	u-1	Admin User		2025-12-23	10:52	-	Present	Working...	\N	2025-12-23 10:52:46.96735	2025-12-23 10:52:46.96735
at-1766487167142	u-1	Admin User		2025-12-23	10:52	-	Present	Working...	\N	2025-12-23 10:52:47.143611	2025-12-23 10:52:47.143611
at-1766487167303	u-1	Admin User		2025-12-23	10:52	-	Present	Working...	\N	2025-12-23 10:52:47.304637	2025-12-23 10:52:47.304637
at-1766487167446	u-1	Admin User		2025-12-23	10:52	-	Present	Working...	\N	2025-12-23 10:52:47.447929	2025-12-23 10:52:47.447929
at-1766487167609	u-1	Admin User		2025-12-23	10:52	-	Present	Working...	\N	2025-12-23 10:52:47.611153	2025-12-23 10:52:47.611153
at-1766487167749	u-1	Admin User		2025-12-23	10:52	-	Present	Working...	\N	2025-12-23 10:52:47.751531	2025-12-23 10:52:47.751531
at-1766487167898	u-1	Admin User		2025-12-23	10:52	-	Present	Working...	\N	2025-12-23 10:52:47.899604	2025-12-23 10:52:47.899604
at-1766487168159	u-1	Admin User		2025-12-23	10:52	-	Present	Working...	\N	2025-12-23 10:52:48.160593	2025-12-23 10:52:48.160593
at-1766493404974	u-1	Admin User		2025-12-23	12:36	-	Present	Working...	\N	2025-12-23 12:36:44.979387	2025-12-23 12:36:44.979387
at-1766493405495	u-1	Admin User		2025-12-23	12:36	-	Present	Working...	\N	2025-12-23 12:36:45.496568	2025-12-23 12:36:45.496568
at-1766493405693	u-1	Admin User		2025-12-23	12:36	-	Present	Working...	\N	2025-12-23 12:36:45.695026	2025-12-23 12:36:45.695026
at-1766493405858	u-1	Admin User		2025-12-23	12:36	-	Present	Working...	\N	2025-12-23 12:36:45.859761	2025-12-23 12:36:45.859761
at-1766493405996	u-1	Admin User		2025-12-23	12:36	-	Present	Working...	\N	2025-12-23 12:36:45.998413	2025-12-23 12:36:45.998413
at-1766493406286	u-1	Admin User		2025-12-23	12:36	-	Present	Working...	\N	2025-12-23 12:36:46.287814	2025-12-23 12:36:46.287814
at-1766493406698	u-1	Admin User		2025-12-23	12:36	-	Present	Working...	\N	2025-12-23 12:36:46.699684	2025-12-23 12:36:46.699684
\.


--
-- TOC entry 5252 (class 0 OID 18263)
-- Dependencies: 221
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, name, location, city, state, zipcode, country, managerids, employeecount, created_at, updated_at) FROM stdin;
b-1	Main Office	123 Business St	San Francisco	CA	94105	USA	{u-2}	50	2025-12-22 15:54:28.647679	2025-12-22 15:54:28.647679
\.


--
-- TOC entry 5260 (class 0 OID 18389)
-- Dependencies: 229
-- Data for Name: candidates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidates (id, name, email, phone, jobid, jobtitle, resume, coverletter, status, applieddate, interviewdate, interviewnotes, rating, branchid, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5253 (class 0 OID 18275)
-- Dependencies: 222
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, name, description, managerids, employeecount, branchid, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5251 (class 0 OID 18245)
-- Dependencies: 220
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, name, email, phone, designation, department, branchid, joindate, status, salary, avatar, address, city, state, zipcode, country, emergencycontact, emergencyphone, bankaccount, bankname, ifsccode, created_at, updated_at) FROM stdin;
e-1	John Manager	john.manager@company.com	555-0001	Branch Manager	Management	b-1	2020-01-15	Active	75000.00		\N	San Francisco	CA	\N	USA	\N	\N	\N	\N	\N	2025-12-22 15:54:28.649293	2025-12-22 15:54:28.649293
e-2	Software Developer	dev@company.com	555-0002	Software Engineer	Engineering	b-1	2021-03-20	Active	85000.00		\N	San Francisco	CA	\N	USA	\N	\N	\N	\N	\N	2025-12-22 15:54:28.649293	2025-12-22 15:54:28.649293
u-1	Admin User	u-1@temp.local	\N	N/A	\N	\N	\N	Active	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-12-23 10:49:37.540062	2025-12-23 10:49:37.540062
\.


--
-- TOC entry 5265 (class 0 OID 18482)
-- Dependencies: 234
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.groups (id, name, description, members, createdby, branchid, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5269 (class 0 OID 18541)
-- Dependencies: 238
-- Data for Name: holidays; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.holidays (id, name, date, description, type, branchid, created_at, updated_at) FROM stdin;
h-1766492448599	A	2025-12-23		Public	\N	2025-12-23 12:20:48.905302	2025-12-23 12:20:48.905302
\.


--
-- TOC entry 5259 (class 0 OID 18375)
-- Dependencies: 228
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, title, description, department, location, salary_range, jobtype, posteddate, status, branchid, createdby, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5258 (class 0 OID 18355)
-- Dependencies: 227
-- Data for Name: leaves; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leaves (id, employeeid, employeename, leavetype, startdate, enddate, duration, reason, status, approvedby, approveddate, branchid, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5264 (class 0 OID 18470)
-- Dependencies: 233
-- Data for Name: logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logs (id, userid, username, userrole, action, module, details, "timestamp", branchid, ipaddress) FROM stdin;
log-1766418938459	u-1	Admin User	super_admin	User Login	Auth	User logged in	2025-12-22 15:55:38	all	\N
log-1766418945214	u-1	Admin User	super_admin	User Login	Auth	User logged in	2025-12-22 15:55:45	all	\N
log-1766418961353	u-1	Admin User	super_admin	User Login	Auth	User logged in	2025-12-22 15:56:01	all	\N
log-1766418975276	u-employee	Demo Employee	employee	User Login	Auth	User logged in	2025-12-22 15:56:15	all	\N
log-1766418999027	u-1	Admin User	super_admin	User Login	Auth	User logged in	2025-12-22 15:56:39	all	\N
log-1766419018227	u-1	Admin User	super_admin	User Login	Auth	User logged in	2025-12-22 15:56:58	all	\N
log-1766419022925	u-1	Admin User	super_admin	User Login	Auth	User logged in	2025-12-22 15:57:02	all	\N
log-1766419044263	u-1	Admin User	super_admin	User Login	Auth	User logged in	2025-12-22 15:57:24	all	\N
log-1766419046303	u-1	Admin User	super_admin	User Login	Auth	User logged in	2025-12-22 15:57:26	all	\N
log-1766419051666	u-1	Admin User	super_admin	User Login	Auth	User logged in	2025-12-22 15:57:31	all	\N
log-1766419089207	u-1	Admin User	super_admin	User Login	Auth	User logged in	2025-12-22 15:58:09	all	\N
log-1766419100224	u-1	Admin User	super_admin	User Login	Auth	User logged in	2025-12-22 15:58:20	all	\N
log-1766419125910	u-1	Admin User	super_admin	User Login	Auth	User logged in	2025-12-22 15:58:45	all	\N
log-1766419216908	u-1	Admin User	super_admin	User Login	Auth	User logged in	2025-12-22 16:00:16	all	\N
log-1766419226933	u-1	Admin User	super_admin	User Login	Auth	User logged in	2025-12-22 16:00:26	all	\N
log-1766419230981	u-employee	Demo Employee	employee	User Login	Auth	User logged in	2025-12-22 16:00:30	all	\N
log-1766419233329	u-employee	Demo Employee	employee	User Login	Auth	User logged in	2025-12-22 16:00:33	all	\N
log-1766486977558	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 10:49	2025-12-23 10:49:37	all	\N
log-1766487038271	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 10:50	2025-12-23 10:50:38	all	\N
log-1766487040200	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 10:50	2025-12-23 10:50:40	all	\N
log-1766487040652	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 10:50	2025-12-23 10:50:40	all	\N
log-1766487040852	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 10:50	2025-12-23 10:50:40	all	\N
log-1766487041022	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 10:50	2025-12-23 10:50:41	all	\N
log-1766487041184	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 10:50	2025-12-23 10:50:41	all	\N
log-1766487041340	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 10:50	2025-12-23 10:50:41	all	\N
log-1766487080740	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 10:51	2025-12-23 10:51:20	all	\N
log-1766487104896	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 10:51	2025-12-23 10:51:44	all	\N
log-1766487166097	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 10:52	2025-12-23 10:52:46	all	\N
log-1766487166688	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 10:52	2025-12-23 10:52:46	all	\N
log-1766487166965	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 10:52	2025-12-23 10:52:46	all	\N
log-1766487167142	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 10:52	2025-12-23 10:52:47	all	\N
log-1766487167303	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 10:52	2025-12-23 10:52:47	all	\N
log-1766487167446	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 10:52	2025-12-23 10:52:47	all	\N
log-1766487167609	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 10:52	2025-12-23 10:52:47	all	\N
log-1766487167750	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 10:52	2025-12-23 10:52:47	all	\N
log-1766487167898	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 10:52	2025-12-23 10:52:47	all	\N
log-1766487168159	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 10:52	2025-12-23 10:52:48	all	\N
log-1766493404974	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 12:36	2025-12-23 12:36:44	all	\N
log-1766493405495	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 12:36	2025-12-23 12:36:45	all	\N
log-1766493405693	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 12:36	2025-12-23 12:36:45	all	\N
log-1766493405858	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 12:36	2025-12-23 12:36:45	all	\N
log-1766493405997	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 12:36	2025-12-23 12:36:45	all	\N
log-1766493406286	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 12:36	2025-12-23 12:36:46	all	\N
log-1766493406698	u-1	Admin User	super_admin	Clock In	Attendance	Clocked in at 12:36	2025-12-23 12:36:46	all	\N
\.


--
-- TOC entry 5262 (class 0 OID 18429)
-- Dependencies: 231
-- Data for Name: payroll; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payroll (id, employeeid, employeename, month, basesalary, allowances, deductions, tax, netsalary, status, paiddate, branchid, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5268 (class 0 OID 18523)
-- Dependencies: 237
-- Data for Name: policies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.policies (id, categoryid, title, content, version, effectivedate, createdby, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5267 (class 0 OID 18512)
-- Dependencies: 236
-- Data for Name: policy_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.policy_categories (id, name, description, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5263 (class 0 OID 18450)
-- Dependencies: 232
-- Data for Name: reimbursements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reimbursements (id, employeeid, employeename, amount, category, description, status, submitteddate, approveddate, approvedby, receipt, branchid, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5257 (class 0 OID 18343)
-- Dependencies: 226
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shifts (id, name, starttime, endtime, branchid, description, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5270 (class 0 OID 18555)
-- Dependencies: 239
-- Data for Name: system_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_config (id, companyname, companylogo, companyemail, companyphone, companyaddress, financialyearstart, defaultleaveyear, workingdaysperweek, overtimerate, created_at, updated_at) FROM stdin;
default	ABC Corporation	\N	contact@company.com	+1-800-COMPANY	123 Business St, San Francisco, CA 94105	4	20	5	\N	2025-12-22 15:54:28.653781	2025-12-22 15:54:28.653781
\.


--
-- TOC entry 5261 (class 0 OID 18408)
-- Dependencies: 230
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, title, description, assignedto, assignedtoname, status, priority, duedate, completeddate, branchid, createdby, created_at, updated_at) FROM stdin;
task-1766487463720	A	A	\N	\N	Done	Medium	\N	\N	\N	u-1	2025-12-23 10:57:44.038216	2025-12-23 11:01:29.582326
task-1766487708057	A	A	e-1	John Manager	Todo	Medium	2025-12-23	\N	\N	u-1	2025-12-23 11:01:48.373142	2025-12-23 11:01:48.373142
task-1766487559579	A	A	\N	\N	Done	High	\N	\N	\N	u-1	2025-12-23 10:59:19.897967	2025-12-23 12:36:42.288808
\.


--
-- TOC entry 5266 (class 0 OID 18494)
-- Dependencies: 235
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teams (id, name, description, leaderid, leadername, members, branchid, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5256 (class 0 OID 18324)
-- Dependencies: 225
-- Data for Name: timesheets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.timesheets (id, employeeid, employeename, date, clockin, clockout, duration, status, branchid, created_at, updated_at) FROM stdin;
1766486977482	u-1	Admin User	2025-12-23	2025-12-23 10:49:37.482	\N	0	Working	\N	2025-12-23 10:49:37.551469	2025-12-23 10:49:37.551469
1766487038255	u-1	Admin User	2025-12-23	2025-12-23 10:50:38.255	\N	0	Working	\N	2025-12-23 10:50:38.258708	2025-12-23 10:50:38.258708
1766487040192	u-1	Admin User	2025-12-23	2025-12-23 10:50:40.192	\N	0	Working	\N	2025-12-23 10:50:40.194978	2025-12-23 10:50:40.194978
1766487040640	u-1	Admin User	2025-12-23	2025-12-23 10:50:40.64	\N	0	Working	\N	2025-12-23 10:50:40.643172	2025-12-23 10:50:40.643172
1766487040842	u-1	Admin User	2025-12-23	2025-12-23 10:50:40.842	\N	0	Working	\N	2025-12-23 10:50:40.84491	2025-12-23 10:50:40.84491
1766487041014	u-1	Admin User	2025-12-23	2025-12-23 10:50:41.014	\N	0	Working	\N	2025-12-23 10:50:41.017046	2025-12-23 10:50:41.017046
1766487041175	u-1	Admin User	2025-12-23	2025-12-23 10:50:41.175	\N	0	Working	\N	2025-12-23 10:50:41.177696	2025-12-23 10:50:41.177696
1766487041332	u-1	Admin User	2025-12-23	2025-12-23 10:50:41.332	\N	0	Working	\N	2025-12-23 10:50:41.334556	2025-12-23 10:50:41.334556
1766487080726	u-1	Admin User	2025-12-23	2025-12-23 10:51:20.726	\N	0	Working	\N	2025-12-23 10:51:20.729969	2025-12-23 10:51:20.729969
1766487104880	u-1	Admin User	2025-12-23	2025-12-23 10:51:44.88	\N	0	Working	\N	2025-12-23 10:51:44.88391	2025-12-23 10:51:44.88391
1766487166087	u-1	Admin User	2025-12-23	2025-12-23 10:52:46.087	\N	0	Working	\N	2025-12-23 10:52:46.089718	2025-12-23 10:52:46.089718
1766487166680	u-1	Admin User	2025-12-23	2025-12-23 10:52:46.68	\N	0	Working	\N	2025-12-23 10:52:46.683106	2025-12-23 10:52:46.683106
1766487166952	u-1	Admin User	2025-12-23	2025-12-23 10:52:46.952	\N	0	Working	\N	2025-12-23 10:52:46.956276	2025-12-23 10:52:46.956276
1766487167135	u-1	Admin User	2025-12-23	2025-12-23 10:52:47.135	\N	0	Working	\N	2025-12-23 10:52:47.137458	2025-12-23 10:52:47.137458
1766487167296	u-1	Admin User	2025-12-23	2025-12-23 10:52:47.296	\N	0	Working	\N	2025-12-23 10:52:47.298414	2025-12-23 10:52:47.298414
1766487167438	u-1	Admin User	2025-12-23	2025-12-23 10:52:47.438	\N	0	Working	\N	2025-12-23 10:52:47.440995	2025-12-23 10:52:47.440995
1766487167598	u-1	Admin User	2025-12-23	2025-12-23 10:52:47.598	\N	0	Working	\N	2025-12-23 10:52:47.60026	2025-12-23 10:52:47.60026
1766487167744	u-1	Admin User	2025-12-23	2025-12-23 10:52:47.744	\N	0	Working	\N	2025-12-23 10:52:47.746694	2025-12-23 10:52:47.746694
1766487167890	u-1	Admin User	2025-12-23	2025-12-23 10:52:47.89	\N	0	Working	\N	2025-12-23 10:52:47.892575	2025-12-23 10:52:47.892575
1766487168149	u-1	Admin User	2025-12-23	2025-12-23 10:52:48.149	\N	0	Working	\N	2025-12-23 10:52:48.153874	2025-12-23 10:52:48.153874
1766493404949	u-1	Admin User	2025-12-23	2025-12-23 12:36:44.949	\N	0	Working	\N	2025-12-23 12:36:44.953295	2025-12-23 12:36:44.953295
1766493405488	u-1	Admin User	2025-12-23	2025-12-23 12:36:45.488	\N	0	Working	\N	2025-12-23 12:36:45.491183	2025-12-23 12:36:45.491183
1766493405681	u-1	Admin User	2025-12-23	2025-12-23 12:36:45.681	\N	0	Working	\N	2025-12-23 12:36:45.683194	2025-12-23 12:36:45.683194
1766493405846	u-1	Admin User	2025-12-23	2025-12-23 12:36:45.846	\N	0	Working	\N	2025-12-23 12:36:45.848666	2025-12-23 12:36:45.848666
1766493405989	u-1	Admin User	2025-12-23	2025-12-23 12:36:45.989	\N	0	Working	\N	2025-12-23 12:36:45.991077	2025-12-23 12:36:45.991077
1766493406277	u-1	Admin User	2025-12-23	2025-12-23 12:36:46.277	\N	0	Working	\N	2025-12-23 12:36:46.280321	2025-12-23 12:36:46.280321
1766493406690	u-1	Admin User	2025-12-23	2025-12-23 12:36:46.69	\N	0	Working	\N	2025-12-23 12:36:46.692775	2025-12-23 12:36:46.692775
\.


--
-- TOC entry 5250 (class 0 OID 18225)
-- Dependencies: 219
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, role, avatar, designation, status, branchids, linkedemployeeid, accessmodules, created_at, updated_at, password, password_hash) FROM stdin;
u-3	Employee One	emp1@company.com	employee		Software Engineer	Active	{b-1}	e-2	{dashboard,attendance,payroll,tasks,files,teams}	2025-12-22 15:54:28.642673	2025-12-22 15:54:28.642673	\N	\N
u-2	John Manager	manager@company.com	manager		Branch Manager	Active	{b-1}	e-1	{dashboard,employees,attendance,payroll,tasks}	2025-12-22 15:54:28.642673	2025-12-22 15:55:16.649916	$2a$10$HfHyA9/5bQ8vmA3z.Dtw3elTa/InEY5EIKdGucL57ZZhYIZw8An7y	\N
1766419727988	Dinesh	dineshkodali16@gmail.com	employee	https://ui-avatars.com/api/?name=Dinesh&background=random		Active	{}	\N	{dashboard}	2025-12-22 16:08:48.03588	2025-12-22 16:08:48.03588	\N	\N
u-1	Admin User	admin@company.com	admin		System Admin	Active	{b-1}	\N	{dashboard,employees,recruitment,payroll,settings,logs}	2025-12-22 15:54:28.642673	2025-12-29 09:56:52.542135	$2a$10$uYgVWse9bVw6Cm728iW.QOm7FLkbBjAVFDHjd.RqE9c9Qc1jMGWLG	$2a$10$J75uzTxDqQgdPBE8YNXDDe4RsepG7kiN2SB8h/MGluOLx17voIR1e
u-employee	Employee User	employee@company.com	employee		Staff	Active	{b-1}	\N	{dashboard}	2025-12-29 09:56:52.654663	2025-12-29 09:56:52.654663	\N	$2a$10$PzAMEg7P56ag1bXepwZrKOdhYcUXBoea9s.wj.T5X2236XZdEON/i
\.


--
-- TOC entry 5021 (class 2606 OID 18299)
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- TOC entry 5026 (class 2606 OID 18315)
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- TOC entry 5016 (class 2606 OID 18274)
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- TOC entry 5048 (class 2606 OID 18400)
-- Name: candidates candidates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_pkey PRIMARY KEY (id);


--
-- TOC entry 5018 (class 2606 OID 18286)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- TOC entry 5009 (class 2606 OID 18259)
-- Name: employees employees_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_email_key UNIQUE (email);


--
-- TOC entry 5011 (class 2606 OID 18257)
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- TOC entry 5072 (class 2606 OID 18492)
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- TOC entry 5084 (class 2606 OID 18552)
-- Name: holidays holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_pkey PRIMARY KEY (id);


--
-- TOC entry 5046 (class 2606 OID 18386)
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 5042 (class 2606 OID 18366)
-- Name: leaves leaves_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_pkey PRIMARY KEY (id);


--
-- TOC entry 5070 (class 2606 OID 18478)
-- Name: logs logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5060 (class 2606 OID 18441)
-- Name: payroll payroll_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT payroll_pkey PRIMARY KEY (id);


--
-- TOC entry 5082 (class 2606 OID 18534)
-- Name: policies policies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policies
    ADD CONSTRAINT policies_pkey PRIMARY KEY (id);


--
-- TOC entry 5079 (class 2606 OID 18522)
-- Name: policy_categories policy_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policy_categories
    ADD CONSTRAINT policy_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5065 (class 2606 OID 18461)
-- Name: reimbursements reimbursements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reimbursements
    ADD CONSTRAINT reimbursements_pkey PRIMARY KEY (id);


--
-- TOC entry 5037 (class 2606 OID 18353)
-- Name: shifts shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_pkey PRIMARY KEY (id);


--
-- TOC entry 5088 (class 2606 OID 18567)
-- Name: system_config system_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (id);


--
-- TOC entry 5055 (class 2606 OID 18420)
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 5077 (class 2606 OID 18504)
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- TOC entry 5034 (class 2606 OID 18334)
-- Name: timesheets timesheets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timesheets
    ADD CONSTRAINT timesheets_pkey PRIMARY KEY (id);


--
-- TOC entry 5005 (class 2606 OID 18242)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5007 (class 2606 OID 18240)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5022 (class 1259 OID 18300)
-- Name: idx_assets_assignedto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_assignedto ON public.assets USING btree (assignedto);


--
-- TOC entry 5023 (class 1259 OID 18301)
-- Name: idx_assets_branchid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_branchid ON public.assets USING btree (branchid);


--
-- TOC entry 5024 (class 1259 OID 18302)
-- Name: idx_assets_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_status ON public.assets USING btree (status);


--
-- TOC entry 5027 (class 1259 OID 18323)
-- Name: idx_attendance_branchid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_attendance_branchid ON public.attendance USING btree (branchid);


--
-- TOC entry 5028 (class 1259 OID 18322)
-- Name: idx_attendance_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_attendance_date ON public.attendance USING btree (date);


--
-- TOC entry 5029 (class 1259 OID 18321)
-- Name: idx_attendance_employeeid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_attendance_employeeid ON public.attendance USING btree (employeeid);


--
-- TOC entry 5049 (class 1259 OID 18406)
-- Name: idx_candidates_jobid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_candidates_jobid ON public.candidates USING btree (jobid);


--
-- TOC entry 5050 (class 1259 OID 18407)
-- Name: idx_candidates_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_candidates_status ON public.candidates USING btree (status);


--
-- TOC entry 5019 (class 1259 OID 18287)
-- Name: idx_departments_branchid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_departments_branchid ON public.departments USING btree (branchid);


--
-- TOC entry 5012 (class 1259 OID 18261)
-- Name: idx_employees_branchid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employees_branchid ON public.employees USING btree (branchid);


--
-- TOC entry 5013 (class 1259 OID 18260)
-- Name: idx_employees_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employees_email ON public.employees USING btree (email);


--
-- TOC entry 5014 (class 1259 OID 18262)
-- Name: idx_employees_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employees_status ON public.employees USING btree (status);


--
-- TOC entry 5073 (class 1259 OID 18493)
-- Name: idx_groups_branchid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_groups_branchid ON public.groups USING btree (branchid);


--
-- TOC entry 5085 (class 1259 OID 18554)
-- Name: idx_holidays_branchid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_holidays_branchid ON public.holidays USING btree (branchid);


--
-- TOC entry 5086 (class 1259 OID 18553)
-- Name: idx_holidays_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_holidays_date ON public.holidays USING btree (date);


--
-- TOC entry 5043 (class 1259 OID 18388)
-- Name: idx_jobs_branchid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_branchid ON public.jobs USING btree (branchid);


--
-- TOC entry 5044 (class 1259 OID 18387)
-- Name: idx_jobs_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jobs_status ON public.jobs USING btree (status);


--
-- TOC entry 5038 (class 1259 OID 18374)
-- Name: idx_leaves_branchid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leaves_branchid ON public.leaves USING btree (branchid);


--
-- TOC entry 5039 (class 1259 OID 18372)
-- Name: idx_leaves_employeeid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leaves_employeeid ON public.leaves USING btree (employeeid);


--
-- TOC entry 5040 (class 1259 OID 18373)
-- Name: idx_leaves_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leaves_status ON public.leaves USING btree (status);


--
-- TOC entry 5066 (class 1259 OID 18481)
-- Name: idx_logs_module; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_module ON public.logs USING btree (module);


--
-- TOC entry 5067 (class 1259 OID 18480)
-- Name: idx_logs_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_timestamp ON public.logs USING btree ("timestamp");


--
-- TOC entry 5068 (class 1259 OID 18479)
-- Name: idx_logs_userid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_userid ON public.logs USING btree (userid);


--
-- TOC entry 5056 (class 1259 OID 18449)
-- Name: idx_payroll_branchid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payroll_branchid ON public.payroll USING btree (branchid);


--
-- TOC entry 5057 (class 1259 OID 18447)
-- Name: idx_payroll_employeeid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payroll_employeeid ON public.payroll USING btree (employeeid);


--
-- TOC entry 5058 (class 1259 OID 18448)
-- Name: idx_payroll_month; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payroll_month ON public.payroll USING btree (month);


--
-- TOC entry 5080 (class 1259 OID 18540)
-- Name: idx_policies_categoryid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_policies_categoryid ON public.policies USING btree (categoryid);


--
-- TOC entry 5061 (class 1259 OID 18469)
-- Name: idx_reimbursements_branchid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reimbursements_branchid ON public.reimbursements USING btree (branchid);


--
-- TOC entry 5062 (class 1259 OID 18467)
-- Name: idx_reimbursements_employeeid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reimbursements_employeeid ON public.reimbursements USING btree (employeeid);


--
-- TOC entry 5063 (class 1259 OID 18468)
-- Name: idx_reimbursements_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reimbursements_status ON public.reimbursements USING btree (status);


--
-- TOC entry 5035 (class 1259 OID 18354)
-- Name: idx_shifts_branchid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shifts_branchid ON public.shifts USING btree (branchid);


--
-- TOC entry 5051 (class 1259 OID 18426)
-- Name: idx_tasks_assignedto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_assignedto ON public.tasks USING btree (assignedto);


--
-- TOC entry 5052 (class 1259 OID 18428)
-- Name: idx_tasks_branchid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_branchid ON public.tasks USING btree (branchid);


--
-- TOC entry 5053 (class 1259 OID 18427)
-- Name: idx_tasks_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tasks_status ON public.tasks USING btree (status);


--
-- TOC entry 5074 (class 1259 OID 18511)
-- Name: idx_teams_branchid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_teams_branchid ON public.teams USING btree (branchid);


--
-- TOC entry 5075 (class 1259 OID 18510)
-- Name: idx_teams_leaderid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_teams_leaderid ON public.teams USING btree (leaderid);


--
-- TOC entry 5030 (class 1259 OID 18342)
-- Name: idx_timesheets_branchid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_timesheets_branchid ON public.timesheets USING btree (branchid);


--
-- TOC entry 5031 (class 1259 OID 18341)
-- Name: idx_timesheets_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_timesheets_date ON public.timesheets USING btree (date);


--
-- TOC entry 5032 (class 1259 OID 18340)
-- Name: idx_timesheets_employeeid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_timesheets_employeeid ON public.timesheets USING btree (employeeid);


--
-- TOC entry 5002 (class 1259 OID 18243)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 5003 (class 1259 OID 18244)
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- TOC entry 5099 (class 2620 OID 18571)
-- Name: employees employees_update_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER employees_update_timestamp BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_employee_timestamp();


--
-- TOC entry 5101 (class 2620 OID 18574)
-- Name: leaves leaves_update_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER leaves_update_timestamp BEFORE UPDATE ON public.leaves FOR EACH ROW EXECUTE FUNCTION public.update_employee_timestamp();


--
-- TOC entry 5102 (class 2620 OID 18575)
-- Name: payroll payroll_update_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER payroll_update_timestamp BEFORE UPDATE ON public.payroll FOR EACH ROW EXECUTE FUNCTION public.update_employee_timestamp();


--
-- TOC entry 5100 (class 2620 OID 18573)
-- Name: timesheets timesheets_update_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER timesheets_update_timestamp BEFORE UPDATE ON public.timesheets FOR EACH ROW EXECUTE FUNCTION public.update_employee_timestamp();


--
-- TOC entry 5098 (class 2620 OID 18572)
-- Name: users users_update_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER users_update_timestamp BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_employee_timestamp();


--
-- TOC entry 5089 (class 2606 OID 18316)
-- Name: attendance attendance_employeeid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_employeeid_fkey FOREIGN KEY (employeeid) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- TOC entry 5092 (class 2606 OID 18401)
-- Name: candidates candidates_jobid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidates
    ADD CONSTRAINT candidates_jobid_fkey FOREIGN KEY (jobid) REFERENCES public.jobs(id) ON DELETE CASCADE;


--
-- TOC entry 5091 (class 2606 OID 18367)
-- Name: leaves leaves_employeeid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_employeeid_fkey FOREIGN KEY (employeeid) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- TOC entry 5094 (class 2606 OID 18442)
-- Name: payroll payroll_employeeid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payroll
    ADD CONSTRAINT payroll_employeeid_fkey FOREIGN KEY (employeeid) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- TOC entry 5097 (class 2606 OID 18535)
-- Name: policies policies_categoryid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policies
    ADD CONSTRAINT policies_categoryid_fkey FOREIGN KEY (categoryid) REFERENCES public.policy_categories(id) ON DELETE CASCADE;


--
-- TOC entry 5095 (class 2606 OID 18462)
-- Name: reimbursements reimbursements_employeeid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reimbursements
    ADD CONSTRAINT reimbursements_employeeid_fkey FOREIGN KEY (employeeid) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- TOC entry 5093 (class 2606 OID 18421)
-- Name: tasks tasks_assignedto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assignedto_fkey FOREIGN KEY (assignedto) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- TOC entry 5096 (class 2606 OID 18505)
-- Name: teams teams_leaderid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_leaderid_fkey FOREIGN KEY (leaderid) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- TOC entry 5090 (class 2606 OID 18335)
-- Name: timesheets timesheets_employeeid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timesheets
    ADD CONSTRAINT timesheets_employeeid_fkey FOREIGN KEY (employeeid) REFERENCES public.employees(id) ON DELETE CASCADE;


-- Completed on 2025-12-29 11:21:57

--
-- PostgreSQL database dump complete
--

\unrestrict nZJCsdhS4dIj8aN3h8TWYSVS23QbdN1wVBCSpQmdTRSIjfd2X5lAvy4z1BAIJEB

