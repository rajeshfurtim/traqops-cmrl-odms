# Live register analysis — raw notes (cmrl-odms.com, read-only, 2026-09-25)
Logged-in view: "Test - Phase-II", station STST (teststation). Role limits what is visible.

## 0. Login (old system)
- Fields: Employee ID, Password (show/hide), **Select Station** (56 options, appears after Emp ID), **Select Shift** (loaded per station), Captcha (refresh), Remember me, Forgot password.

## 1. Caution Order (/caution-orders, /caution-orders/permits)
- List title "CAUTION ORDER LISTS" + station code. KPI tiles: Total, Completed, Active, Pending, Frozen, Cancelled, Pending Cancel, Expired, Today Orders, Today Permits, Issued Started.
- Toolbar: Filter (panel), Quick Links, Copy/Excel/CSV/PDF/Print (DataTables), page size 10/15/25/50/100/All, Search.
- Filters: text, Direction (UP/DOWN/BOTH), Mode (ATO/ATP/CUT OUT/RM), Department (AFC, CIVIL, E&M, IT, LMC, Lost&Found Office, OHE, OPERATIONS, others, PROPERTY DEVELOPMENT, PSD, REVENUE, ROLLING STOCK, SAFETY, SECURITY, SIGNALING, TELECOM, TRACKS, TRAINING), Issue progress (All/Pending not all issued/Completed all issued), Status (Pending, Completed, Till End of Service, Active, Expired, Frozen, Pending Cancel, Cancelled), date from/to, speed min/max, text.
- Columns: SL, ORDER ID (2026/0003/STST-SWD/OPN = year/seq/from-to/dept), DATE, FROM-TO (stations), DEPART., TRAINS (count, breakdown "6 (1+1+1+2+1)"), ISSUED (n done + train nos), DIRECTION, MODE, SPEED (km/h), MAST NOS (08/046 → 08/040), TIME (Start hh:mm:ss, E.O.S = end of service), REASON, STATUS, ACTION (train set buttons, issue tick).
- No "create" at station level: orders are raised centrally (OCC/department); station SC **issues** the order to each train (per train set TS#).
- View = official form **CMRL/OPER/SO/F-43 Rev 01 (01-Apr-2026)** "CAUTION ORDER (Train Operator / Station Controller Copy)": Date, Ref No, Form no (2026/STST/00003), Train Set No, instruction paragraph (reason, department), Period of validity (from time till End of Service of date), Restrictions table (Sl, Station between From/To, Line, Direction, Mast From/To, Speed, Permitted mode), OCC cancellation clause (TETRA), Issued by SC (name, signature, emp no, time of issue), TO acknowledgement (name, signature, emp no, time of receipt). Buttons: Print Document, Back.
- Global overlay on pages: "Document Assurance Required — please read documents to proceed" (manual read confirmation: Manual ID, Name, Category, File, Read Status, Accept; "I confirm that I have read…").
- Action column: per train set an **Upload** icon (signed/acknowledged copy) + train no; "Completed" chip when done. Status icons (✓ completed, Expired chip).
- Permits page "CAUTION ORDER PERMITS": Back to Orders, Filter, Quick Links, export buttons. Columns: SL, Issue date, Form no, Order ID, Train set, From-To, Dept, Upload status, Document. (= one row per train-set issue; the uploaded signed permit.)
- Quick Links → masters (Mode of operations).

## 2. Assurance (/assurance_register, /assurance_tracking, /show_assurance_report_for_stations)
- Purpose: staff must read and acknowledge manuals/acts/instructions (document assurance). Pages block with "Document Assurance Required" modal until each assigned document is opened (min 5 s reading timer) and "I have read this document" is clicked.
- Register: tiles Total manuals, Acknowledgements. Buttons: Show Assurance Report, **ISO Setting**, Print/CSV/Excel/PDF/Copy, All, Filter. Columns: #, Manual name, Category (Operational/Station/Common), Version, File (View), Description, Acknowledged (date time).
- **ISO Setting modal = report header config**: Document Name*, Display Name*, ISO Number*, Revision*, Date* → Cancel / Save Settings. (Same concept as our export header template: display name + form ref/ISO no + revision + issue date.)
- Tracking: tiles Total views, users, documents, stations. Columns: #, User (name + emp id), Designation, Station, Document (name + MAN id), Type, Viewed at, Status (Read). Side lists: Document-wise views, User-wise views.
- Station report: Employees, Manuals tracked, Fully acknowledged, Still pending, % per employee (x/y acknowledged, last update).
- Relationship: Masters › Manual / Manage Directory; "Read Manuals & Acts" menu.

## 3. Cab Pass (/cabpass_request, /cabpass)
- Purpose: passes for staff of other departments to travel in the train cab. Requests come from departments (EPIC users, see Masters › Cab Pass Master › Allow Epic User); approval chain **HOD → OP-HOD** (Operations HOD).
- Requests page "Cab Pass Requests" (department name shown): tiles Approved passes (current / previous assessment period), Pending (HOD), Pending (OP-HOD), Rejected (HOD), Rejected (OP-HOD), Total. Columns: Date of request, Request ID, Pass count, Remark, Department, Status, Status remark. Export Excel/PDF.
- Passes page: summary per department for current / previous **assessment period (half-year block, e.g. 2026-2)** — CIV, OHE, OPN, RS, TEL, TRK, SIG, E&M, OTH, SAF. Buttons: View Requests, Filters, **Print Selected** (row checkboxes). Filters: Department, Type of issue (New pass / Renewal), Date from/to. Columns: SL, Date of pass creation, Pass no/unique ID (CMRL/OPN-SAF/2026-2/9002 = dept + year-block + seq), Department, Validity from/to, Pass count, Receiver name (name / emp no / designation / dept), Base unique ID (renewal → original).
- Masters: Print Instructions (text printed on pass), Allow Epic User, Purpose master.

## 4. Passenger Assistance (/differently_abled, /differently_abled/{id})
- Title "Differently Abled & Medical Assistance Register — ISO Compliance Register & Daily Summary". Station shown.
- Tiles: Total assisted, Wheelchair persons, First aid provided, Visually impaired, Separated persons.
- Filters: search (date/type/station), Date from/to, Shift (A-SHIFT, B-SHIFT, C-SHIFT, **Evening Shift, General** — differs from diary A/G/B/C), Type (Wheelchair person, First aid provided, Visually impaired, Separated person). Clear/Reset/Apply. Exports Print/CSV/Excel/PDF/Copy.
- Columns: Date, Station, Type, then **counts matrix**: Male/Female/Transgender × In/Out/Int (entry/exit/interchange) for wheelchair & visually impaired; Medical M/F/T; Separated person M/F/T; Shift; Remark; Action (View detail, ⋮ menu).
- No Add button on register → entries likely captured from Station Shift Diary / dashboard (VERIFY).
- Detail = official form **CMRL/OPER/SO/F-33 Rev 02 (01/04/2026)** "Passenger Assistance Report": Basic info (station, shift, date, type), breakdown by gender with total, remarks, Sign & metadata (submitted by, submitted at, revision at, revision), date of record, place, "Signature of SC/SI". Print, Back to register.

## 5. Essential Equipment (/essential_equipment_register, /essitem)
- Purpose: weekly check of station emergency/safety equipment (hand flag, wheel chair, stretcher, shroud, gum boots, safety helmet, 33 KV gloves, hi-vis vest, umbrella, tri-colour torch, megaphone, first aid kit, rubber gloves, crank handles, pad lock … ~32 items from Masters › Essential Items).
- Register list: View Weekly Details, Filter (Item, Year from/to, Month from/to, Status WORKING/NOT WORKING), exports. Columns: ID, Report date, Station, Item name, Status, Photo, Remarks, Month, Emp name (emp id).
- Weekly details (/essitem): monthly sheet per station ("September 2026 · Station STST"), legend ✅ Working / ✗ Not working, Print. Columns: S.No, Item description, Frequency (Weekly), per-week blocks (1st, 2nd, …) each with Status, Remarks, Date, Name/ID.
- Entry: not on this page (likely a weekly checklist prompt on dashboard/diary — VERIFY). Photo optional per item.

## 6. Incident (/incident, /incident/create)
- List "Incident Register — Manage incident records". KPI cards (clickable → "KPI View: focused records from selected KPI card"): Total incidents, Police involved, Level 1, Level 2, Injuries.
- Filters: search, date from/to, Level (1/2), Class (A–L), Sub-class (~76, e.g. A1 "Collision of trains involving a revenue train, resulting in loss of human life and/or grievous hurt" … from Masters › Train Incident Class / Sub-Class). Exports.
- Columns: SL, Station code, Incident no, Submitted date, Incident date, Class code, Incident level, Subject, Created emp name, Emp ID, Actions.
- Create = official form **CMRL/OPER/SO/R4 Rev 00 "INCIDENT REPORT"** (Mode: Create). "All fields required except header/footer and Incident Timeline."
  - Incident details: Station (auto), Incident number auto **CMRL/OPER/SO/IN/{STN}/0001**, Date*, Time*, Class* (A–L), Sub-class* (depends on class), Level* (1/2), Subject*.
  - Incident timeline* (repeater, ≥1 row): Date, Time, Details of incident, Action. "Add Entry".
  - Communication & escalation: (i) communicated to reporting officer — at* (hrs), to* (officer); (ii) escalated to concerned dept — Escalated?* Yes/No → at*, to* officer.
  - Cause & action: (iii) prima facie cause*, (iv) action initiated*.
  - Impact: (v) loss of Metro Railway properties? Yes/No → details of damages*; (vi) delay in services? Yes/No → a) minor delay (min, from, to, section), b) major delay (min, from, to, section), c) no. of trips cancelled/suspended*.
  - Passenger details*.
  - Personnel & response: Any injuries* No/Yes → injury details*; Police/Ambulance involved* No/Yes → details*.
  - Footer: Date, Name & signature of SC/SI. Button "Submit Incident Report".

## 7. Imprest (/imprest "SC Dashboard")
- Purpose: station petty-cash (imprest) — bills against a fixed station budget, forwarded to line manager, refilled.
- Header "Imprest Register — {station} — All months". Tiles: Station budget (₹700), Total expense, Cash in hand (can go negative), Current expense.
- Filter, Print, CSV, Excel, Copy. Columns (grouped headers): Forward SL; Invoice # (STST-FW-2026-0001); Status (Draft/Completed); Invoice forward date; Station budget; **Invoice summary** (no. of bills, total bill amount, received by name, received from name & emp id, cash in hand); **Cash handing over** (total amount handed over, date, received by name & emp id, received from name, cash in hand after refill); Action (View details, View attachments).
- Modals: **Confirm Refill Receipt** (refill amount, provider name*, remark) ; **Forward to Line Manager** (selected invoices → receiver name*) ; **Invoice details** (Print invoice; invoice #, status, total, provider, created at; bills table: #, Ref ID, Bill no, Expense name, Category, Amount, Date, Status) ; Attachments (bill images).
- Masters: Imprest Master › Station Group (Unified), Expense Master (expense names/categories); Distribute Amount Station (budget).
- Bill entry screen not linked from this page (VERIFY where bills are added).
- ⚠ Security: guessing /imprest/create returned a Laravel debug error page exposing source, headers and session cookie — live site runs with APP_DEBUG on.

## 8. Key Register (/keyregister, /fetchusersKeyRequestsView, /fetchusersKeyHanoverView)
- Purpose: issue and return of station room keys.
- Flow: staff raise **Takeover request** → SC approves (key issued) → staff raise **Handover request** → SC approves (key returned).
- Takeover requests: tiles total requested qty, approved qty, pending qty. Columns: SL, Station, Date, Time, Issue-to name, Emp no, Phone, Company (CMRL/ALSTOM/other), Other company, Department, Room-code, Key hive, Key no, Location, Reason, Status, Action (Approve).
- Key register: tiles Total entries, Issued (not returned), Returned. Columns: #, Station, Date & time, Room - key no, Key hive, Issued to (name & ID), Org, Mob no, Reason, SC name, Return date & time, Returned by (name & ID), SC name, Status (Issued/Returned).
- Masters: Room (room code, key hive, key no, location).

## 9–12. LMC (Last Mile Connectivity) group — shared Quick Links menu to its masters (Service name & operator, Service/vehicle type, Trip route, Marketing type) and sibling registers
### 9. LMC Asset Fault Register (/lmcassetfault)
- Tiles/analytics ("LMC Asset Fault Analytics"): Total, Status Open, Rectify Closed, Rectify Pending, Op. In service, Op. Out of service. Filter, Quick links, exports.
- Grouped columns: **Fault details** (SL, Fault no, Station name, Station code, CMRL asset no, Fault description, Fault image, Raised on, SC name, SC ID, Operation status, Current status) · **Rectify fault** (Attended on, Attended by name & company, Rectified on, Operation status, Remark) · **Rectification details** (Exit emp name, Exit emp ID) · Action. Detail modal "Lmc Asset fault Register Details".
- Flow: SC raises fault (with photo) → operator attends → rectified → SC closes; operational status In/Out of service tracked at raise and at rectification.
### 10. LMC Audit Register (/lmcaudit)
- Analytics: Total audits, Your station, Services, Total operators; charts Monthly trend, Audit summary, Operator-wise, Service distribution, Route-wise distribution. Refresh.
- Columns: SL, Date, Audit no, Station, Service, Operator, Route ID, Other reference, Media (photos/video, media modal), Audit remarks, Employee name, Employee number, Designation, Action (view modal).
### 11. LMC Trip Sheet (/lmctripsheet)
- Tiles: Total trip sheets (trips), Total passengers (avg/trip), Total revenue (paid/free counts), Round trips (%; click filters).
- Columns (with per-column filter row): SL, Date, Shift, SC/SI name, SC/SI ID, Station, Operator, Route ID, Vehicle type, Vehicle number, Pickup from, Drop at, No of trips, Passenger count, Amount, Return passenger, Return trips, Return amount, Total passengers, Total revenue, Remark, Action (view modal).
### 12. LMC Marketing Plan (/lmc-marketting-projects, /{id}/manage, /my)
- Projects list: Create LMC Project (modal: Project name, Type [Marketing type master], Description, Start date, End date), Filter, exports. Columns: SL, Project name, Type, Description, Start, End, Status (Not started/Active/…), Actions (Manage, Delete).
- Manage page: Project details (Edit), **Members** (Add member, remove), **Logs** (filter by member; Logged at, Entry, Attachments, User, Actions), **Tasks** (Add task; Task, Assigned to, Due date, Status Assigned/…, Remark, Verified by, Actions).
- My Projects: projects assigned to the logged-in user.
- No Add on 9–11 for this role: entries likely created by LMC operator users (lmc_user role) or via diary (VERIFY).

## 13. Parking — Long Halt Vehicle Register (/longhaltvehicle)
- "Parking register for tracked vehicle entry, exit, and settlement." Tiles: Total entries, Entry records (still parked, awaiting exit closure), Exited records (exit + settlement done).
- Columns: #, Station, Veh no, Veh type, Entry date & time, Parking location, SC name, Days parked, Exit, System value (computed charge), Amount collected, Exit done by, Action. Filters, exports.
- Flow: SC logs entry → on exit, system computes charge from days parked (parking tariff), SC records amount collected → exited. Related: Masters? Parking Policy/Tariff documents in Assurance.

## 14. Local Traffic Regulation (/localtrafficregulation)
- Analytics: Total operations, Offer Control (OC) count, Take Control (TC) count, Enforce Take Control operations.
- Columns: #, Date, Station, SC name, Emp ID, Operating system, Control status (OC/TC/Enforce TC), Station P.N (private number), Exch. P.N, Remarks, Submitted date, Action (detail modal). Page size up to 500.
- Related: **Private Number Book** (PN exchanged with OCC for control handover).

## 15. Metro Connect (/metro_connect)
- ⚠ Live page crashes (ErrorException "service_bus on null") and shows the Laravel debug page (source, SQL, session cookies) — bug + security exposure in the old system; it also loads *all* stations' rows (select * without station filter).
- Fields seen in template: Station, Service bus (LMC service master), Total trips, Total passengers, Revenue collected; row menu Edit/Delete guarded by permissions `edit metroconnect`, `delete metroconnect`; page guarded by `view metroconnect`.
- Old system permission model: Laravel + Spatie roles & permissions, per register "view/create/edit/delete <register>".

## 16. Manual Point Operation (/manualpointnew, /create, /{id})
- List "Manage manual point operation records". Filter & search panel: Point no (select from Masters › Point Number), CHK (check/key no), Start/End date; Clear filters/Apply. Add Entry (403 for this account although button is shown). Exports.
- Columns: #, Date, Station, Emp ID, Point no, CHK, Released station PN, Released OCC PN, Normalised station PN, Normalised OCC PN, From time, To time, Time taken (computed, crosses midnight), Remarks, Action (View, ⋮ edit/delete).
- View = official form **CMRL/OPER/SO/F-32 Rev 02 (01/04/2026) "Manual Point Operation Report"**: Personnel (SC name, emp no); Basic (date, station, point no, CHK); Date & time (start date/time, end date/time, time taken); CHK release PN (station PN, OCC PN); CHK normalise PN (station PN, OCC PN); **Observation timeline** (date, time, observation details — repeater); Attached images; Remarks; Sign & metadata (submitted by/at, revision at, **revision no**), date of record, place, signature of SC/SI. Print, Back.
- Related: Private Number Book (PNs), Masters › Point Number.

## 17. Mock Drill / Events / Pep Talk (/mockdrill, /mockdrill/{code}/eventdetails, /safetyofficermockdrillreview, /safetyofficermockdrillfinal-report)
- Register "Mock Drill / Event / Pep Talk Register" (station shown). Tiles (clickable): Events, Mock drill, Pep talk, Total, **Pending schedule mock drill**.
- Filters: search, Type (Event/Mock drill/Pep talk), date from/to, Department. Exports.
- Columns: #, Type, Date, Title (scenario e.g. Evacuation, Bomb threat, Lift rescue, Manual point operation), Station, Emp name, Emp ID, Action (Preview). Record code e.g. MDTLnLZYI4.
- View = official form **CMRL/OPER/SO/F-28 Rev 00 (01/09/2022) "Mock Drill Report"**: Basic (type, station, date, department); Details (title, location, no. of participants, start, end, time taken); Brief description; **Action timeline** (#, date, time, action performed); Attached images; Sign & metadata (submitted by/at, revision at, revision), signature SC/SI.
- **Scheduling & review workflow (Safety officer)**: Masters › Mock Drill Plan Management (Mock drill calendar/scenarios, Schedule, Re-schedule history, Category). Scheduled drills are assigned to a station with a window (assigned from/to) → station executes and reports → Safety officer **reviews** → final report **approved**.
  - Review page: reporting year, tiles Total/Under review/Completed; columns SL, Year, Scenario, Sch ID, Category, Mock drill ID, Assigned to, Assigned from/to date, Date of execution, Time taken, Completed by, Status, Action.
  - Final report: analytics (total executed, under review, completed; breakdown by category with ratio; top active scenarios chart); same columns + Approved by.

## 18. Station PD Management (/pdmanage)
- Purpose: inspection of Property Development (PD) shops/licensees at the station.
- Tiles: Total inspections, Active licences, Expired licences, With penalties.
- Columns: SL, Date, Station, Location (concourse…), Area (sq ft), LOA ref, Shop name, PD code, Licensee, **Tenure from/to** (licence validity → active/expired), Inspection points, Penalty yes/no, Penalty remarks, Amount (₹), Remarks, SC name, Emp ID, Img, Action (view modal "PD Management Details").
- Masters: Shop (shop name, PD code, licensee, LOA ref, area, location, tenure).

## 19. Possession Register (/possession_local = Local, /possession-track-v2 = Track) — register views of the **PTW (Permit To Work)** module
- Local: tiles (clickable KPI view) Total PTW, PTW issued pending, Issued, Issue rejected, Cancel pending, Cancelled, Cancel rejected, Extension pending, Extended; by station level (Concourse/Street/Platform); by work category (Installation/Inspection/Maintenance/Repair).
  - Columns: SL, Date, Station, PTW number (STST-L-00012), EPIC name (external/contract worker from EPIC list), Employee no, Designation, Department, Organisation, No. of persons, Work category, Station level, Work description, PTW request (from/to date-time), PTW issue approved (date, time), PTW extension (date, time), Cancellation request (date, time), Cancellation approved (date, time), SC/SI (name, emp id).
- Track: tiles Total possessions, Live today, Closed today, Pending permits, Total closed, Pending cancellations; Viaduct/Tunnel; Integrated block/Shadow power block; Planned/Unplanned; With/Without engineer's possession.
  - Columns: SL, Date, EPIC name, Emp no, Designation, Department, Organisation, Persons, Permit no (STST-T-00010), Description, Issued at, Closed at, Time granted, Permitted upto, Extn from/to, Time cancelled, **PN numbers**: PTW issued same stn, PTW issued TC/TR, PTW cancelled same stn, PTW cancelled TC/TR, PTW cancelled other stn; **ER (earthing rod?) fixed by M.staff / stn, removed by M.staff / stn**; SC name, SC emp id, Approved remarks, Rejected remarks.
- Related: PTW module (Local PTW requests, PTW track requests), EPIC list, WGO, Private Number Book, Masters › Track circuit / Power block timing.

## 20. Train Traffic Register (TTM) (/ttm_register, /pendingttmreports, /preview_generated_report/{ref})
- OCC-level event log. Two views with counters: **Finalized records** ("all locked & archived traffic data", 17) and **Pending applications** ("logs requiring review or updates", 15 open actions). Date From/To filter + Reset.
- Finalized columns: #, ID (2026/TTM/CIV/0017 = year/TTM/dept/seq), Date, Schedule (from–to timestamps), Location (upline/downline), Event description (with section, e.g. SWD to SWN), Report type (Auto-generated), **Edit control (Locked)**, View.
- Pending columns: #, Date & time, Schedule, Location, Event description, Report type (Generated report), View.
- Report = **"OCC Event Report" ISO DOC_OCC R-04**: date, ref, generated on; event title, location; Track, Target system, Asset classification, Subsystems, Functional unit; start/duration/end; IMP scenario followed; narrative summary; **Punctuality loss analysis** (corridor, section, trips up/down, totals); **Chronological event timeline log** (timestamp, narrative — incl. standard steps "Informed concerned Controller/JE", "Escalated to reporting officer and Operation HOD", "Informed Train Operator"). "Print Executive Document Report".
- Masters: Train Traffic Plans (IMP scenarios), Corridor & Line master, Trip route.

## 21. TSR — Temporary Speed Restriction (/tsr, /preview_tsr_report/{id})
- Summary tiles: Total requests, Pending, TSR implemented, Cancelled, Track circuits (count). "View All Departments"; filters Department, Designation, Reset.
- Columns: #, TSR ID (2026/09/00003/CIV = year/month/seq/dept), Requested / Valid till (date, time), Validity, Track circuit(s) (T125N, T127N), Location (station pair), Restricted speed (km/h), Requestee, Designation, Department, On-duty TC (traffic controller), Status (Pending / Implemented / Extension implemented / Cancelled), View (report), Action.
- Report = "Application form of Temporary Speed Restriction — Imposition (in accordance with **Special Instruction No. 07 to MRGR 2013**)", Doc no CMRL/OPN/TSR/0008: request type, department, reason, location (corridor & line), from/to mast no, start/end station, requested date-time of implementation, expected date-time of cancellation, speed (km/h) & track circuits, requestee name/designation + signature; **certifying authority TC/DC/SC OCC** (name, signature) — "Not implemented yet". Print, Back.
- Workflow: department requests → OCC implements (certifies) → may extend → cancel. Masters: Track circuit.

## 22. TSR Signaling (/tsr_signaling)
- Signaling department's view of TSRs needing signaling action. Filters Department, Designation, Reset, Search; Export Excel/PDF.
- Columns: SL, TSR ID, Imposed at, Valid till, Validity, Track circuit(s), Location, Restricted speed, Designation, Department, On-duty TC, Status ("With Signaling"), View report, Action (**Implement Cancellation**), Signaling user ("Not implemented yet").
- Modal "TSR Cancellation Implementation Form" (application form for TSR cancellation, signed by signaling).
- Workflow addition: implementation/cancellation of TSR in the signalling system is done and certified by the Signaling department.

## 23. WGO Register (/wgo_register)
- WGO = Work Granting Order (department work on the line). Bulk: Select all, **Delete selected** (⚠ deletion allowed on a register).
- Columns: ID, WGO no (NOR_SIG/2026-09-06/0003 = mode_dept/date/seq, suffix -APP approved / -REJ rejected), Mode (Normal/Emergency/Special), Subject (Maintenance/Inspection/Testing), Source, Destination, Department, Line (Line 1/2), Work day, Status, Created.
- ⚠ Source/Destination/Department show raw IDs (94, 67, 31) — display bug.
- Related: WGO module (Power block timing, Train parking induction, WGO masters: access request, equip/vehicle, lights, movement from, parking location, TVS fan status).

## Master values read for Phase 1 (30/09/2026, read-only)
- **Incident sub-classes** (from the class → sub-class dropdown on /incident/create; 76): A1–A5 collisions, B1–B8 fire/explosion/smoke/air renewal, C1–C5 derailments, D1–D4 running into obstruction, E (security threats), F1–F4 averted collisions / SPAD, G (other train accident), H1–H11 rolling stock, I-1–I-7 track & structures, J1–J7 electrical (OHE, power supply, lifts & escalators > 2 h, fire detection), K1–K10 signalling, telecom & AFC, L1–L13 other incidents. Full wording in `frontend/src/modules/registers/data/masters.ts`. (The Incident Sub-Class master page only holds one "NA" row per class; the real list comes from the form.)
- **Essential items** (/items, 20, all Weekly): Raincoat, Hand tally counter, Checking of emergency contact numbers available in SWO, Queue manager, Point clamp, Pad lock, Crank handle, Rubber gloves, First aid kit, Megaphone, Tri colour torch, Umbrella, High visibility vest, 33 KV gloves, Safety helmet, Gum boots, Shroud, Stretcher, Wheel chair, Hand flag.
- **Local Traffic Regulation**: Operating system OC-500 / OC-111 / Both; Control status OC – Offer Control / TC – Take Control / Enforce Take Control.
- **Key Register**: Company = CMRL + EPIC organisations (A1 Global FM, ABS Fujitsu, ALSTOM, ALSTOM-UDS, Blue Star, BSNL, …); status Issued / Returned.
- **Parking (Long Halt)**: vehicle types Two-Wheeler, E-Two-Wheeler, Three-Wheeler, Four-Wheeler, E-Four-Wheeler, Six-Wheeler; status Entry / Exited.
- **PD Management**: location Concourse / Platform / Street / Other; penalty Yes / No.
- **Mock Drill**: type Event / Mock Drill / Pep Talk; department = the 20 departments.
