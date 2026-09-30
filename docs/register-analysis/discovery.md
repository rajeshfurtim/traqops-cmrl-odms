# Legacy ODMS discovery — everything visible to the current login (read-only)

Site: cmrl-odms.com · Login: "Test - Phase-II" (emp id test321, designation "test", station teststation / STST) · Started 28/09/2026.
Method: open pages and read the DOM only. Nothing created, submitted, approved, edited, deleted or uploaded.
Register-level detail from the first pass (25/09/2026) is in `notes.md`; this file covers the whole application.

Legend: ✅ accessible · 🔒 restricted (403 / hidden) · ⚠ error page · — not linked / not reachable

## 1. Sidebar menu (full tree)

```
Dashboard → /dashboard
Read Manuals & Acts
  Show Manual → /folders
  Show Acts → /getacts
Roles                                   (no sub-items for this login)
Private Number Book
  View Private Number Book → /pn-books
Employee Operations
  Employee Management                   (no sub-items for this login)
  Role-Based Login Control Panel
    View Role-Based Login Control Panel → /logindropdownmaster
  Station Periodic Audit Configuration
    View Station Audit Config → /station-audit-configurations
Epic List
  Show (Nodal View) → /epics_for_nodal
  Show (HOD View) → /epics_for_hod
Lost & Found
  Add Found Items → /lostandfound/create
  Summary Reports
    Date wise → /SummaryReports/datewise
    Current Day → /SummaryReports/currentday
    Overall → /SummaryReports/overall
  LIR (Lost Item Report)
    Current stn LIR → /enquiry/lostitemsenquiry/Current_Station_passenger_Request/STST
    All station LIR → /enquiry/lostitemsenquiry/index
  LIF (Lost Item Found)
    Current STN LIF image → /lostandfound/LIR_Image/show/100
    All STN LIF image → /lostandfound/LIR_Image/show_all
    Current STN LIF → /lostandfound/only_current_station/100
    All STN LIF → /lostandfound
  L&F Register → /lostandfound/only_current_station/export
Masters
  Quick Links Master › Show Quick Links → /quicklinks
  Cab Pass Master › Print Instructions → /cabpassinstructions · Allow Epic User → /allowepicuser_for_capbass_request · purpose master Content → /cabpasspurpose
  Epic Station Control › Epic Station Control → /epic_station
  Asset Master › Asset Name Master → /assetnamemaster · Asset Category Master → /assetcatmaster
  Mock Drill Plan Management Master › Mock Drill Calender → /safetyofficermockdrillscenarios · Mock Drill Schedule → /safetyofficermockdrillschedules · Re-Schedule History → /safetyoffficer-mockdrill-reschedule-history · Mock Drill Category → /safetyofficermockdrillcategory
  Acts › Show Acts → /act
  LMC Masters › Service Name & Operator → /lmcservicenamemaster · Service Type → /lmc_vehicle_type_master · Marketting Type → /lmc-marketting-type · Trip Route → /trips
  Rack No. → /racks
  Assistance Provided → /assistance_provided
  Corridor → /corridor
  Department → /department
  Designation → /designation
  Manage Directory → /manage_manual_directories
  Distribute Amount Station → /dis_amount_station
  Epic Organization → /epicorg
  Essential Items → /items
  Floating Cash Master → /floatingcash
  Failure Section → /failure_section
  Holiday → /holiday
  Hot Keys → /hotkeys
  Imprest Master › Station Group (Unified) → /station_grp · Expense Master → /expense_master
  Manual → /manual
  Mode of Operations → /master/mode-of-operations
  Point Number → /pointnumber
  Room → /room
  Scenario Entries → /scenario
  Scenario Master → /scenario_master
  Shift → /shift
  Shop → /shop
  Station Group → /station_group
  Station Items → /station_items
  Stations → /station
  Task and Event → /tasksevents
  Track Circuit → /track_circuit · Create Circuit → /track_circuit/create
  Train Incident Class → /incident_class
  Train Incident Sub-Class → /incident_subclass
  Train Traffic Plans → /incident_plans
  Corridor and Line Master → /master/station-routes
  Trains → /train
  Trip Route Master → /trips
  WGO Masters › Access Request → /access_request_master · Equip Vehicle → /wgo_equip_vehicle_master · Lights → /wgo_lights_master · Movement From → /wgo_movement_from_master · Parking Location → /wgo_parking_location_master · TVS Fan Status → /wgo_tva_fan_status_master
Register (23 registers — see notes.md)
PTW
  Local PTW Requests → /localpermit
  PTW Track Requests → /ptw/ptwtrack
WGO
  Power Block Timing → /power_block_timing
  Train Parking Induction → /train_parking_induction_master
  Train Parking Induction Values → /customized_train_parking_induction_master
  WGO → /wgo
Customer Care
  Show Complaints → /complaintsdata
  Customer Care Register → /customer_care
Station Shift Diary
  View Diary → /stationdiary
  Shift Summary → /station-diary-filterpage
Asset
  Asset Management › View Assets → /assetmanagement
  Asset Request › View Requests → /asset-requests
  Asset Maintenance › View Asset Maintenance Lists → /assetmaintenence
  Asset Disposal › View Asset Disposal Lists → /assetdispose
  Asset Audit › View Asset Audit Report → /periodicassetaudit
```
Top bar: "Search menu… Ctrl+K" (menu search), notifications bell (count), user avatar menu (profile /view_my_profile, update /update_profile, change password /chnage-password-user, Log Out). Global pop-ups: "Document Assurance Required" (blocking manual-read gate), "Pending Actions" reminders.

## 2. Screens

### 2.1 Dashboard ✅ /dashboard
- Greeting "Welcome back, {name}"; buttons **Generate PN** (creates a private number — not clicked), **Quick Access**.
- KPI cards (each "View All"): Request by Passenger — current station (→ /enquiry/lostitemsenquiry/Current_Station_passenger_Request/STST) and all stations (→ /enquiry/lostitemsenquiry/index); Items Found — current station (→ /lostandfound/only_current_station/{id}) and all stations (→ /lostandfound); Cash Remitted to Bank ₹ (→ /lostandfound/remitted-to-bank, not in sidebar).
- Operations Overview chart (Passenger requests, Items found, Cash remitted, Active PTW); Distribution by category (%, shows "PTW −1%" — bug).
- Recent Activity feed (PR passenger enquiry filed, IF item handed over, CR cash remitted, PTW permit active) — relative times show "3 hours from now" for past events (time-zone bug).
- PTW Status Tracker: active permits by level (Street/ConCourse/Platform · #id), "Expires 4.6118972954514d" (unformatted), % elapsed, Expired; "View all permits" → /activeptw (not in sidebar).
- Quick Links Directory (grouped, counts): CMRL (ONE CMRL, RRS, HRMS), MONTHLY SUBMISSION (Employee of the month, KPI register), ODMS (ODMS login, EPIC login, L&F update request, Asset register format, L&F delete request), OPERATIONS (staff card registration/entry-exit/operator dashboard/SC login/counting, run-away vehicle register, AG gates & ticket counter equipment, physically challenged parking, NCMC parking machine status, WhatsApp QR sale analysis, store value pass issues, station rooms URL/details, operations data links), Over all links, QUARTERLY SUBMISSION (DMP preparedness), REVENUE (manual ticket sale reporting ×2), YEARLY SUBMISSION (Appraisal form – non executives). Targets are external: one.cmrl.in, rrs.cmrl.in, hrms.cmrl.in, epic.cmrl-odms.com, Google Forms/Docs and Apps Script.
- **Dashboard pop-ups (data entry lives here):**
  - `#equip2245` **Essential Equipment Register — weekly entry**: per item (≈20 items): Item name, Status weekly radio **Working / Not working**, Remarks, **Upload image (image/*, required)**. → answers the gap "where is Essential Equipment entered".
  - `#assurancemodal` **Assurance Register — staff declaration**: table # / Name of assurance / Description / View file / User check, plus declaration "I have carefully studied all relevant rules and systems pertaining to Train Operations and Station Management… Station Working Orders, Metro Rail…" with a confirmation checkbox.
  - `#autoOpenModal` Document Assurance Required (blocking read gate, 5 s minimum per document), `#documentPreviewModal`, `#detailsModal` Item details, `#reminderPopupModal` Pending Actions (reminders, "Dismiss all"), `#errorModal`.

### 2.2 User menu
- **My profile** ✅ /view_my_profile: name, designation, contact details (email, employee ID, phone), signature image.
- **Update profile** ✅ /update_profile "Update Your Signature & Photo!": Upload profile photo* (image/*), Upload signature* (image/*), Upload. (Signature image is printed on official forms.)
- **Change password** ✅ /chnage-password-user: New password*, Confirm password*, confirmation checkbox* (disabled until …). ⚠ No current-password field — weakness not to repeat.
- **Notification Center** ✅ /notifications/all: "Manage and view your system alerts and activity log", 15 per page (86 alerts). Types seen: 🔑 New Key Handover Request, New Key Takeover Request ("Key {no} requested at {stn} by {name}", date-time), button **Open Desk** (jumps to the related desk/queue). Bell in the top bar shows unread count; "Mark all read" in the bell menu (not clicked).
- Log Out (not used).

### 2.4 Read Manuals & Acts
- **Show Manual** ✅ /folders — folder tiles (16): Lost and found, Standing order book, O&M Act, Revenue, OCC & Depot Working, MRGR, Disaster Management, Station working order, Parking policy, SOP TO, SIGNALING, SOP Station, SAFETY, SOP GENERAL, Station Instruction, Special Instruction. Folder → /view_files/{DIRcode} "All Files": columns Name, Code, Category (Operational…), Ver, Description, Uploaded (date), Download (Open). ← Back.
- **Show Acts** ✅ /getacts — breadcrumb Dashboard › Acts; list of act files (e.g. O&M Act, file name), View PDF, Download File.
- Documents are managed in Masters › Manual, Masters › Acts, Masters › Manage Directory; reading is tracked by Register › Assurance.

### 2.5 Roles — 🔒 menu shows no sub-items for this login.

### 2.6 Private Number Book ✅ /pn-books "Private Book Number"
- Buttons: **Generate PN Number** (creates a PN — not clicked, form not seen), Filter (PN no, Exchanged with, Exchanged PN no, Purpose, Exchanged date; Apply/Reset). Page size 10/20/50/100/500/All.
- Columns: SL, PN no, Name, Emp ID, Exchanged with, Exchanged PN no, Purpose of PN exchange, Exchanged date. No rows for this login.
- Used by: Manual Point Operation, Local Traffic Regulation, Possession (PTW) PN fields; Station Diary "Generate PN".

### 2.7 Employee Operations
- **Employee Management** 🔒 — no sub-items for this login.
- **Role-Based Login Control Panel** ✅ /logindropdownmaster "ROLE-BASED LOGIN SETTING": which stations and shifts each role may pick at login. Filter settings (Role name), Excel/PDF/Print/CSV/Copy. Columns: SL, Role name, Stations, Shifts, Action (edit → JS `editRoleBasedlogin(id)`, delete → `deleteRole(id)`; not used). 10 roles:
  | Role | Stations | Shifts |
  |---|---|---|
  | test | STST | A, G, B, C |
  | Training cell | OTC | G |
  | admin | ADMIN | G |
  | assetaudit | OPN-STORE, AAP1SMM | A, G, B, C |
  | Revenue Controller | RCP1 | A, G, B |
  | Traffic Regulator | TRP1C1, TRP1C2 | A, G, B, C |
  | Traffic Controller | TCP1 | A, G, B, C |
  | LostAndFoundOffice | LFO | A, G, B, C |
  | Helpline | HL1 | A, G, B, C |
  | Station Incharge | 26 stations (SWD, STT, STV, SKP, STG, SNW, STC, SMA, SLI, …) | A, G, B, C |
  → Shift set used at login is **A, G, B, C** (matches the new ODMS). "Stations" include pseudo-stations for offices (ADMIN, OTC, RCP1, TCP1, TRP1C1/C2, LFO, HL1, OPN-STORE).
- **Station Periodic Audit Configuration** ✅ /station-audit-configurations: Add (not used). Columns: #, Station (code – name), Status (Enabled), Audit type (Mandatory), Action. Drives a middleware that forces the monthly asset audit per station (PeriodicAuditMiddleware seen in the debug trace).

### 2.8 Epic List (authorised / nominated staff and contractors)
- **Nodal view** ✅ /epics_for_nodal "Epic List for NODAL officer — {department}": tiles Authorized, Nominated, Authorized expired, Nominated expired, Nominated approved/rejected/pending, Active users, Inactive users. Filter (Type Authorized/Nominated, Organization (CMRL + contractors: A1 Global FM, ABS Fujitsu, ALSTOM, Blue Star, BSNL, J.M.D Consultants, KCIC…), Designation, HOD permit Pending/Approved/Rejected, AC status Created/Not created, Creator). Exports. Columns: SL, Employee ID, Name, Department, Organization, Type, HOD permit, AC status (login account created?), Designation, Competency number, Expiry date, Created by, Action (Preview, View images). 278 records.
- **HOD view** ✅ /epics_for_hod: HOD's approval queue — tiles Nominated approved/rejected/expired/pending; same columns.
- **Preview** ✅ /epics/{id} "Epic List Preview — EPIC/NODAL/PREVIEW": date, type, name, employee ID, department, organization, designation, competency number, expiry date, status, attached files; Print, Back.
- Create/approve screens: 🔒 not visible (create is by nodal officers; approve by HOD). Used by PTW/Possession (EPIC name) and Cab Pass.

### 2.9 Lost & Found
Item categories (master): **A Documents · B Electronic items · C Cash · D Luggage & purse without valid items · E Accessories and keys · F Bullion articles · G Dangerous materials · H CMRL materials**.
Found-item ID: `LIF/{STN}/{DDMMYY}-{seq}` (e.g. LIF/STST/210826-001).
- **Add Found Items** 🔒 /lostandfound/create → **403 Forbidden** for this login (menu item and "Add FOUND ITEM" button still shown). Form not captured.
- **Found items — current station** ✅ /lostandfound/only_current_station/{stationId} "FOUND ITEMS LIST – {station}": tiles Total, Pending claim, Claimed, Cash remitted, Security informed, In station, **Move time expired**, Moved to L&F, Pending in L&F, Approved in L&F, LFO returns. Buttons Report (→ register), All, Filter, exports, page size 50/100/200/400/All.
  - Filters: LIF unique ID, Articles category, From/To date, Claim status (Unclaimed/Claimed), Cash remit status (Not remitted/Cash remitted to bank), Inform security (Not informed/Informed CMRL Security), Item status (Currently in station/Moved to Lost & Found Office), Found item status (Pending in L&F office/Approved in L&F office).
  - Columns: S.No, Unique ID, Articles type, Type name, Type details, Images, SC name, Station code, Found date & time, **Storage period**, Status, Details (View — JS; detail not captured).
  - **Inline row forms** (per item): remit cash — Choose Yes/No, Challan number, Challan date, Total amount remitted; **Moving status*** Yes/No (move to Lost & Found Office). Not used.
- **Found items — all stations** ✅ /lostandfound: same list across stations + **ISO Setting** (report header). All-station tiles (e.g. 15,146 total, 5,834 pending claim, 7,008 claimed, 2,303 cash remitted, 4,941 moved to L&F…).
- **LIF images** ✅ /lostandfound/LIR_Image/show/{stationId}, /show_all: image gallery cards (Item ID, Articles type, Article item, Status "Claim Now"), Filter/Reset.
- **Cash remitted to bank** ✅ /lostandfound/remitted-to-bank (dashboard link only): columns S.No, Stn code, Unique ID, Articles type & details, Images, SC name, Found date-time, **Challan no, Challan date, Total amount**, Status, Details.
- **L&F Register** ✅ /lostandfound/only_current_station/export "Lost & Found Register – {station}" (page title "Founder to SC Report"): Status filter (At station, Handed over to L&F office, Remitted to bank, Security, Claimed), Print, Export Excel/PDF. Statutory columns: S.No, Station code, Found date & time, Place found, Unique ID, Article type, Details, **Handed-over person name / signature & location**, **Receiving SC name / emp no / signature**, **Witness to hand-over (types C & F)**, **Claimant details (name, address, ID proof)**, LIR no, Handed-over SC name, Claimant signature + date/time of hand-over, (if not claimed) Lost & Found Office representative name/signature.
- **Summary reports** ✅ /SummaryReports/datewise (From/To filter), /currentday, /overall — official form **CMRL/OPER/SO/F-38 Rev 01 (2026-04-01)** "Lost & Found – {station} Summary Report": per category A–H + total: Items received, Claimed, Unclaimed, Remit to bank, Cash remitted to bank, Moved to LFO, Moved to LFO approved, Moved to LFO pending. Current date/time printed. Print, Back.
- **LIR (Lost Item Requests from passengers)** — requests come from a public form (not in ODMS menus).
  - All stations ✅ /enquiry/lostitemsenquiry/index: tiles Total, Pending, Handed over, Not available, Reject form; **ISO Settings**; station filter (All/SAE/SAL-2/SAP/SCC-…); filters Enquiry ID, Articles category, Status (Pending/Handed over/Not available/Reject form), Lost date. Columns: S.No, Stn code, Enquiry ID, Articles type, Type name, Details, Images, Requester name, Email, Mobile, Lost date & time, Status, Remarks, Action (View).
  - Current station ✅ /enquiry/lostitemsenquiry/Current_Station_passenger_Request/{STN}: same + **Update Status** modal (Select status*: Not available / Reject form / Handed over; Remarks) — not used.
  - Detail ✅ /enquiry/lostitemsenquiry/enquiry_details/{id} = official form **CMRL/OPER/SO/F-39 Rev 01 "Lost Item Request Form"**: Enquiry no, Enquiry status, Claimant name, Item lost date, Place of lost item, Mobile, Email, Articles type, Item name, Details, Communication address, Boarding station, De-boarding station, Final destination, Images. Print.

### 2.10 Masters (reference data)
Most master pages show no Add/Edit/Delete buttons for this login (view only) unless noted.

**Shift Master** ✅ /shift — columns SL, Shift name, Shift code, Shift ID, Time from, Time to, Action. Values:
| Shift | Code | From | To |
|---|---|---|---|
| A - SHIFT | A | 07:00 | 13:00 |
| B - SHIFT | B | 13:00 | 21:00 |
| C - SHIFT | C | 21:00 | 07:00 |
| General | G | 09:30 | 17:30 |
| Evening Shift | B1 | 14:00 | 22:00 |
⚠ Differs from the new ODMS domain rule (A 06–14, G 09–17:30, B 14–22, C 22–06) — needs product-owner decision.

**Department Master** ✅ /department — SL, Department name, Code, Department email, Description. 20 departments: AFC, CIVIL, ELECTRICAL & MECHANICAL, IT, LMC, LOST & FOUND OFFICE, OHE, OPERATIONS, others, PROPERTY DEVELOPMENT, PSD, REVENUE, ROLLING STOCK, SAFETY, SECURITY, SIGNALING, TELECOM, TRACKS, TRAINING, TTM.

**Designation Master** ✅ /designation — SL, Code, Description (20+ e.g. General Manager O&M, Station Service Manager, Revenue Controller, Passenger Information Controller, Traffic Regulator, Help Line, Service Engineer, Site Manager, JE TXI, SDE TXI, AGM TXI-I, FSE, Network Engineer, System Engineer & TL, Service Incharge, Senior Engineer, Operator, Maintenance Engineer…).

**Corridor Master** ✅ /corridor — SL, Name, Phase, Code, Station from, Station to, Description. Values: C-1, C-2, C-3, OCC, OPERATION, REVENUE.

**Station Master** ✅ /station — **Add Station** button visible. Columns: SL, Station serial, Station name, Station code, Corridor, Generate QR place name, Address, Action. 55 entries (name : code : corridor):
Depot:DEK:C-2 · CENTRAL METRO:SCC-1:C-1 · ALANDUR:SAL-1:C-1 · Training cell:OTC:OPERATION · ADMIN:ADMIN:OPERATION · ASSET AUDIT - SMM:AAP1SMM:OPERATION · OPERATION STORE:OPN-STORE:OPERATION · REVENUE CELL:RCP1:REVENUE · TRAFFIC REGULATOR - C2:TRP1C2:OCC · TRAFFIC REGULATOR - C1:TRP1C1:OCC · TRAFFIC CONTROLLER:TCP1:OCC · HELP LINE:HL1:OCC · LFO:LFO:C-2 · teststation:STST:C-1 · St. THOMAS MOUNT:SMM:C-2 · EKKATTUTHANGAL:SSI:C-2 · ASHOK NAGAR:SAN:C-2 · VADAPALANI:SVA:C-2 · ARUMBAKKAM:SAR:C-2 · CMBT:SCM:C-2 · KOYAMBEDU:SKO:C-2 · THIRUMANGALAM:STI:C-2 · ANNA NAGAR TOWER:SAT:C-2 · ANNA NAGAR EAST:SAE:C-2 · SHENOY NAGAR:SSN:C-2 · PACHAIAPPAS COLLEGE:SPC:C-2 · KILPAUK:SKM:C-2 · NEHRU PARK:SNP:C-2 · EGMORE:SEG:C-2 · CHENNAI AIRPORT:SAP:C-1 · MEENAMBAKKAM:SME:C-1 · OTA-NANGANALLUR ROAD:SOT:C-1 · ALANDUR:SAL-2:C-2 · GUINDY:SGU:C-1 · LITTLE MOUNT:SLM:C-1 · SAIDAPET:SSA:C-1 · NANDANAM:SCR:C-1 · TEYNAMPET:STE:C-1 · AG-DMS:SGM:C-1 · THOUSAND LIGHT:STL:C-1 · LIC:SLI:C-1 · GOVERNMENT ESTATE:SGE:C-1 · CENTRAL METRO:SCC-2:C-2 · HIGH COURT:SHC:C-1 · MANNADI:SMA:C-1 · WASHERMENPET:SWA:C-1 · THIYAGARAYA COLLEGE METRO:STC:C-1 · TONDIARPET METRO:STR:C-1 · NEW WASHERMENPET METRO:SNW:C-1 · TOLLGATE METRO:STG:C-1 · KALADIPET METRO:SKP:C-1 · THIRUVOTRIYUR METRO:STV:C-1 · THIRUVOTRIYUR THERADI METRO:STT:C-1 · WIMCO NAGAR METRO:SWN:C-1 · WIMCO NAGAR DEPOT:SWD:C-1.
(Interchanges appear twice: Alandur SAL-1/SAL-2, Central SCC-1/SCC-2.)

**Station Group** ✅ /station_group — Group name, Mapped stations: LINE-1, LINE-2, TEST.

**Other masters** (✅ = page opens; buttons listed are the ones shown to this login — none were used):
| Master | Route | What it holds (columns · values) | Add/Edit shown |
|---|---|---|---|
| Quick Links | /quicklinks | 4 groups, 20 links (CMRL, Monthly submission, ODMS, Operations) shown as cards | — |
| Cab Pass Print Instructions | /cabpassinstructions | Editable list of instruction points printed on the pass (6): valid cab pass + ID card; **max 3 persons in cab incl. train operator (SI No. 08 to MRGR 2013)**; phones silent, no use in cab; one person per pass; **valid 6 months from issue**; return to OCC on expiry. Add point, Remove, Preview, Save | Yes (form) |
| Cab Pass Purposes | /cabpasspurpose | "Configure default purposes" text: Visual inspection / On-board monitoring / Trouble shooting / Training / Rescue | Yes (form) |
| Cab Pass signature settings | /allowepicuser_for_capbass_request | "Cab Pass Master Settings Control — manage signature, profile photo and designation rendering on Cab Pass sheets" | — |
| Epic Station Control | /epic_station | 🔒 **403** "User does not have the right permissions" | — |
| Asset Name / Category | /assetnamemaster, /assetcatmaster | Asset name + category; category code + name (0 rows here). Filter, exports | — |
| Mock Drill Calendar | /safetyofficermockdrillscenarios | Scenario, Frequency, Category, Year, Drills planned / scheduled / remaining / completed, Progress | — |
| Mock Drill Schedule | /safetyofficermockdrillschedules | Sh-Id, Scenario, From/To date, Progress, Status. Modals "Create Mock Drill Schedule", "System Operational Parameters" | (modal exists) |
| Mock Drill Re-schedule History | /safetyoffficer-mockdrill-reschedule-history | Schedule ID, Scenario, Old dates, New dates, Rescheduled by, Remarks, Rescheduled at (+ analytics) | — |
| Mock Drill Category | /safetyofficermockdrillcategory | ID, Name, **Roles** | — |
| Acts | /act | Act name, Act file, Code, Description (O&M Act) | — |
| LMC Service Name & Operator | /lmcservicenamemaster | Services (name, operators) + Operators; Add modals "Add LMC Service Name" (name*, operators*), "Add LMC Service Operator Name" | Yes |
| LMC Service Type | /lmc_vehicle_type_master | Station, Service, Operator, **Paid/Free**, Seating capacity, Total vehicles; Add Service | Yes |
| LMC Marketing Type | /lmc-marketting-type | Type, Description (e.g. "Metro Connect Exclusive Connectivity to Corporates"); Create/Edit/Delete | Yes |
| LMC Trip Route | /trips | Station, Route ID, Pick from, Drop at, Service, Operator, Total vehicles, Deployed vehicles, Seating capacity | — |
| Rack No. (L&F storage) | /racks | Rack name (E43, D108…), Status Active/Inactive; Create Rack (Rack no*, Status*), Edit | Yes |
| Assistance Provided | /assistance_provided | **Passenger-assistance types + counting method**: Wheelchair person & Visually impaired = "Method 1 (In/Out data)"; First aid provided & Separated person = "Common data". Add modal | Yes |
| Manage Directory | /manage_manual_directories | Manual folders with **"Visible to" designations** (per-folder designation checklist) | — |
| Distribute Amount Station | /dis_amount_station | Imprest amount distributed across a station group (LINE-1, LINE-2, TEST) | — |
| Epic Organization | /epicorg | 46 contractor organisations (BVG India, NEC, WAPCOS, …); Add Organization | Yes |
| Essential Items | /items | Item, **Frequency**, Created at (Raincoat, Hand tally counter, Checking emergency contact numbers in SWO, Queue manager, Point clamp, Pad lock, Crank handle, Rubber gloves, First aid kit, Megaphone…); ADD ITEMS | Yes |
| Floating Cash | /floatingcash | Station, Allocated cash (42 stations); Add, Edit, Delete | Yes |
| Failure Section | /failure_section | Title (station or section e.g. "SNW to STC"), Station — 32 rows; Add | Yes |
| Holiday | /holiday | Holiday name, Date, Year, Is active; Add Holiday | Yes |
| Hot Keys | /hotkeys | Station, Short word, Description, Is active; Add HOTKEY | Yes |
| Imprest Station Group (Unified) | /station_grp | Group name, Mapped stations, **Total cash** | — |
| Expense Master | /expense_master | Imprest expense categories: First aid kit & medicals; Hardware; Material shifting & service maintenance; Refreshments; Stationery, print-outs & consumables; Stickers, banners & promotional activity | — |
| Manual | /manual | 96 manuals: Manual name, Version, File, Description, **Kept in folder** (station working orders per station, station/special instructions…) | — |
| Mode of Operations | /master/mode-of-operations | Name (0 rows visible; used by Caution Order: ATO/ATP/CUT OUT/RM) | — |
| Point Number | /pointnumber | Station, Point, CHK; **Download Excel template / Import Excel** (modal: choose file*) | Yes (import) |
| Room & Key | /room | Station, Room code, Key hive, Key no, **Lock type** (Physical/Electronic/Both), **Level** (Concourse / LHS / MIDDLE / RHS / Paid / Unpaid, Mechanical level, Platform …, Street …, Undercroft …), **Line** (UP/DN/NA), Remark | — |
| Scenario Entries (IMP) | /scenario | 80 rows: Failure section, Corridor, Mapped station, Scenario, **Power block, Traffic block, Cases, Service plan**, Image — the incident management plan per section | — |
| Scenario Master | /scenario_master | 57 scenario codes (1a…1g, 2a, 2b, 3a…); Edit/Delete with "Confirmation!!!" modal | Yes |
| Shop | /shop | Station, Shop name, Penalties, Code, Licence, Area, Location, LOA details, From, To, Years, Description, Status (PD register) | — |
| Task and Event | /tasksevents | 55: Task/Event, Stations (View stations), Description (message to SC/SI), Start/End date-time, Is active, **Acknowledged stations**, Created at | — |
| Track Circuit → Mast mapping | /track_circuit, /track_circuit/create | 548 rows: Corridor/line, Location, Track circuit no, Start (chainage, mast no), End (chainage, mast no). Create form: Corridor*, Line & direction*, From station*, To station (optional), Track circuit no*, Start chainage*, … | Yes (create page) |
| Incident Class | /incident_class | **A Collision · B Fire and/or explosion in train/system · C Derailments · D Other train accidents · E Security threats · F Indicative accidents · G Accidents not classified · H Failure of rolling stock · I Failure of track & structures · J Failure of electrical equipments · K Failure of signalling & telecommunication · L Other incidents**; Add | Yes |
| Incident Sub-Class | /incident_subclass | Class, Name, Code, Description (≈76 sub-classes, e.g. A1–A5 collisions) | — |
| Train Traffic Plans | /incident_plans | 76: Class, Heading, Code, Plans (action plan text per sub-class) | — |
| Corridor & Line | /master/station-routes | Route name, Line (UPLINE/DOWNLINE/BOTH), Stations, Status | — |
| Trains | /train | 52 train sets (101…152) | — |
| WGO: Access Request | /access_request_master | (empty page for this login) | — |
| WGO: Equip Vehicle | /wgo_equip_vehicle_master | RGM, OMV, RRV; Add/Edit/Delete | Yes |
| WGO: Lights | /wgo_lights_master | Upline, Downline | Yes |
| WGO: Movement From | /wgo_movement_from_master | location names | Yes |
| WGO: Parking Location | /wgo_parking_location_master | e.g. "SAP DN SDG 1" | Yes |
| WGO: TVS Fan Status | /wgo_tva_fan_status_master | Upline, Downline | Yes |
**Station Items Master** ✅ /station_items — Station, Mapped items (per-station document/manual assignment for Assurance: Manual ID, Name, Category, File, Read status, Accept).

### 2.11 PTW (Permit To Work)
- **Local PTW Requests** ✅ /localpermit "Local Permit Work Requests — Station SC/SI approval & management dashboard".
  - Tiles: PTW issue pending, Timing extension pending, Cancel pending, PTW approved, Not-cancel pending, Extension approved, Cancel approved, Rejected, Total.
  - Filter: search, From/To date, PTW issue status (Pending/Approved/Rejected), PTW cancel status (No cancellation/Cancel pending/Cancel approved/Cancel rejected). Exports.
  - Columns: #, Permit ID (STST-L-00012), Name & ID, Department, Req date, Time (from–to), Work desc, Materials, Status (ISSUED…), Extend (EXTENDED), Cancel (CANCELLED), Action (View, Approved/Request Issue Permit → /req_approved_view/{permit}, Approved Cancel Permit → /req_cancel_view/{permit}, View images (n)).
  - **Extension Request** modal (SC/SI decision): Action* Approve/Reject, Date*, From time*, To time*, Reason for rejection*. Not used.
  - **Register Settings** (list report header): Document name "Local Permit Register", Display name "LOCAL PTW REGISTER", ISO no **CMRL/OPER/SO/R-12**, Rev 00, Date 2022-09-01. **Record Settings** (single permit header): "Local Permit Record", "LOCAL PTW FORM", **CMRL/OPER/SO/F-12**, Rev 00, 2022-09-01. → the old system keeps **two header configs per module: Register (list) and Record (form)**.
  - **Issue form** ✅ /req_approved_view/{permit} "Local Permit – Issue (Original Copy)", Doc CMRL/OPER/SO/F-12 Rev 00: station name/code, date, permit no, time; statement "I {name}, Nominated Person, Employee No, Designation, Department, from {Organisation} require Local Permit to carry out {work category} in Station Area {level} at location {…} from {time} to {time} on {dates}"; ***Time extension request*** line; Description of work; Details of materials/equipment/special tools; staff count CMRL / Contractor; contact TETRA / Mobile; **Nominated-person undertakings** (safety precautions; proper PPE; only tools/equipment with ID; public-area work fenced; track access prohibited; no work with complete shutdown of FACP; 25 kV OHE live; no infringement of track); sign of EPIC/nominated person; "work permitted from … to …"; SC/SI name, emp no, remarks, approved at; station seal; signature.
  - **Cancellation form** ✅ /req_cancel_view/{permit} "Local Permit – Cancellation (Original Copy)", F-12: certification that the permit is cancelled at {time} and (1) site clear of men (CMRL n, contractor n), (2) equipment/tools cleared, (3) no infringement to public and traffic, (4) debris cleared; personnel details (nominated person, designation & emp no, organisation, department, date & time, contact); signatures.
- **PTW Track Requests** ✅ /ptw/ptwtrack "Station SC/SI approval dashboard": tiles Issue pending, Timing ext pending, Cancel pending, Approved, Ext approved, Cancel approved, Cancel rejected, Rejected, Total. Columns: #, PTW no, Status, Extend, Cancel, **Cancel station**, Work date, Work type, EPIC name, Emp no, Designation, Department, Organization, Work desc, Materials, Action (View, Approved permit → /ptw/view-ptwtrack-request-form/{id}, Approved cancel permit → /ptw/view-ptwtrack-cancel-form/{id}, View images).
  - **Track PTW issue form** ✅ "Permit To Work – Issue (Original Copy)", Doc **CMRL/OPER/SO/R-XX** (placeholder number) Rev 00 01/06/2026: (i) PTW **with engineer possession** — power block required Y/N; (ii) without engineer possession; statement by Authorised Person/EPIC (rank JE or above) with **competency certificate no**; station area and/or **track area of viaduct/tunnel between {stn} and {stn}**, mast nos; **earth rod fixed location** at mast no with maintenance-staff PN and station PN; duration; **closing station**; extension request; description (planned/unplanned); materials/vehicles/equipment; staff count CMRL/contractor; TETRA/mobile; authorised-person undertakings (PPE, tagged tools, safe train movement on other track, sharp look-out, earth rods either end before shadow power block, …).
- **Active PTW** ⚠ /activeptw (dashboard "View all permits") → **Internal Server Error (PHP ParseError in all_active.blade.php)** shown as a Laravel debug page. Not capturable.

### 2.12 WGO (Work Granting Order)
- **Power Block Timing** ✅ /power_block_timing "Normal Powerblock Hours Master": Corridor 1 start*/end*, Corridor 2 start*/end* (time). "Go to Custom Date Page" (date-specific override).
- **Train Parking Induction** ✅ /train_parking_induction_master "Default configuration": Start range*, End range* (number), additional items, Add item, Update configuration; tabs Default master / Custom date master.
- **Train Parking Induction Values** ✅ /customized_train_parking_induction_master: columns SL, Station, Platform, Parking, Inducting, Actual value; Filter, Add (modal "Add Record": Platform (station)* — DN SD / PF-1 / PF-2 / UP SD per station (~99 options), Date*, Parking train no*, …).
- **WGO** ✅ /wgo — tabs **Normal / Special / Emergency / Approved WGO**, each with a **week strip** (7 day cards with WGO count, "Week: 03 Oct 2026 – 09 Oct 2026").
  - Normal summary: Total, Draft, Pending OCC, Modified, Cancelled. Special summary: Total, Draft, **Pending HOD, Pending Op HOD**, Pending OCC, Modified, Cancelled.
  - Filters: Line (Line 1/Line 2), Power block (Yes/No), Status (**New request, Pending HOD, Pending OP OCC, Pending OCC, Approved by OCC, Cancelled by OCC, Auto modified**), Department (20). Page size.
  - Columns: #, Date, WGO-ID, Line, From station, To station, Power block, Work description, Dept, Status, Send application, Action (View → /wgo_preview/{id}, Edit → /wgo/edit/{id}, Delete). Buttons Export Excel/PDF, **Forward to TTM Dept** (approved list).
  - **Preview** ✅ /wgo_preview/{id} "WGO Request" (Print report): WGO no, date, mode; 1 General (work name, department, from/to station); 2 Schedule & status (start date, NIGHT, from–to time, status "New application applied"); 3 Safety & power block (power block, **OHE 2 m vicinity**, OCC control req, room access); 4 Vehicles & movement (vehicles required, platform free req, movement from/to, required vehicles with power block, selected platforms); 5 Systems request (lights, TVS fans, **OC500/OC111**, TETRA affect); 6 Remarks.
  - Create/Edit form (/wgo/edit/{id}) not opened (edit screen of a live record — avoided).

### 2.13 Customer Care
- **Show Complaints** ✅ /complaintsdata "Passenger Complaints List": exports. Columns: Serial no, Passenger name, email, phone, Complaint from station, Station (place), Mode, Complaint category, Description, Date of complaint, Image, Status, Send email to department, Actions.
  - **Assign Complaint** modal (per complaint): Complaint source (Customer care mail, Feedback from mail, CMRL mobile app, CMRL website, Other → other source text), passenger phone (ro), complaint received date* (ro), target date start*, category (General query / Complaint / Suggestion / Appreciation), department (20), **class (A/B/C)**, name* (assignee), description, target days*, target date end* (computed, ro), status (Open). Not used.
  - **Send Email To Department** modal: To, CC, Subject, Message. Not used.
- **Customer Care Register** ✅ /customer_care "Customer Care Management Register": exports. Columns: #, Complaint no, Passenger name, phone, email, Description, Source, Station, Date recorded, Target date (start), Category, Department, Remarks, Class, Target days, Target date, **Complaint closed date, Difference in date** (SLA), Status, Class, **Close complaint**, Action. No rows for this login.

### 2.14 Station Shift Diary (old)
- **View Diary** ✅ /stationdiary: header (station, SC name, emp no, date, sign-in time, sign-out time), clock; **Hot keys** (buttons incl. "BANK"); Upload image; **Generate PN number**; Log diary (message textarea, image png/jpeg/gif, importance radio); **Task & Events** panel (broadcast task text, "Complete by" date-time, Completed); **Follow ups**; **Floating cash widget (Allocated ₹ / Actual ₹)**; day navigation ⬅️ ➡️; filter All / Important ⭐; filters (Shift A/B/C/B1/G, keyword, importance, date range); Export Station Diary as PDF; "Submit and View Your Shift Summary" (summary modal: Submit, Print); Edit message modal (rich text: bold, italic, bulleted, numbered, block quote, undo/redo; Update message).
- **Shift Summary** ✅ /station-diary-filterpage: display mode (Register vs **Booklet view** toggle); Yesterday's and Today's shift status per shift (A/B/C: attendance or "No attendance"); Activity summary (total logs today, important entries); Generate PN; Filter (date range, shift, employee name/ID, diary status Pending/Submitted); exports; table SL, Date, Shift, Station, Emp name, Emp ID, Diary status, Handed by, Taken over by, View (book icon). **Booklet controls**: page size 5…1000, date range, shift, name, emp ID, keyword, important-only; Print booklets.
- Already rebuilt in the new ODMS (Station Diary module). Differences to keep in mind: old shift filter has **B1**; old diary shows floating cash (removed by product-owner decision).

### 2.15 Asset
Asset categories: CONSUMABLES, ESSENTIAL ITEMS, FURNITURE, GENERAL, LMC, MANUALS, QUEUE MANAGEMENT, REVENUE, SECURITY. Asset code: `OPN/{STN}/{catCode}/{NAME}/{seq}` (e.g. OPN/STST/E/CRANKHANDLE/CRANKHANDLE/0002, OPN/STST/A/PLASTICCHAIR-COMMON/CHAIR/0001). Status: Working / Not working (defective) / Scrap; plus Received / Moved out.
- **View Assets** ✅ /assetmanagement "ASSETS LIST – {STN}": tiles Total, Working, Defective, Scrap, Received, Moved out; **category-wise summary** (per category W/D/S counts). **QR Print** (→ /assetmanagement/multiassetgenerate-qrview, bulk QR labels). Filter: Asset code, Category, Name, Sub-category, Status. Columns: SL, Date, Time, Asset code, Name, Category, Sub cat, Image, Description, Location, Origin, Status, Defect image, Remarks, Report date, Emp ID, Emp name, Reported by name/ID, View, Action.
  - **Asset detail** ✅ /assetmanagement/viewassetinfo/{id}/info = official form **CMRL/OPER/SO/F-17 Rev 00 (01-Sep-2022) "Asset Detail Report"**: 1 Asset information (code, name, category, sub-category, status, date), 2 Location (origin station, current location), 3 Description & remarks, 4 Images. Print, Back.
- **Asset Request** ✅ /asset-requests "Asset requests to Line Manager/SC": Request For Asset → /asset-requests/create **🔒 403**; Requests from SC → /asset-requests/screquestspage (incoming requests from stations: request station, qty, requester, reason, status, approved/rejected by, rejected reason, actions); Asset Movement History → /asset-movements/historymainpage (tabs Assets moved to / moved from: asset, from/to location, date-time, moved by). Columns (own requests): Req time, Req ID, Requested to, Category, Name, Subcategory, Quantity, Reason, Status (Approved/Pending/Rejected), Moved from, Moved assets, Approved by, Rejected by, Rejected reason, Actions.
- **Asset Maintenance** ✅ /assetmaintenence: Asset code, Category, Name, Subcategory, Date of maintenance, Remarks, Recorded by (ID, name), Maintained at, Status, Action.
- **Asset Disposal** ✅ /assetdispose: Req station, Asset code/name/category/sub-category, Location, Date of request, Remarks, Status, Asset status, Rejected remarks, **Disposed image**, Approved by (ID, name), Requested by (ID, name), Date of disposal, Action. Flow: request → approve/reject → disposed.
- **Asset Audit** ✅ /periodicassetaudit "Periodic Audited Assets Report": audit % for the month; columns Station, Asset code/name/category/sub-category, **Audit M/Y**, Status, Employee. Enforced monthly per station (Station Periodic Audit Configuration → middleware blocks until audit done).

### 2.16 Registers — second pass (additions to notes.md)
Probe of every register page for create/edit links and dialogs present in the page for this login:
| Register | Add/create available to this login | Dialogs in page |
|---|---|---|
| Caution Order | No | Filter (11 fields) |
| Assurance | No (docs via Masters) | **ISO Document Setting** (5) |
| Cab Pass requests / passes | No | Passes: **Update Receiver Name** (receiver name*) |
| Passenger Assistance | No | — |
| Essential Equipment | Entry via **dashboard pop-up** (weekly checklist) | Filter (6) |
| Incident | Create page exists (/incident/create, captured) but no button on list | — |
| Imprest | No bill-entry screen | Forward, Refill receipt, Invoice details, Attachments |
| Key Register / requests | No (requests raised by workers outside ODMS) | Filters (10–14 fields) |
| LMC Asset Fault / Audit / Trip Sheet | No | Filter + read-only detail dialogs |
| Parking (Long Halt) | No | — |
| Local Traffic Regulation | No | Filter + detail dialog |
| Manual Point Operation | "Add Entry" shown → **403** | — |
| Mock Drill | No | — |
| PD Management | No | Filter + detail dialog |
| Possession (Local/Track) | No (raised in PTW) | — |
| Train Traffic | No (OCC) | — |
| **TSR** | No create; per-TSR **Extend** (new end time*, reason*) → "Request Extension"; **Cancel** (cancellation date*, time*, reason*, on-duty TC) → "Submit Cancellation" | yes |
| **TSR Signaling** | — | **Implementation form** (implementation remarks) → "Implement Cancellation" |
| WGO Register | No create; bulk Delete selected | — |
None of these actions were used.

### 2.3 Login (seen 25/09 when the session had expired) — /login
- Employee ID, Password (show/hide), **Select Station** (56 options incl. ADMIN, AG-DMS, stations, Depot, HELP LINE…; appears after Employee ID), **Select Shift** (loaded for the station), Captcha (refresh), Remember me, Forgot password (/forgot-password). Station/shift options are configured in Employee Operations › Role-Based Login Control Panel (/logindropdownmaster).

## 3. Access matrix (this login)

| Area | Accessible (view) | Restricted / not shown | Errors |
|---|---|---|---|
| Dashboard | KPIs, charts, activity, PTW tracker, quick links, Essential Equipment weekly pop-up, Assurance declaration | Generate PN (not tested — creates data) | Relative times wrong ("from now"); raw expiry decimals |
| User menu | Profile, update photo/signature, change password, notifications | — | — |
| Read Manuals & Acts | Folders, files, acts | — | — |
| Roles | — | 🔒 no sub-items | — |
| Private Number Book | List + filter | Generate PN form (not opened — creates data) | — |
| Employee Operations | Role-based login panel, station audit config | 🔒 Employee Management (no sub-items); edit/delete/add not used | — |
| Epic List | Nodal view, HOD view, preview | Create/approve screens not shown | — |
| Lost & Found | Current/all found lists, images, register, summary reports (F-38), LIR lists + detail (F-39), remitted to bank | 🔒 **Add Found Items → 403** | — |
| Masters | ~50 masters readable; add/edit buttons shown on ~20 | 🔒 **Epic Station Control → 403** | — |
| Registers (23) | All list pages; views/forms listed in notes.md | 🔒 **Manual Point Add → 403**; no create on most registers | ⚠ **Metro Connect → 500** (debug page) |
| PTW | Local & Track dashboards, issue/cancel forms, settings | Approve/extend actions not used | ⚠ **Active PTW (/activeptw) → 500 ParseError** |
| WGO | Power block timing, parking induction, values, WGO tabs, preview | Create/edit not opened | — |
| Customer Care | Complaints list, register | Assign / email actions not used | — |
| Station Shift Diary | Diary, shift summary, booklet | Logging not used | — |
| Asset | Assets, detail (F-17), requests, SC requests, movements, maintenance, disposal, audit | 🔒 **Request For Asset → 403** | — |
| Login | Fields incl. station & shift | — | — |
| Guessed URL | — | — | ⚠ /imprest/create → 500 debug page (first pass) |

Permission model (from the debug trace): Laravel + spatie/permission — per-feature permissions such as `view metroconnect`, `edit metroconnect`, `delete metroconnect`; roles are the 10 in the Role-Based Login Control Panel (test, Training cell, admin, assetaudit, Revenue Controller, Traffic Regulator, Traffic Controller, LostAndFoundOffice, Helpline, Station Incharge) plus department/EPIC/HOD/nodal/safety-officer/LMC users seen in data.

## 4. Gaps for the full-access pass

Restricted or not visible with this login — to capture with full-access credentials (nothing here was assumed):
1. **Create forms**: Caution Order, TSR request, WGO create/edit, Local PTW request, Track PTW request, Key takeover/handover request, Passenger Assistance entry, Imprest bill entry, Parking entry/exit, PD inspection, Local Traffic Regulation, Metro Connect, Manual Point Operation (403), Mock Drill entry, LMC asset fault / audit / trip sheet, Train Traffic (OCC), Cab Pass request, EPIC create, Lost & Found add (403), Asset request (403), Generate PN form.
2. **Approval screens**: PTW issue/extend/cancel approval, WGO approvals (HOD → Op HOD → OCC), Cab Pass HOD/OP-HOD, EPIC HOD approval, Mock drill review/approval, Asset request/disposal approval, Imprest line-manager side, Key request approval.
3. **Admin**: Roles (permissions per role), Employee Management (users), Epic Station Control (403), Role-based login edit form, Station audit config add form, master add/edit forms.
4. **Other users' views**: OCC (TC/TR), department users, HOD/Op-HOD, safety officer, LMC operator, Lost & Found Office, Helpline, Revenue Controller, admin.
5. **Broken pages**: Metro Connect (500), Active PTW (500) — ask for screenshots or data from the maintainers.
6. **Data-driven detail**: Found-item detail pop-up (did not open), Quick Access button (no visible effect), Imprest bill entry location, Passenger Assistance entry location.

## 5. Decisions needed from the product owner
- **Shift times**: legacy master A 07–13, B 13–21, C 21–07, G 09:30–17:30, Evening (B1) 14–22 vs new-ODMS rule A 06–14, G 09–17:30, B 14–22, C 22–06. Is B1 needed?
- **Login station + shift**: legacy login restricts stations/shifts per role (Role-Based Login Control Panel) — replicate?
- **Two report headers per module** (Register vs Record, e.g. PTW R-12 / F-12) — adopt in the new export header model?

## 6. Completion pass (29/09/2026)

**Method.** (a) The Ctrl+K menu search is built from the sidebar (no hidden pages there). (b) Read all 134 known pages (GET only) and listed every same-site link inside them without following any automatically: 163 targets → 82 stored files (uploaded images/PDFs), 40 page routes, and delete/approve/status links excluded. (c) Opened each of the 40 pages (forms viewed, never submitted). (d) Re-opened script-loaded masters in the browser and set the table to "All" to read real rows.

⚠ **Security/safety finding:** several destructive actions in the old system are plain GET links (e.g. `/failure_section/{name}/delete`), so merely opening the link deletes data. None were opened. The new system must use POST + confirmation for every change.

**Sub-pages found inside pages (not in the sidebar):**
| Route | Result for this login |
|---|---|
| /lostandfound/Claimant/{id} ("Claim Now" on found items) | ✅ **Claimant Details** form: Do you have LIR enquiry ID (Yes/No) → LIR enquiry ID*, search phone number, **Claimant ID proof*** (PAN / Aadhaar / Voter ID / Passport / Driving licence / Student ID / Other), ID proof number*, **ID proof front image*, back image*, signature of claimant*** (images), person name*, another person name* (witness), claimant photo, remarks. Header shows article type and item name. |
| /tasksevents/acknowledged-stations/{id} | ✅ Task/event acknowledgement: Station name, Shift, Status, Acknowledged by, Completed by |
| /showlast-summary | ✅ Previous shift diary summary (station, "Station Shift Diary", Print summary) |
| /tsr_all_departments | ✅ TSR applications — all departments (department filter; same columns as TSR register) |
| /custom_powerblock_timing | ✅ **Dual corridor power block timing register**: selected date, day name, corridor 1 range, corridor 2 range, remark, actions; + Add custom timing, Excel, PDF |
| /default_train_parking_induction_master | ✅ **Train parking weekly master**: per weekday — parking train no, inducting train no, actual value; edit record per day |
| /export_cabpass | ✅ Cab pass export view: pass no, department, validity from/to, date of issue, type of issue, receiver name; Export Excel / PDF (landscape) |
| /preview-cab-pass-instructions | ✅ print preview of the instruction points (no data fields) |
| /safetyofficermockdrillregisters | ✅ **Pending assigned mock drills**: Sch.Id, Scenario, Assigned to, From, To, Status, Action; filter schedule ID + **21 scenarios** (below) |
| /items/create | ✅ Add essential item: Item name, Frequency (Weekly / Monthly) |
| /incident_subclass/create, /incident_subclass/{id}/edit | ✅ Add/edit sub-class: Incident class* (A–L with headings), sub-class name, code, description |
| /wgo_*_master/create, /edit/{id} | ✅ single-field forms (e.g. Vehicle name*) |
| /station/create, /hotkeys/create, /holiday/create, /epicorg/create, /failure_section/create, /incident_class/create, /lmc_vehicle_type_master/create, /scenario_master/{id}/edit, /asset-requests/create, /manualpointnew/create, /lostandfound/create | 🔒 **403** (Add buttons are shown on the lists but the forms are forbidden) |
| /wgo/edit/{id} | ⚠ **500 server error** |
| /activeptw | ⚠ 500 (as before) |
| /lostandfound/only_current_station/export_all | Exists (all-station L&F register export) — too large to read in one pass; structure same as the station register |

**Mock drill scenarios (21):** ATS control transfer from OCC to station · Auxiliary power supply failure in station · Back-up OCC · Communication failure · EED & EAD operation · Emergency at platform – ESP operation in mainline · Emergency evacuation (train ramp) · Fire at station – first aid hose reel (FAHR) · Fire at station – reinforced rubber lining hose pipe (RRL) · Flood barrier assembly · Man trapped in lift – passenger rescue · MPO mainline · Passenger run over · PIDS/PAS · PSD override and isolation · Rescue mode driving · Station emergency AFC push button operation · Train door failure, door isolation and inhibit · Train failure / stalled – train coupling · Train stalled and parking brake manual release · TVS IBP panel operation.
**Mock drill categories:** ALS; Safety Officer (roles: safety officer, superuser); OCC (roles: occ, superuser, Traffic Controller).

**Script-loaded masters — real values (previously 0 rows):**
- Asset categories (9): LMC, C Consumables, M Manuals, G General, R Revenue, S Security, E Essential items, Q Queue management, A Furniture.
- Asset names (56): scanner combined test kit, HHMD, DFMD, flood barrier, iron cot, cartridge ink, wheelchair access ramp, indoor plant pot, fire hose nozzle, Metro Railway (Carriage & Ticket) Rules, O&M Act, MRGR, tile puller, glossmeter, telescope, parking booth, token counting machine, lock, board, electronics, POS machine, sound box, cash handling machine, conveyor, plastic tray, baggage scanner, pad lock with key, crank handle, point clamp, gum boots, megaphone, stretcher, umbrella, wheel chair, safety helmet, shroud, hand flag, tri-colour torch, rain coat, hi-vis vest, 33 kV gloves, rubber gloves, first aid kit, hand tally counter, expandable barricade, barricade, queue manager, locker, key hive, cupboard, rack, drawer, almirah, table, chair, (test).
- Mode of operations: ATO, ATP, CUT OUT, RM.
- Room & Key: e.g. SIGNALING ROOM / key hive 2 / key 54321 / physical key / Concourse / PF-5.
- Point numbers: 99 (station, point e.g. P100N, CHK e.g. CHK101N) — mainly Wimco Nagar.
- Shop (PD): 1 (Madras Coffee House, penalties 3, PD code, licence, 1000 sq ft, concourse, LOA, tenure, status Expired).
- Corridor & Line routes (6): INTERCORRIDOR up/down (19 stations, Chennai Airport ↔ Central Metro), CORRIDOR2 up/down (17, St. Thomas Mount ↔ Central Metro), CORRIDOR1 up/down (26–27, Chennai Airport ↔ Wimco Nagar Depot). Lines named **Blue Line** (corridor 1) and **Green Line** (corridor 2).
- LMC services (3) & operators (4), e.g. "Free share auto service SAP & Pallavaram parking" by Chennai Share Auto Association; service types paid/free with seating and vehicle counts.
- Holiday, WGO Access Request, Trip routes, Mock drill calendar/schedules: genuinely empty for this login.
- Asset maintenance (3 records, status Working / Not working-Defective), disposal (3; ⚠ a **Rejected** request still shows asset status **Disposed**), audit (22 entries; month/year selector; totals Registered / Audited / Current month), QR generation page (asset code, name, category, image; Generate QR).
- LIF all-station images: filters Station (all 56), Category A–H, Claim status, Location (Available at stations / Moved to L&F office), rows 25–200; cards show "Claim Now" → Claimant form.

**Manual folders (all 16):** Lost and found (0) · Standing order book (0) · O&M Act (5: Act 2002, 2023 amendment, comparison, Jan Vishwas amendments 2026, offences & penalties) · Revenue (2: Business rules v1.0, Business rule 12.1) · OCC & Depot Working (0) · MRGR (3) · Disaster Management (2: manual 2014, plan 2024) · Station working order (0) · Parking policy (7: policy 2021, correction slips 1–2, amendments 3.8.1 & 2.10, tariff w.e.f. 01/02/2025, facilities) · SOP TO (0) · SIGNALING (2: ATS OC111, OC500 manuals) · SOP Station (4: SOP 2017 no.1–8, amendments 4, 5, …) · SAFETY (1: Safety manual 2014) · SOP GENERAL (0) · Station Instruction (20: SI-01 … SI-20, 2022–2026) · Special Instruction (9: SI 1–20, amendments/addenda to no.20, no.12 addendum, no.21–24).

**Still not captured with this login (and why):**
- Contents of downloads/exports (Excel/CSV/PDF files) — would save files to the computer; not done without your permission.
- Found-item "View" detail and the dashboard "Quick Access" button — no visible response when opened.
- All-station L&F register export page — too large to read in one pass (structure known).
- Everything marked 🔒 403 / role-hidden above and in §4 — needs full-access login.
