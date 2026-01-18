--
-- adminQL database dump
--

\restrict OReMXgVCMNSfx0CFyrCeSqIeJndU7pS9OK9wZZkfZdiaMaOfyzlOv1BtTSptxTf

-- Dumped from database version 17.7
-- Dumped by pg_dump version 17.7

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attendance; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.attendance (
    id bigint NOT NULL,
    tenant_id bigint,
    employee_id bigint,
    date date NOT NULL,
    check_in_time timestamp without time zone,
    check_out_time timestamp without time zone,
    status character varying(50),
    work_hours numeric(4,2),
    location character varying(255),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.attendance OWNER TO admin;

--
-- Name: attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

ALTER TABLE public.attendance ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.attendance_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    tenant_id bigint,
    user_id bigint,
    employee_id bigint,
    action character varying(100) NOT NULL,
    entity_type character varying(100),
    entity_id bigint,
    changes jsonb,
    ip_address character varying(50),
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO admin;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

ALTER TABLE public.audit_logs ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: branches; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.branches (
    id bigint NOT NULL,
    tenant_id bigint,
    name character varying(255) NOT NULL,
    code character varying(50) NOT NULL,
    address text,
    city character varying(100),
    state character varying(100),
    country character varying(100),
    phone character varying(50),
    email character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.branches OWNER TO admin;

--
-- Name: branches_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

ALTER TABLE public.branches ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.branches_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: complaints; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.complaints (
    id bigint NOT NULL,
    tenant_id bigint,
    complaint_number character varying(50) NOT NULL,
    employee_id bigint,
    category character varying(100) NOT NULL,
    subject character varying(255) NOT NULL,
    description text NOT NULL,
    priority character varying(50) DEFAULT 'Medium'::character varying,
    status character varying(50) DEFAULT 'Open'::character varying,
    assigned_to bigint,
    resolved_at timestamp without time zone,
    resolution_notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    requires_approval boolean DEFAULT true
);


ALTER TABLE public.complaints OWNER TO admin;

--
-- Name: complaints_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

ALTER TABLE public.complaints ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.complaints_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: employee_roles; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.employee_roles (
    id bigint NOT NULL,
    employee_id bigint,
    role_id bigint,
    assigned_by bigint,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.employee_roles OWNER TO admin;

--
-- Name: employee_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

ALTER TABLE public.employee_roles ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.employee_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: employee_skill_tests; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.employee_skill_tests (
    id bigint NOT NULL,
    tenant_id bigint,
    employee_id bigint,
    skill_test_id bigint,
    score integer NOT NULL,
    max_score integer NOT NULL,
    percentage numeric(5,2) GENERATED ALWAYS AS ((((score)::numeric / (max_score)::numeric) * (100)::numeric)) STORED,
    status character varying(50),
    attempted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    duration_minutes integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.employee_skill_tests OWNER TO admin;

--
-- Name: employee_skill_tests_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

ALTER TABLE public.employee_skill_tests ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.employee_skill_tests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: employees; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.employees (
    id bigint NOT NULL,
    tenant_id bigint,
    user_id bigint,
    employee_id character varying(50) NOT NULL,
    full_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50),
    gender character varying(50),
    date_of_birth date,
    photo_url text,
    department character varying(100) NOT NULL,
    branch_id bigint,
    job_role character varying(100),
    status character varying(50) DEFAULT 'Active'::character varying,
    join_date date NOT NULL,
    salary numeric(12,2),
    address text,
    emergency_contact character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.employees OWNER TO admin;

--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

ALTER TABLE public.employees ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.employees_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: leave_balances; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.leave_balances (
    id bigint NOT NULL,
    tenant_id bigint,
    employee_id bigint,
    leave_type_id bigint,
    year integer NOT NULL,
    total_allocated numeric(4,1) NOT NULL,
    used numeric(4,1) DEFAULT 0,
    pending numeric(4,1) DEFAULT 0,
    available numeric(4,1) GENERATED ALWAYS AS (((total_allocated - used) - pending)) STORED,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.leave_balances OWNER TO admin;

--
-- Name: leave_balances_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

ALTER TABLE public.leave_balances ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.leave_balances_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: leave_requests; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.leave_requests (
    id bigint NOT NULL,
    tenant_id bigint,
    employee_id bigint,
    leave_type_id bigint,
    start_date date NOT NULL,
    end_date date NOT NULL,
    total_days numeric(3,1) NOT NULL,
    is_half_day boolean DEFAULT false,
    half_day_period character varying(20),
    reason text NOT NULL,
    status character varying(50) DEFAULT 'Pending'::character varying,
    applied_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reviewed_by bigint,
    reviewed_at timestamp without time zone,
    review_remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.leave_requests OWNER TO admin;

--
-- Name: leave_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

ALTER TABLE public.leave_requests ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.leave_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: leave_types; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.leave_types (
    id bigint NOT NULL,
    tenant_id bigint,
    name character varying(100) NOT NULL,
    description text,
    max_days_per_year integer,
    requires_approval boolean DEFAULT true,
    is_paid boolean DEFAULT true,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.leave_types OWNER TO admin;

--
-- Name: leave_types_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

ALTER TABLE public.leave_types ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.leave_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    tenant_id bigint,
    employee_id bigint,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    type character varying(50),
    category character varying(50),
    reference_id bigint,
    reference_type character varying(50),
    is_read boolean DEFAULT false,
    read_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO admin;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

ALTER TABLE public.notifications ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: payslips; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.payslips (
    id bigint NOT NULL,
    tenant_id bigint,
    employee_id bigint,
    month integer NOT NULL,
    year integer NOT NULL,
    basic_salary numeric(12,2) NOT NULL,
    allowances jsonb,
    deductions jsonb,
    gross_salary numeric(12,2) NOT NULL,
    net_salary numeric(12,2) NOT NULL,
    working_days integer,
    present_days integer,
    leave_days numeric(3,1),
    status character varying(50) DEFAULT 'Generated'::character varying,
    generated_by bigint,
    generated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    sent_at timestamp without time zone,
    acknowledged_at timestamp without time zone,
    pdf_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.payslips OWNER TO admin;

--
-- Name: payslips_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

ALTER TABLE public.payslips ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.payslips_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.permissions (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    display_name character varying(100) NOT NULL,
    description text,
    category character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.permissions OWNER TO admin;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

ALTER TABLE public.permissions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.role_permissions (
    id bigint NOT NULL,
    role_id bigint,
    permission_id bigint,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.role_permissions OWNER TO admin;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

ALTER TABLE public.role_permissions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.role_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    tenant_id bigint,
    name character varying(100) NOT NULL,
    description text,
    is_system boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.roles OWNER TO admin;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

ALTER TABLE public.roles ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.settings (
    id bigint NOT NULL,
    tenant_id bigint NOT NULL,
    key character varying(150) NOT NULL,
    value character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.settings OWNER TO admin;

--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

ALTER TABLE public.settings ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: skill_tests; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.skill_tests (
    id bigint NOT NULL,
    tenant_id bigint,
    title character varying(255) NOT NULL,
    skill_id bigint,
    description text,
    total_questions integer,
    passing_score integer,
    duration_minutes integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.skill_tests OWNER TO admin;

--
-- Name: skill_tests_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

ALTER TABLE public.skill_tests ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.skill_tests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: skills; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.skills (
    id bigint NOT NULL,
    tenant_id bigint,
    name character varying(100) NOT NULL,
    category character varying(100),
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.skills OWNER TO admin;

--
-- Name: skills_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

ALTER TABLE public.skills ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.skills_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tech_issues; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.tech_issues (
    id bigint NOT NULL,
    tenant_id bigint,
    issue_number character varying(50) NOT NULL,
    employee_id bigint,
    category character varying(100) NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    priority character varying(50) DEFAULT 'Medium'::character varying,
    status character varying(50) DEFAULT 'Pending'::character varying,
    requires_approval boolean DEFAULT true,
    approved_by bigint,
    approved_at timestamp without time zone,
    assigned_to bigint,
    resolved_at timestamp without time zone,
    resolution_notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tech_issues OWNER TO admin;

--
-- Name: tech_issues_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

ALTER TABLE public.tech_issues ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tech_issues_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.tenants (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(100) NOT NULL,
    domain character varying(255),
    subdomain character varying(100),
    logo_url text,
    contact_email character varying(255) NOT NULL,
    contact_phone character varying(50),
    address text,
    city character varying(100),
    state character varying(100),
    country character varying(100),
    timezone character varying(100) DEFAULT 'UTC'::character varying,
    currency character varying(10) DEFAULT 'USD'::character varying,
    settings jsonb DEFAULT '{}'::jsonb,
    subscription_plan character varying(50) DEFAULT 'basic'::character varying,
    subscription_status character varying(50) DEFAULT 'trial'::character varying,
    subscription_expires_at timestamp without time zone,
    max_employees integer DEFAULT 50,
    max_branches integer DEFAULT 5,
    is_active boolean DEFAULT true,
    onboarded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tenants OWNER TO admin;

--
-- Name: tenants_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

ALTER TABLE public.tenants ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tenants_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    tenant_id bigint,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    is_active boolean DEFAULT true,
    last_login timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO admin;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: work_logs; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.work_logs (
    id bigint NOT NULL,
    tenant_id bigint,
    employee_id bigint,
    date date NOT NULL,
    task_name character varying(255) NOT NULL,
    description text,
    hours numeric(4,2) NOT NULL,
    category character varying(100),
    status character varying(50) DEFAULT 'Completed'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.work_logs OWNER TO admin;

--
-- Name: work_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

ALTER TABLE public.work_logs ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.work_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.attendance (id, tenant_id, employee_id, date, check_in_time, check_out_time, status, work_hours, location, notes, created_at, updated_at) FROM stdin;
16	1	3	2026-01-10	2026-01-10 19:53:38.144373	2026-01-10 19:53:43.007797	Present	-5.50	\N	\N	2026-01-10 19:53:38.144373	2026-01-10 19:53:43.007797
17	1	1	2026-01-11	2026-01-11 07:00:43.179561	2026-01-11 07:09:23.718674	Present	-5.36	\N	\N	2026-01-11 07:00:43.179561	2026-01-11 07:09:23.718674
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.audit_logs (id, tenant_id, user_id, employee_id, action, entity_type, entity_id, changes, ip_address, user_agent, created_at) FROM stdin;
1	1	2	2	CREATE	leave_request	\N	\N	\N	\N	2025-12-30 14:49:27.73284
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.branches (id, tenant_id, name, code, address, city, state, country, phone, email, is_active, created_at, updated_at) FROM stdin;
1	1	Head Office	HO	\N	New York	\N	USA	\N	\N	t	2025-12-30 14:38:56.229423	2025-12-30 14:38:56.229423
2	1	West Branch	WB	\N	San Francisco	\N	USA	\N	\N	t	2025-12-30 14:38:56.229423	2025-12-30 14:38:56.229423
\.


--
-- Data for Name: complaints; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.complaints (id, tenant_id, complaint_number, employee_id, category, subject, description, priority, status, assigned_to, resolved_at, resolution_notes, created_at, updated_at, requires_approval) FROM stdin;
2	1	CMP-002	1	hr	hello	akjsfn	low	Open	\N	\N	\N	2025-12-31 11:17:19.716171	2025-12-31 11:17:19.716193	t
3	1	CMP-003	2	management	hfsbi	dwfjbwc	high	Resolved	1	2026-01-10 17:44:47.028883	approved\n	2025-12-31 12:01:44.38601	2026-01-10 17:44:47.028958	t
1	1	CMP-ACME-001	2	Workplace	AC not working	Air conditioning issue in office	Medium	Approval Pending	1	\N	close	2025-12-30 14:49:51.920801	2026-01-10 17:45:02.219228	t
\.


--
-- Data for Name: employee_roles; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.employee_roles (id, employee_id, role_id, assigned_by, assigned_at) FROM stdin;
1	1	1	1	2025-12-30 14:38:56.232545
2	3	2	1	2025-12-30 14:38:56.232545
3	2	3	1	2025-12-30 14:38:56.232545
\.


--
-- Data for Name: employee_skill_tests; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.employee_skill_tests (id, tenant_id, employee_id, skill_test_id, score, max_score, status, attempted_at, duration_minutes, created_at) FROM stdin;
2	1	2	1	75	100	Passed	2025-12-30 14:49:51.920801	\N	2025-12-30 14:49:51.920801
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.employees (id, tenant_id, user_id, employee_id, full_name, email, phone, gender, date_of_birth, photo_url, department, branch_id, job_role, status, join_date, salary, address, emergency_contact, created_at, updated_at) FROM stdin;
1	1	1	EMP-ACME-001	Admin User	admin@acme.com	\N	\N	\N	\N	Management	1	Admin	Active	2023-01-01	120000.00	\N	\N	2025-12-30 14:38:56.229962	2025-12-30 14:38:56.229962
2	1	2	EMP-ACME-002	John Doe	john@acme.com	\N	\N	\N	\N	Engineering	1	Software Engineer	Active	2023-03-01	90000.00	\N	\N	2025-12-30 14:38:56.229962	2025-12-30 14:38:56.229962
3	1	3	EMP-ACME-003	HR Manager	hr@acme.com	\N	\N	\N	\N	HR	2	CEO	Active	2023-02-01	80000.00	\N	\N	2025-12-30 14:38:56.229962	2025-12-30 14:38:56.229962
\.


--
-- Data for Name: leave_balances; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.leave_balances (id, tenant_id, employee_id, leave_type_id, year, total_allocated, used, pending, created_at, updated_at) FROM stdin;
2	1	1	2	2026	12.0	0.0	0.0	2025-12-30 14:38:56.233692	2025-12-30 14:38:56.233692
4	1	2	1	2026	10.0	0.0	0.0	2025-12-30 14:38:56.233692	2025-12-30 14:38:56.233692
7	1	3	1	2026	10.0	0.0	0.0	2025-12-30 14:38:56.233692	2025-12-30 14:38:56.233692
8	1	3	2	2026	12.0	0.0	0.0	2025-12-30 14:38:56.233692	2025-12-30 14:38:56.233692
9	1	3	3	2026	15.0	0.0	0.0	2025-12-30 14:38:56.233692	2025-12-30 14:38:56.233692
1	1	1	1	2026	10.0	0.0	0.0	2025-12-30 14:38:56.233692	2025-12-30 14:38:56.233692
5	1	2	2	2026	12.0	0.0	0.0	2025-12-30 14:38:56.233692	2026-01-10 18:45:31.021404
6	1	2	3	2026	15.0	1.0	0.0	2025-12-30 14:38:56.233692	2026-01-10 18:46:10.901939
3	1	1	3	2026	15.0	2.0	-1.0	2025-12-30 14:38:56.233692	2026-01-11 12:48:37.78864
\.


--
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.leave_requests (id, tenant_id, employee_id, leave_type_id, start_date, end_date, total_days, is_half_day, half_day_period, reason, status, applied_at, reviewed_by, reviewed_at, review_remarks, created_at, updated_at) FROM stdin;
10	1	2	2	2026-01-10	2026-01-10	1.0	f	\N	leave	Rejected	2026-01-10 18:45:19.588135	1	2026-01-10 18:45:31.014121	rejected	2026-01-10 18:45:19.588133	2026-01-10 18:45:31.01436
11	1	2	3	2026-01-13	2026-01-13	1.0	f	\N	leave\n	Approved	2026-01-10 18:45:55.738583	1	2026-01-10 18:46:10.901886	approved	2026-01-10 18:45:55.738581	2026-01-10 18:46:10.901888
9	1	1	3	2026-01-10	2026-01-10	1.0	f	\N	leave	Approved	2026-01-10 18:44:28.693926	3	2026-01-11 12:48:37.788423	Approved	2026-01-10 18:44:28.693669	2026-01-11 12:48:37.788543
\.


--
-- Data for Name: leave_types; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.leave_types (id, tenant_id, name, description, max_days_per_year, requires_approval, is_paid, is_active, created_at) FROM stdin;
1	1	Sick Leave	\N	10	t	t	t	2025-12-30 14:38:56.233168
2	1	Casual Leave	\N	12	t	t	t	2025-12-30 14:38:56.233168
3	1	Annual Leave	\N	15	t	t	t	2025-12-30 14:38:56.233168
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.notifications (id, tenant_id, employee_id, title, message, type, category, reference_id, reference_type, is_read, read_at, created_at) FROM stdin;
1	1	2	Leave Submitted	Your leave request has been submitted	info	\N	\N	\N	f	\N	2025-12-30 14:49:27.73284
\.


--
-- Data for Name: payslips; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.payslips (id, tenant_id, employee_id, month, year, basic_salary, allowances, deductions, gross_salary, net_salary, working_days, present_days, leave_days, status, generated_by, generated_at, sent_at, acknowledged_at, pdf_url, created_at) FROM stdin;
1	1	2	1	2025	90000.00	\N	\N	95000.00	88000.00	\N	\N	\N	Generated	\N	2025-12-30 14:49:27.73284	\N	\N	\N	2025-12-30 14:49:27.73284
2	1	1	1	2026	120000.00	{"hra": 0, "otherEarnings": 0, "medicalAllowance": 0, "specialAllowance": 0, "transportAllowance": 0}	{"incomeTax": 0, "providentFund": 0, "otherDeductions": 0, "professionalTax": 0}	120000.00	120000.00	0	0	\N	Generated	3	2026-01-11 13:08:08.937146	\N	\N	\N	2026-01-11 13:08:08.934806
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.permissions (id, name, display_name, description, category, created_at) FROM stdin;
1	dashboard.view	View Dashboard	Access main dashboard	core	2025-12-30 17:00:31.890525
2	employee.view	View Employee Profile	View own employee details	core	2025-12-30 17:00:31.890525
3	leave.request	Request Leave	Submit leave request	core	2025-12-30 17:00:31.890525
4	skill.manage	Manage Skills	Add or update skills	core	2025-12-30 17:00:31.890525
5	complaint.create	Raise Complaint	Register a complaint	support	2025-12-30 17:00:31.890525
6	techissue.create	Raise Tech Issue	Register technical issues	support	2025-12-30 17:00:31.890525
7	admin.dashboard.view	View Admin Dashboard	Access admin dashboard	admin	2025-12-30 17:00:31.890525
8	employee.manage	Manage Employees	Create, update, deactivate employees	management	2025-12-30 17:00:31.890525
9	role.manage	Manage Roles & Permissions	Assign permissions to roles	admin	2025-12-30 17:00:31.890525
10	leave.approve	Approve Leave	Approve or reject leave requests	management	2025-12-30 17:00:31.890525
11	attendance.manage	Manage Attendance	Edit and manage attendance records	management	2025-12-30 17:00:31.890525
12	payslip.generate	Generate Payslips	Generate and publish payslips	payroll	2025-12-30 17:00:31.890525
13	skill.report.view	View Skill Reports	View skill assessment reports	reports	2025-12-30 17:00:31.890525
14	complaint.manage	Manage Complaints	View and resolve complaints	support	2025-12-30 17:00:31.890525
15	techissue.manage	Manage Tech Issues	Approve and resolve tech issues	support	2025-12-30 17:00:31.890525
16	report.download	Download Reports	Download system reports	reports	2025-12-30 17:00:31.890525
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.role_permissions (id, role_id, permission_id, created_at) FROM stdin;
21	1	1	"2026-01-11 13:32:24.073203"
22	1	2	"2026-01-11 13:32:24.073203"
23	1	3	"2026-01-11 13:32:24.073203"
24	1	4	"2026-01-11 13:32:24.073203"
25	1	5	"2026-01-11 13:32:24.073203"
26	1	6	"2026-01-11 13:32:24.073203"
2	1	7	"2026-01-10 09:14:37.105161"
1	1	8	"2026-01-10 09:14:37.105161"
3	1	9	"2026-01-10 09:14:37.105161"
4	1	10	"2026-01-10 09:14:37.105161"
5	1	11	"2026-01-10 09:14:37.105161"
6	1	12	"2026-01-10 09:14:37.105161"
7	1	13	"2026-01-10 09:14:37.105161"
8	1	14	"2026-01-10 09:14:37.105161"
9	1	15	"2026-01-10 09:14:37.105161"
10	1	16	"2026-01-10 09:14:37.105161"
27	2	1	"2026-01-11 13:32:24.073203"
28	2	2	"2026-01-11 13:32:24.073203"
29	2	3	"2026-01-11 13:32:24.073203"
30	2	4	"2026-01-11 13:32:24.073203"
31	2	5	"2026-01-11 13:32:24.073203"
32	2	6	"2026-01-11 13:32:24.073203"
12	2	7	"2026-01-11 10:43:19.3406"
11	2	8	"2026-01-11 10:43:19.3406"
13	2	9	"2026-01-11 10:43:19.3406"
14	2	10	"2026-01-11 10:43:19.3406"
15	2	11	"2026-01-11 10:43:19.3406"
16	2	12	"2026-01-11 10:43:19.3406"
17	2	13	"2026-01-11 10:43:19.3406"
18	2	14	"2026-01-11 10:43:19.3406"
19	2	15	"2026-01-11 10:43:19.3406"
20	2	16	"2026-01-11 10:43:19.3406"
33	3	1	"2026-01-11 13:32:24.073203"
34	3	2	"2026-01-11 13:32:24.073203"
35	3	3	"2026-01-11 13:32:24.073203"
36	3	4	"2026-01-11 13:32:24.073203"
37	3	5	"2026-01-11 13:32:24.073203"
38	3	6	"2026-01-11 13:32:24.073203"
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.roles (id, tenant_id, name, description, is_system, created_at, updated_at) FROM stdin;
1	1	Admin	System Administrator	t	2025-12-30 14:38:56.230947	2025-12-30 14:38:56.230947
3	1	Employee	Regular Employee	t	2025-12-30 14:38:56.230947	2025-12-30 14:38:56.230947
2	1	SuperAdmin	Super Admin	t	2025-12-30 14:38:56.230947	2025-12-30 14:38:56.230947
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.settings (id, tenant_id, key, value, created_at, updated_at) FROM stdin;
4	1	TechIssueApproval	true	2025-12-31 12:09:49.91933	2025-12-31 12:09:49.91933
3	1	RequireComplaintApproval	false	2025-12-31 12:09:49.91933	2025-12-31 12:09:49.91933
5	1	No weekends	true	2026-01-11 07:35:17.547536	2026-01-11 07:35:17.547536
\.


--
-- Data for Name: skill_tests; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.skill_tests (id, tenant_id, title, skill_id, description, total_questions, passing_score, duration_minutes, is_active, created_at, updated_at) FROM stdin;
1	1	adminQL Basics	1	\N	\N	60	\N	t	2025-12-30 14:49:47.104482	2025-12-30 14:49:47.104482
\.


--
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.skills (id, tenant_id, name, category, description, is_active, created_at) FROM stdin;
1	1	adminQL	\N	\N	t	2025-12-30 14:49:47.104482
\.


--
-- Data for Name: tech_issues; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.tech_issues (id, tenant_id, issue_number, employee_id, category, title, description, priority, status, requires_approval, approved_by, approved_at, assigned_to, resolved_at, resolution_notes, created_at, updated_at) FROM stdin;
2	1	TECH002	1	other	Wrong entry	Wrong entry 1000 instead of 100	medium	Resolved	t	1	2026-01-10 15:45:43.39488	\N	\N	Verified changes, issue fixed	2025-12-31 11:26:03.323995	2026-01-10 15:45:43.394932
1	1	TECH-ACME-001	2	Hardware	Laptop overheating	Laptop shuts down frequently	Medium	Resolved	t	1	2026-01-10 15:48:44.335825	\N	\N	Rejecting recheck the issue	2025-12-30 14:49:51.920801	2026-01-10 15:48:44.335876
3	1	TECH003	2	database	100 to 1000	issue	low	Resolved	t	1	2026-01-10 16:17:23.878723	\N	\N	I see its corrected now	2026-01-10 16:10:42.880065	2026-01-10 16:17:23.878723
4	1	TECH004	1	database	testing	testing	low	Approval Pending	t	\N	\N	\N	\N	testing	2026-01-10 16:23:45.582065	2026-01-10 16:23:53.471228
5	1	TECH005	2	performance	test	test	low	Approval Pending	t	\N	\N	\N	\N	fixed check now	2026-01-10 17:03:32.256296	2026-01-10 17:09:01.206027
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.tenants (id, name, slug, domain, subdomain, logo_url, contact_email, contact_phone, address, city, state, country, timezone, currency, settings, subscription_plan, subscription_status, subscription_expires_at, max_employees, max_branches, is_active, onboarded_at, created_at, updated_at) FROM stdin;
1	Acme Corporation	acme	\N	acme	\N	admin@acme.com	\N	\N	\N	\N	USA	America/New_York	USD	{}	premium	active	\N	200	5	t	2025-12-30 14:38:56.227796	2025-12-30 14:38:56.227796	2025-12-30 14:38:56.227796
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (id, tenant_id, email, password, role, is_active, last_login, created_at, updated_at) FROM stdin;
2	1	john@acme.com	12345	employee	t	2026-01-10 19:13:11.592418	2025-12-30 14:38:56.228533	2025-12-30 14:38:56.228533
1	1	admin@acme.com	123445	admin	t	2026-01-11 11:25:57.981486	2025-12-30 14:38:56.228533	2025-12-30 14:38:56.228533
3	1	hr@acme.com	1234556	CEO	t	2026-01-11 11:40:22.841013	2025-12-30 14:38:56.228533	2025-12-30 14:38:56.228533
\.


--
-- Data for Name: work_logs; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.work_logs (id, tenant_id, employee_id, date, task_name, description, hours, category, status, created_at, updated_at) FROM stdin;
1	1	2	2025-12-30	API Development	\N	6.00	\N	Completed	2025-12-30 14:50:09.521961	2025-12-30 14:50:09.521961
3	1	2	2025-12-30	abc	abc	3.00	Abc	Completed	2025-12-30 22:17:54.684942	2025-12-30 22:17:54.684942
4	1	2	2025-12-30	Daily Rating	Productivity rating: 9/10	9.00	Rating	Submitted	2025-12-30 22:18:52.522674	2025-12-30 22:18:52.522674
5	1	1	2025-12-31	Abc	123	14.00	\N	Completed	2025-12-31 14:11:09.83297	2025-12-31 14:11:09.83297
6	1	1	2025-12-31	Loan application	20 loan application and 30 recovery calls	4.00	\N	Completed	2025-12-31 14:13:43.988482	2025-12-31 14:13:43.988482
7	1	1	2026-01-06	good morning	12e	3.00	\N	Completed	2026-01-06 16:35:20.821095	2026-01-06 16:35:20.821095
\.


--
-- Name: attendance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.attendance_id_seq', 17, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, true);


--
-- Name: branches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.branches_id_seq', 5, true);


--
-- Name: complaints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.complaints_id_seq', 3, true);


--
-- Name: employee_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.employee_roles_id_seq', 3, true);


--
-- Name: employee_skill_tests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.employee_skill_tests_id_seq', 2, true);


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.employees_id_seq', 3, true);


--
-- Name: leave_balances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.leave_balances_id_seq', 10, true);


--
-- Name: leave_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.leave_requests_id_seq', 11, true);


--
-- Name: leave_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.leave_types_id_seq', 4, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, true);


--
-- Name: payslips_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.payslips_id_seq', 2, true);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.permissions_id_seq', 16, true);


--
-- Name: role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.role_permissions_id_seq', 20, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.roles_id_seq', 3, true);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.settings_id_seq', 5, true);


--
-- Name: skill_tests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.skill_tests_id_seq', 1, true);


--
-- Name: skills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.skills_id_seq', 1, true);


--
-- Name: tech_issues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.tech_issues_id_seq', 5, true);


--
-- Name: tenants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.tenants_id_seq', 2, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: work_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.work_logs_id_seq', 7, true);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_tenant_id_employee_id_date_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_tenant_id_employee_id_date_key UNIQUE (tenant_id, employee_id, date);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: branches branches_tenant_id_code_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_tenant_id_code_key UNIQUE (tenant_id, code);


--
-- Name: complaints complaints_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_pkey PRIMARY KEY (id);


--
-- Name: complaints complaints_tenant_id_complaint_number_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_tenant_id_complaint_number_key UNIQUE (tenant_id, complaint_number);


--
-- Name: employee_roles employee_roles_employee_id_role_id_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.employee_roles
    ADD CONSTRAINT employee_roles_employee_id_role_id_key UNIQUE (employee_id, role_id);


--
-- Name: employee_roles employee_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.employee_roles
    ADD CONSTRAINT employee_roles_pkey PRIMARY KEY (id);


--
-- Name: employee_skill_tests employee_skill_tests_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.employee_skill_tests
    ADD CONSTRAINT employee_skill_tests_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: employees employees_tenant_id_email_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_tenant_id_email_key UNIQUE (tenant_id, email);


--
-- Name: employees employees_tenant_id_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_tenant_id_employee_id_key UNIQUE (tenant_id, employee_id);


--
-- Name: leave_balances leave_balances_employee_id_leave_type_id_year_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_employee_id_leave_type_id_year_key UNIQUE (employee_id, leave_type_id, year);


--
-- Name: leave_balances leave_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_pkey PRIMARY KEY (id);


--
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- Name: leave_types leave_types_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_pkey PRIMARY KEY (id);


--
-- Name: leave_types leave_types_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: payslips payslips_employee_id_month_year_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.payslips
    ADD CONSTRAINT payslips_employee_id_month_year_key UNIQUE (employee_id, month, year);


--
-- Name: payslips payslips_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.payslips
    ADD CONSTRAINT payslips_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_name_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_key UNIQUE (name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_role_id_permission_id_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_permission_id_key UNIQUE (role_id, permission_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: roles roles_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: settings settings_tenant_id_key_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_tenant_id_key_key UNIQUE (tenant_id, key);


--
-- Name: skill_tests skill_tests_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.skill_tests
    ADD CONSTRAINT skill_tests_pkey PRIMARY KEY (id);


--
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- Name: skills skills_tenant_id_name_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_tenant_id_name_key UNIQUE (tenant_id, name);


--
-- Name: tech_issues tech_issues_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.tech_issues
    ADD CONSTRAINT tech_issues_pkey PRIMARY KEY (id);


--
-- Name: tech_issues tech_issues_tenant_id_issue_number_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.tech_issues
    ADD CONSTRAINT tech_issues_tenant_id_issue_number_key UNIQUE (tenant_id, issue_number);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_slug_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_slug_key UNIQUE (slug);


--
-- Name: tenants tenants_subdomain_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_subdomain_key UNIQUE (subdomain);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_tenant_id_email_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_email_key UNIQUE (tenant_id, email);


--
-- Name: work_logs work_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.work_logs
    ADD CONSTRAINT work_logs_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: attendance attendance_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: audit_logs audit_logs_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: branches branches_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: complaints complaints_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.employees(id);


--
-- Name: complaints complaints_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: complaints complaints_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: employee_roles employee_roles_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.employee_roles
    ADD CONSTRAINT employee_roles_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.employees(id);


--
-- Name: employee_roles employee_roles_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.employee_roles
    ADD CONSTRAINT employee_roles_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employee_roles employee_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.employee_roles
    ADD CONSTRAINT employee_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: employee_skill_tests employee_skill_tests_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.employee_skill_tests
    ADD CONSTRAINT employee_skill_tests_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employee_skill_tests employee_skill_tests_skill_test_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.employee_skill_tests
    ADD CONSTRAINT employee_skill_tests_skill_test_id_fkey FOREIGN KEY (skill_test_id) REFERENCES public.skill_tests(id);


--
-- Name: employee_skill_tests employee_skill_tests_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.employee_skill_tests
    ADD CONSTRAINT employee_skill_tests_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: employees employees_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: employees employees_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: employees employees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: leave_balances leave_balances_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: leave_balances leave_balances_leave_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_leave_type_id_fkey FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id);


--
-- Name: leave_balances leave_balances_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: leave_requests leave_requests_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: leave_requests leave_requests_leave_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_leave_type_id_fkey FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id);


--
-- Name: leave_requests leave_requests_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.employees(id);


--
-- Name: leave_requests leave_requests_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: leave_types leave_types_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: payslips payslips_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.payslips
    ADD CONSTRAINT payslips_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: payslips payslips_generated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.payslips
    ADD CONSTRAINT payslips_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES public.employees(id);


--
-- Name: payslips payslips_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.payslips
    ADD CONSTRAINT payslips_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: roles roles_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: settings settings_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: skill_tests skill_tests_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.skill_tests
    ADD CONSTRAINT skill_tests_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id);


--
-- Name: skill_tests skill_tests_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.skill_tests
    ADD CONSTRAINT skill_tests_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: skills skills_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: tech_issues tech_issues_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.tech_issues
    ADD CONSTRAINT tech_issues_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.employees(id);


--
-- Name: tech_issues tech_issues_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.tech_issues
    ADD CONSTRAINT tech_issues_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.employees(id);


--
-- Name: tech_issues tech_issues_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.tech_issues
    ADD CONSTRAINT tech_issues_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: tech_issues tech_issues_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.tech_issues
    ADD CONSTRAINT tech_issues_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: users users_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: work_logs work_logs_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.work_logs
    ADD CONSTRAINT work_logs_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: work_logs work_logs_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.work_logs
    ADD CONSTRAINT work_logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- adminQL database dump complete
--

\unrestrict OReMXgVCMNSfx0CFyrCeSqIeJndU7pS9OK9wZZkfZdiaMaOfyzlOv1BtTSptxTf

