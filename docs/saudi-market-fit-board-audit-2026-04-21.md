# Saudi Market-Fit Board Audit For Anan Project Creation

Date: April 21, 2026  
Scope: Workspace project creation, project publishing, AI project drafting, broker/developer collaboration, offers, verification, assets, and analytics.  
Standard: Strict Saudi market fit, not MVP leniency.  
Status: Product and compliance audit, not formal legal advice. Final legal interpretation should be reviewed by Saudi real-estate counsel or a licensed compliance specialist.

## Executive Judgment

Anan has the shape of a strong real-estate operating system, but its current project creation flow is not yet credible as a Saudi developer-grade project dossier. The current system is closer to a smart listing creator: it captures title, price, location, description, media, rooms, baths, area, visibility, ad-license number, and private permit attachments. That is useful, but it is not enough for Saudi project marketing, broker authorization, WAFI/off-plan readiness, or regulated public distribution.

Board answer:

- Can a Saudi developer trust this today? Partially, for internal draft inventory and visual presentation. Not yet for regulated project launch.
- Can this be legally/commercially safe for public project marketing today? No, not without stronger FAL, brokerage-contract, ad-license, WAFI/off-plan, and platform-license controls.
- What must be built first? Compliance gates, Saudi project dossier schema, unit/payment-plan model, broker authorization, and publication blocking.
- What should be postponed? AI auto-creation into public-ready workflows, broad public distribution, advanced analytics polish, and marketplace scale features until the trust layer is first-class.

## Market And Legal Evidence

Saudi real estate is large, active, and increasingly regulated. That combination means product trust matters more than fast publishing.

- REGA Real Estate Brokerage Law: electronic brokerage and real-estate marketing are within regulated brokerage/services activity, and practicing brokerage or real-estate services requires REGA licensing. Source: [REGA Real Estate Brokerage Law](https://rega.gov.sa/en/rules-regulations-and-guidelines/rules/real-estate-brokerage-law/).
- REGA advertisement license service: issuing a real-estate advertisement license requires a valid brokerage contract with marketing scope, advertisement purpose, selected advertising channels, real/high-quality property images, and property address. Source: [REGA Real Estate Advertisement License Issuance Service](https://rega.gov.sa/en/rega-services/eservices/real-estate-advertisement-license-issuance-service/).
- REGA/WAFI: WAFI is the official Saudi path for licensing off-plan sales/lease and registering/qualifying real-estate developers. Source: [REGA WAFI Off-Plan Sales and Lease](https://rega.gov.sa/en/rega-services/platforms/wafi-off-plan-sales-and-lease/?currentPage=1&tabActive=Wafi+Projects).
- WAFI license requirements shown by REGA include commercial registration for real-estate development, chamber membership, credit report, developer/landowner agreement, main/sub-developer agreement where applicable, approved architectural/engineering plans, and consulting-office contract. Source: [REGA WAFI Developers](https://rega.gov.sa/en/rega-services/platforms/wafi-off-plan-sales-and-lease/?currentDeveloperPage=1&tabActive=Wafi+Developers).
- REGA electronic platform licensing requires platform-level licensing, technical integration with REGA, privacy policy, terms, complaint handling, National SSO, commercial registration, and Saudi Business Center authentication. Source: [REGA License of Electronic Real Estate Platforms](https://rega.gov.sa/en/rega-services/eservices/licensing-of-electronic-real-estate-platforms/).
- Knight Frank reported 93,700 Saudi residential deals worth SAR 77.5 billion in H1 2025, with residential activity representing about 63 percent of total transaction value. Source: [Knight Frank Saudi Arabia Residential Market Review](https://www.knightfrank.ae/newsroom/article/2025/8/saudi-arabia-residential-market-overview).
- CBRE reported that Saudi residential is moving toward stability with about 70,000 Riyadh units expected over two years and foreign ownership law effects shaping investment communities. Source: [CBRE Saudi Arabia Real Estate Market Review Q4 2025](https://www.cbre.com/insights/figures/saudi-arabia-real-estate-market-review-q4-2025).

## Current Product Details

What exists today in Anan:

- Project form data includes name, price, location, description, short description, amenities, parking, gallery settings, private permit summary/files, rooms, baths, area, status, visibility, images, video, broker id, ad-license number/status, and visibility members. Evidence: `apps/web/app/(ws)/ws/_components/AgUi/AgPropertyForm/types.ts:9`.
- The project form validation requires only basic project/listing fields: name, price, location, description, rooms, baths, image, and optional ad-license/private-permit fields. Evidence: `apps/web/app/(ws)/ws/(zones)/projects/shared/forms/projectFormSubmission.ts:37`.
- The create route validates the form, maps it to a property input, creates the property through the audience-specific zone, attaches images, attaches permit files, then redirects to project detail. Evidence: `apps/web/app/(ws)/ws/(zones)/projects/create/page.tsx:34`.
- The property mapper converts workspace project data into title, address/location, description, price, beds, baths, sqft, status, publication state, media, presentation body, and ad-license number. Evidence: `apps/web/app/(ws)/ws/(zones)/projects/shared/lib/projectViewModel.ts:157`.
- The core property schema is a generic property/listing schema with owner ids, price, beds, baths, sqft, description, media, body, ad-license fields, verification flags, and publication state. Evidence: `convex/_core/schema/properties.ts:14`.
- Developer-side RED creation uses the owner-scoped property create contract and repository. Evidence: `convex/red_zone/properties.ts:77`, `convex/red_zone/repositories/propertiesRepository.ts:57`.
- AI workspace project creation only collects name, city, district, price, rooms, bathrooms, and description before it can create a draft. Evidence: `convex/ai_zone/services/assistantService/types.ts:56`.
- Property verification exists as a separate request path that stores submitted data, attached documents, and patches ad-license status to pending. Evidence: `convex/shared_logic/verifications/index.ts:60`.
- Offers have useful collaboration primitives: public/private visibility, package/case records, commission text, permit status, product status, audience, participants, and stages. Evidence: `convex/_core/schema/offers.ts:46`.

## Problems In Workspace Project Creation

| Finding | Category | Severity | Evidence | Business Impact | Recommended Action |
| --- | --- | --- | --- | --- | --- |
| The project model is actually a listing model. | Critical Missing | P0 | Property schema is title/address/price/beds/baths/media/body/ad-license only: `convex/_core/schema/properties.ts:14`. Form fields mirror the same thin structure: `apps/web/app/(ws)/ws/_components/AgUi/AgPropertyForm/types.ts:9`. | Saudi developers sell projects, phases, units, delivery timelines, payment plans, permits, and broker authorizations. A listing model cannot carry enough trust for developer operations. | Create a Saudi project dossier model separate from, or strongly layered above, generic `properties`. Keep listing fields as a publishable projection, not the source of truth. |
| Public visibility can be selected without a hard compliance gate in the form mapping. | Critical Missing | P0 | `clientVisibility === "public"` maps directly to `publicationState: "published"` in `mapWorkspaceProjectToPropertyInput`: `apps/web/app/(ws)/ws/(zones)/projects/shared/lib/projectViewModel.ts:204`. | This creates regulatory and trust risk because publication is a UI choice, while REGA advertisement licensing requires brokerage contract, marketing scope, channel, images, and address. | Replace direct public mapping with `ready_for_compliance_review`; publish only after verified ad license, broker authorization, and platform compliance checks. |
| Ad-license number is treated as optional text, not a verified license object. | Critical Missing | P0 | `adLicenseNumber` is optional in the form validation: `apps/web/app/(ws)/ws/(zones)/projects/shared/forms/projectFormSubmission.ts:66`; schema stores optional status/expires/request id: `convex/_core/schema/properties.ts:44`. | Saudi users and brokers need to trust ad validity. Optional text does not prove the license is active, tied to this property, tied to a channel, or still valid. | Add structured ad-license records: number, source, status, expiry, purpose, channels, brokerage contract id, issuer verification, evidence files, last checked at. |
| Broker authorization and brokerage contract are not first-class project creation requirements. | Critical Missing | P0 | Form has `brokerId` but creation mapping ignores it; no brokerage contract field is mapped into property input: `apps/web/app/(ws)/ws/_components/AgUi/AgPropertyForm/types.ts:30`, `apps/web/app/(ws)/ws/(zones)/projects/shared/lib/projectViewModel.ts:157`. | REGA ad licensing depends on a valid brokerage contract and marketing scope. Without this, broker distribution can become legally ambiguous. | Add broker authorization workflow before distribution: contract number, parties, scope, dates, marketing channels, commission terms, revocation status, and evidence files. |
| WAFI/off-plan readiness is absent. | Critical Missing | P0 | No project creation field or schema field for WAFI license, developer qualification, off-plan license type, escrow, engineering plans, developer-landowner agreement, or consultant contract. Existing fields are basic property fields: `convex/shared_logic/properties/types/validation/index.ts:22`. | Off-plan projects are core to Saudi developer sales. Missing WAFI fields prevents Anan from being a serious developer project system. | Add an `offPlanCompliance` section with WAFI license number/status, developer registry qualification, escrow account, approved plans, consultants, agreements, and document evidence. |
| Unit inventory is missing from persistence. | Critical Missing | P0 | Detail view has `units: []` in view model fallback, but project creation does not persist unit rows or types: `apps/web/app/(ws)/ws/(zones)/projects/shared/lib/projectViewModel.ts:114`. | Developers and buyers need unit types, prices, sizes, availability, floor plans, delivery, reservation status, and financing eligibility. One price plus beds/baths is not a project. | Add project units and unit types: bedrooms, bathrooms, size sqm, floor, view, price, availability, handover date, payment plan, floor-plan media, reservation state. |
| AI project creation is too thin and can make unsafe data feel complete. | Missing | P1 | AI-required fields are only name, city, district, price, rooms, bathrooms, description: `convex/ai_zone/services/assistantService/types.ts:80`. | AI-created drafts may look operationally useful while lacking all Saudi trust/compliance fields. That trains the organization to create low-quality inventory. | Keep AI creation as `rough draft only`; add post-AI checklist and block publish/distribution until compliance and unit dossier are completed. |
| Location is not Saudi-grade. | Missing | P1 | Form has one `location` string, optional `area`, and maps address/location from the same string: `apps/web/app/(ws)/ws/(zones)/projects/shared/lib/projectViewModel.ts:190`. | Saudi project discovery needs city, district, national address elements, map coordinates, nearby infrastructure, and verified address. One string weakens search, compliance, and buyer confidence. | Add structured location: city, district, neighborhood, street, national address/building fields where applicable, geo coordinates, map pin confidence, nearby transit/landmarks. |
| Payment plans, escrow, and buyer finance are absent. | Critical Missing | P0 | Property create fields include price and bankId only; no installments, down payment, milestone schedule, escrow, subsidy, or mortgage eligibility fields: `convex/shared_logic/properties/types/validation/index.ts:22`. | Saudi buyers compare affordability, financing, payment plans, and delivery risk. Price alone is commercially weak. | Add payment plan model: cash price, starting price, down payment, installments, milestone schedule, escrow reference, bank offers, subsidy eligibility notes, fee/tax disclosure. |
| Legal documents are stored as private presentation material, not typed compliance evidence. | Missing | P1 | Private permit files live inside presentation body and project asset attachments: `apps/web/app/(ws)/ws/(zones)/projects/shared/lib/projectViewModel.ts:216`, create route attaches permit files as project private share: `apps/web/app/(ws)/ws/(zones)/projects/create/page.tsx:58`. | Important documents become visual/private content instead of reviewable compliance objects with expiry, source, status, and required use. | Create typed document records: ad license, WAFI license, title/land proof, brokerage contract, plans, commercial registration, chamber certificate, consultant agreement, CPA/escrow evidence. |
| Offers are ahead of project truth. | Misprioritized | P1 | Offer packages have commission/permit/product status, stages, and participants: `convex/_core/schema/offers.ts:46`. | Rich collaboration on top of weak project truth causes disputes. Brokers may collaborate around projects that are not legally or commercially complete. | Gate offers by project readiness; allow private internal offers earlier, but block public/open offers until compliance and inventory truth are complete. |
| Verification exists but is not wired as the mandatory publish path. | Missing | P1 | Verification request patches ad license to pending: `convex/shared_logic/verifications/index.ts:93`; publish remains a separate property mutation: `convex/red_zone/properties.ts:121`. | A good verification subsystem loses power if public state can be set outside it. | Make verification the only route to `published` for Saudi-regulated project types. |

## Missing Parts

Critical missing parts for Saudi credibility:

| Missing Part | Category | Severity | Evidence | Business Impact | Recommended Action |
| --- | --- | --- | --- | --- | --- |
| Saudi project dossier object | Critical Missing | P0 | Current source object is generic `properties`. | No clean place to hold developer-grade project truth. | Add `projects` or `developmentProjects` with project-level facts, then publish property/listing projections from it. |
| WAFI/off-plan compliance | Critical Missing | P0 | No fields in create validator/schema. | Off-plan developer workflows are not supportable. | Add WAFI status, license, qualification, required documents, escrow, plans, and review state. |
| Developer/company qualification | Critical Missing | P0 | Project creation does not ask for commercial registration, chamber membership, developer registry, or responsible manager qualification. | The workspace cannot prove who is allowed to market/develop. | Add organization compliance profile and bind it to project readiness. |
| Ad-license lifecycle | Critical Missing | P0 | Optional `adLicenseNumber` and status only. | Cannot verify advertisement legality, expiry, purpose, channel, or ownership. | Create ad-license entity with validation evidence and publication blocking. |
| Brokerage authorization contract | Critical Missing | P0 | No contract number/scope/channel/date fields. | Broker distribution and commission rights are unclear. | Add authorization contract workflow and bind brokers/offers to scope. |
| Unit inventory and availability | Critical Missing | P0 | No persisted unit model. | Buyers cannot compare real inventory; developers cannot manage availability. | Add unit types and units with availability, prices, areas, floors, plans, handover. |
| Payment plan and escrow | Critical Missing | P0 | Only price/bankId exists. | Saudi buyer decisioning is weak and off-plan risk is opaque. | Add payment schedule, escrow reference, fees, tax, and bank/subsidy metadata. |
| Structured Saudi address | Missing | P1 | Single `location`/`area` string. | Search, compliance, mapping, and market analytics degrade. | Add structured geography and geo verification. |
| Document evidence system | Missing | P1 | Private permit files are presentation payload. | Legal proof is not auditable. | Add typed document registry with requirement mapping, status, expiry, and access rules. |
| Publication readiness score | Missing | P1 | Publication is a state, not a checklist. | Teams cannot see why a project is blocked or safe. | Add readiness gates: draft, data complete, compliance pending, approved, published, suspended. |
| Saudi market intelligence fields | Missing | P2 | Current analytics are event/project engagement oriented. | Demand analytics cannot explain market-fit by district, product type, budget, payment plan, or buyer profile. | Capture structured demand fields and compare against project inventory. |
| Buyer eligibility and foreign ownership handling | Needs Legal Review | P1 | No buyer eligibility model in project creation. | Foreign ownership framework and restricted/designated areas can affect buyer targeting. | Add legal review track for buyer eligibility, nationality rules, designated zones, and disclosure requirements. |

## Extra Parts

These are not wrong, but they are early relative to the Saudi trust foundation:

| Extra/Early Part | Category | Severity | Evidence | Business Impact | Recommended Action |
| --- | --- | --- | --- | --- | --- |
| Visual gallery sophistication before compliance completeness | Extra | P2 | Form includes cover mode, gallery ratio, slides, and presentation body: `apps/web/app/(ws)/ws/_components/AgUi/AgPropertyForm/types.ts:18`. | Makes an incomplete project look polished. | Keep gallery, but move it after required legal/project facts in the wizard. |
| AI draft creation as a primary creation story | Extra | P1 | AI can create project draft from seven fields. | Creates speed without enough responsibility. | Reframe AI as assistant for data intake and checklist completion, not project creation authority. |
| Offer marketplace primitives before project readiness | Extra | P1 | Offer packages/cases support stages and participants. | Can increase collaboration around incomplete inventory. | Gate open offers by compliance and inventory readiness. |
| Generic `body: any` as a flexibility escape hatch | Extra | P1 | Property schema includes dynamic body: `convex/_core/schema/properties.ts:43`. | Important legal data can hide inside untyped presentation structures. | Restrict legal/commercial facts to typed fields; keep `body` only for visual content. |

## Misprioritized Parts

Things treated as less important than they really are:

| Misprioritized Area | Category | Severity | Evidence | Business Impact | Recommended Action |
| --- | --- | --- | --- | --- | --- |
| Compliance as post-create review instead of pre-publication gate | Misprioritized | P0 | Verification exists separately, while public state can be mapped directly from form visibility. | The system optimizes creation speed over legal safety. | Make compliance checklist the central creation journey. |
| Single project price over unit/payment-plan truth | Misprioritized | P0 | Only `price` is required. | Saudi buyers and brokers need unit-level affordability and payment schedules. | Treat unit/payment plan as core project data, not optional later detail. |
| Media before document proof | Misprioritized | P1 | Image is required; ad license is optional. | Pretty project pages can outrun legal confidence. | Require legal proof for public distribution; require image quality for ad license readiness. |
| Generic project analytics before market validity | Misprioritized | P2 | Project analytics events exist for views/clicks, but missing structured market fields. | Analytics can show engagement without knowing if product is commercially correct. | Add market-fit analytics around districts, budget bands, unit types, payment plans, buyer intent, and conversion blockers. |

## Good/Keep

| Strength | Category | Severity | Evidence | Business Impact | Recommended Action |
| --- | --- | --- | --- | --- | --- |
| Clear owner-scoped RED and broker property boundaries | Good/Keep | P2 | RED creation enforces owner access and delegates to owner-scoped persistence. | Good basis for developer/broker trust and tenant isolation. | Keep and extend to project dossier, documents, units, and offers. |
| Separate verification request subsystem exists | Good/Keep | P1 | Property verification request records status and submitted data. | Useful foundation for regulated Saudi workflows. | Promote it from optional flow to mandatory publication gate. |
| Asset attachment has visibility scopes | Good/Keep | P2 | Create route attaches public project images and private permit files with different visibility scopes. | Good base for document/media access control. | Extend with typed legal documents and role-aware sharing. |
| Offers and cases model collaboration roles | Good/Keep | P2 | Offer case participants include inventory owner, client owner, execution partner. | Good match for Saudi broker collaboration. | Keep, but bind eligibility to project readiness and authorization contracts. |
| AI workspace flow can collect data conversationally | Good/Keep | P2 | Workspace AI project fields and action state exist. | Useful for reducing data-entry friction. | Use AI to fill and validate the checklist, not bypass it. |

## What Should Be Built First

1. Compliance-gated publishing.
   - Replace direct `clientVisibility -> published` mapping with a readiness state.
   - Block public project pages, public search, AI distribution, and open offers until compliance status is approved.

2. Saudi project dossier.
   - Add structured project-level data: developer, project type, city/district/address, project phase, delivery dates, master plan, amenities, permits, WAFI/off-plan status, project documents.
   - Treat generic `properties` as publishable inventory/search projections.

3. Ad-license and broker authorization.
   - Add structured ad-license lifecycle.
   - Add brokerage contract and marketing scope workflow.
   - Add channel-level permission: website, WhatsApp, broker network, social, external portals.

4. Unit inventory and payment plans.
   - Add unit types, units, availability, area, price, handover, floor plans, reservation state.
   - Add payment schedules, down payment, installments, escrow reference, bank/subsidy notes.

5. Document evidence and review console.
   - Convert private permit files into typed compliance documents.
   - Add requirements by project type: ready property, off-plan project, developer direct, broker-mediated.

6. AI as compliance assistant.
   - AI should ask for missing required dossier fields, summarize blockers, draft descriptions, and help map uploaded documents.
   - AI should not create anything that looks publishable from seven fields.

## What Should Be Postponed Or Reduced

- Public/open offer marketplace expansion until projects are compliance-ready.
- AI auto-create as a headline feature until it can enforce the Saudi dossier checklist.
- Advanced visual presentation controls until the compliance and unit data model is complete.
- Broad public distribution and SEO/search exposure until ad-license and platform licensing requirements are operationally clear.
- Analytics polish that reports views/clicks without explaining compliance readiness, inventory depth, payment-plan competitiveness, and district-market fit.

## Clear Board Judgment

Anan should not position the current project creation flow as ready for Saudi developer project launch. It can be positioned as an internal draft inventory and collaboration workspace, with a promising path to become a Saudi-grade real-estate infrastructure platform.

The biggest risk is not UI quality. The risk is that the product makes publishing and distribution feel easy before the legal, commercial, and document truth is complete. In Saudi Arabia, where REGA licensing, FAL advertisement controls, WAFI/off-plan rules, electronic platform licensing, and market trust are central, that is the wrong order.

Decision:

- Do not scale public project publishing yet.
- Do not sell AI project creation as a compliant creation engine yet.
- Do build a Saudi compliance-first project dossier.
- Do use Anan's existing strengths, owner boundaries, verification requests, asset visibility, offers, and AI, as foundations under a stricter readiness model.

Priority order:

1. P0: Publication gate and ad-license lifecycle.
2. P0: WAFI/off-plan and developer qualification dossier.
3. P0: Unit inventory and payment-plan model.
4. P0: Broker authorization and marketing-scope contract.
5. P1: Typed legal document evidence system.
6. P1: AI checklist assistant and project completeness scoring.
7. P2: Analytics, offer marketplace expansion, visual/presentation polish.

Final verdict: Strong platform vision, incomplete Saudi execution layer. The product is directionally right, but the board should require a compliance-first project dossier before treating workspace project creation as market-ready.
