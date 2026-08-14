# Lucknow Health Connect

REAL HOSPITAL IMPLEMENTATION — LUCKNOW

The website is intended to be a real healthcare discovery and appointment platform for Lucknow, Uttar Pradesh.

Do NOT use fictional hospital names in the production-facing interface.

Use real hospitals operating in Lucknow and structure the application so that hospital information can be verified and updated by authorized administrators.

Initial Hospital Directory

Seed the platform with the following real Lucknow hospitals.

Government / Public Hospitals

King George's Medical University (KGMU)

Sanjay Gandhi Postgraduate Institute of Medical Sciences (SGPGI)

Dr. Ram Manohar Lohia Institute of Medical Sciences (RMLIMS)

Civil Hospital Lucknow

Balrampur Hospital

Private Hospitals

Apollo Medics Super Speciality Hospitals

Medanta Super Speciality Hospital, Lucknow

Chandan Hospital

Health City Vistaar

Shekhar Hospital

Regency Multi Super Speciality Hospital

Dr. KNS Memorial Hospital

Use the official hospital name exactly as verified.

Do not invent hospital information.

REAL HOSPITAL DATA

Each hospital record should contain:

Official hospital name

Hospital type: Government / Private

Complete address

City

Pincode

Phone number

Official website

Google Maps location

Latitude

Longitude

Departments

Specializations

Facilities

Emergency availability

OPD timings

Hospital photos where legally/appropriately sourced

Verification status

Last verified date

Add:

✓ Verified Hospital

only after the hospital information has been verified by the platform administrator or an authorized source.

GOOGLE MAPS FOR REAL HOSPITALS

Every registered hospital must have a Google Maps location.

Hospital profile example:

Apollo Medics Super Speciality Hospitals

📍 Kanpur–Lucknow Road, Sector B, LDA Colony, Lucknow

[Interactive Google Map]

Distance from you: 4.8 km

Estimated travel time: 18 min

Buttons:

Get Directions

View on Google Maps

Book Appointment

The map should use the hospital's verified latitude/longitude rather than an approximate fictional location.

REAL DOCTOR DATABASE

Do not create fictional doctors for the production version.

Doctors should be added through one of two methods:

Method 1 — Hospital Admin

Authorized hospital administrators can log into their dashboard and add verified doctors.

Doctor information:

Full name

Photograph

Medical qualification

Medical registration information where appropriate

Specialization

Sub-specialization

Years of experience

Hospital

Department

Consultation fee

OPD schedule

Available appointment slots

Languages

Professional profile

Verification status

Method 2 — Platform Admin

The platform's administrator can manually add and verify doctors based on reliable official sources.

Every doctor should have:

✓ Verified Doctor

when the profile has been verified.

DO NOT INVENT APPOINTMENT AVAILABILITY

Appointment availability must NOT be fictional.

The system should obtain availability from:

Hospital-administered schedules

Doctor-managed schedules

An integrated hospital appointment system/API, where available

If live availability is not connected yet, display:

"Appointment availability will be confirmed by the hospital."

Do not falsely show:

"Available Today at 5:30 PM"

unless the platform actually knows that slot is available.

REAL CONSULTATION FEES

Do not invent consultation fees.

Hospital/doctor administrators should enter:

Consultation fee

Platform fee

Taxes

Other applicable charges

The patient should see the final amount before payment.

Example:

Consultation Fee: ₹800
Platform Fee: ₹20
Taxes: ₹X
Total: ₹XXX

If the consultation fee has not been verified, display:

"Fee to be confirmed by hospital."

HOSPITAL VERIFICATION SYSTEM

Create a verification workflow.

Hospital status:

Pending Verification

Hospital has been submitted but not yet verified.

Verified

Hospital information has been reviewed and approved.

Suspended

Hospital is temporarily removed from active booking.

Display a verification badge on verified hospital profiles.

REAL DATA SOURCE PRINCIPLE

The platform must distinguish between:

Verified Data

Information confirmed by the hospital, official hospital website, government source, or authorized administrator.

Unverified Data

Information collected but awaiting verification.

Live Data

Information received from an active hospital/API integration.

Never present unverified information as live or confirmed information.

CITY-WIDE SEARCH

The homepage should allow:

"Search healthcare in Lucknow"

Search by:

Doctor

Hospital

Specialization

Health concern

Location

Availability

Example:

User enters:

Cardiologist

The platform displays relevant cardiologists from registered Lucknow hospitals.

Example:

Orthopedic doctor near Gomti Nagar

The system displays relevant doctors/hospitals and sorts them by:

Distance

Availability

Hospital

Experience

Consultation fee

HOSPITAL COMPARISON

Allow patients to compare hospitals.

Example:

HospitalTypeLocationSpecialtiesDoctor AvailabilityConsultationKGMUGovernmentChowkMultipleCheck availabilityHospital dependentSGPGIGovernmentRaebareli RoadSuper-specialtiesCheck availabilityHospital dependentApollo MedicsPrivateLDA ColonyMultipleLive/verifiedDoctor dependentMedantaPrivateGolf CityMultipleLive/verifiedDoctor dependentChandan HospitalPrivateGomti NagarMultipleLive/verifiedDoctor dependent

Do not fabricate ratings, fees, doctors, or availability.

PATIENT JOURNEY

The final real-world workflow should be:

Patient opens website

↓

Selects Lucknow

↓

Enters health concern / doctor / specialization

↓

AI Healthcare Assistant helps identify the appropriate department

↓

Platform searches registered Lucknow hospitals

↓

Shows verified doctors

↓

Patient compares doctors

↓

Patient opens doctor profile

↓

Patient sees affiliated hospital

↓

Patient views hospital location on Google Maps

↓

Patient checks available appointment

↓

Patient selects date/time

↓

Patient sees complete payment amount

↓

Patient pays securely

↓

Payment is verified

↓

Appointment is confirmed

↓

Patient receives Appointment ID

↓

Patient receives hospital location + Google Maps directions

↓

Patient receives appointment reminder

IMPORTANT: REAL-WORLD MVP APPROACH

For the first production version, do NOT attempt to connect every hospital in Lucknow simultaneously.

Start with a small number of verified hospitals.

Recommended MVP:

Phase 1

Register:

KGMU

SGPGI

RMLIMS

Apollo Medics

Medanta

Then onboard additional hospitals.

Phase 2

Add more hospitals.

Phase 3

Integrate hospital-specific appointment systems/APIs wherever cooperation and technical access are available.

This prevents the website from pretending that it has live booking access when it does not.

HOSPITAL ADMIN ONBOARDING

Create a:

"Register Your Hospital"

button.

Hospital representative submits:

Hospital name

Address

Registration details

Contact person

Official email

Phone

Website

Departments

Doctors

Appointment system information

Platform admin reviews the submission.

After verification:

Hospital Approved ✓

The hospital receives administrator credentials.

REAL-TIME STATUS

Clearly differentiate:

🟢 Live Availability

Appointment slot is connected to a live hospital/doctor schedule.

🔵 Verified Availability

Hospital has recently provided/confirmed the schedule.

🟡 Confirmation Required

Hospital must confirm the appointment.

🔴 Unavailable

No appointment slot currently available.

This is important because the platform should never mislead patients about appointment availability.

FINAL PRODUCT POSITIONING

The website should NOT look like a fictional hospital listing website.

It should look like a serious Lucknow Healthcare Aggregator & Appointment Platform.

Core promise:

"All Your Healthcare Options in One Place."

Patient experience:

Find → Compare → Locate → Book → Pay → Confirm

Hospital experience:

Register → Verify → Manage Doctors → Manage Slots → Receive Appointments

Platform experience:

Verify → Aggregate → Connect → Manage → Analyze

Build the architecture so that Lucknow is the first city and additional cities can later be added without redesigning the entire system.    MANDATORY GOOGLE MAPS & APPOINTMENT NUMBER REQUIREMENTS

These two features are mandatory and must be fully implemented in the website.

1. GOOGLE MAPS

Every hospital must have a Google Maps integration.

On the hospital profile page, display:

Interactive Google Map

Verified hospital location

Hospital name

Complete address

Distance from patient's location

Estimated travel time

"Get Directions" button

"Open in Google Maps" button

After an appointment is booked, the confirmation page must also display the hospital's map.

The patient should be able to click:

Get Directions → Google Maps navigation to the hospital

Do not use fictional coordinates.

Use the verified latitude and longitude of the actual hospital.

2. UNIQUE APPOINTMENT NUMBER

Every successfully booked appointment must automatically receive a unique appointment number.

Example:

Appointment Number: APP-20260814-00125

The appointment number must be:

Automatically generated

Unique

Stored in the database

Associated with the patient

Associated with the doctor

Associated with the hospital

Associated with the appointment date/time

Associated with the payment transaction

Appointment Confirmation Screen

After successful payment, display prominently:

Appointment Confirmed ✓

Appointment Number

APP-20260814-00125

Patient: [Patient Name]

Doctor: [Doctor Name]

Specialization: [Specialization]

Hospital: [Hospital Name]

Date: [Appointment Date]

Time: [Appointment Time]

Amount Paid: ₹[Amount]

Payment Status: Paid ✓

3. APPOINTMENT NUMBER USAGE

The patient should be able to use the appointment number to:

View appointment details

Check appointment status

Reschedule appointment

Cancel appointment

Contact hospital/support

Identify the booking at the hospital

Hospital staff should also be able to search for an appointment using:

Appointment Number

4. PATIENT DASHBOARD

Under "My Appointments", display each appointment as:

APP-20260814-00125

Dr. [Doctor Name]
[Specialization]

[Hospital Name]

📅 [Date]
🕐 [Time]

Status: Confirmed

Buttons:

View Appointment

View Hospital Map

Get Directions

Reschedule

Cancel

5. DIGITAL APPOINTMENT RECEIPT

Generate a digital appointment confirmation containing:

Appointment Number

Patient name

Doctor

Specialization

Hospital

Hospital address

Google Maps location

Appointment date

Appointment time

Consultation fee

Platform fee

Tax

Total amount

Payment status

Payment ID

Booking date

Include:

"Show this Appointment Number at the hospital reception."

6. NOTIFICATIONS

Send the Appointment Number in:

Email confirmation

SMS confirmation

WhatsApp confirmation, if integrated

Example:

Appointment Confirmed!

Your appointment with Dr. [Name] at [Hospital] is confirmed.

Appointment Number: APP-20260814-00125

Date: [Date]
Time: [Time]

Hospital Location: [Google Maps link/button]

Please carry your appointment number when visiting the hospital.

7. COMPLETE FINAL WORKFLOW

Patient searches for doctor

↓

Selects doctor

↓

Selects hospital

↓

Views hospital on Google Maps

↓

Selects appointment date

↓

Selects available time

↓

Enters patient details

↓

Reviews consultation fee

↓

Makes online payment

↓

Payment successfully verified

↓

System generates unique Appointment Number

↓

Appointment Confirmed

↓

Display Appointment Number

↓

Display Google Maps hospital location

↓

Send confirmation to patient

↓

Patient uses Appointment Number at hospital reception

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1dc1e30a-d304-40a2-968d-24366ca7a2ce).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
