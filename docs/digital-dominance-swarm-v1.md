# Digital Dominance Swarm v1

## Command topology
Apex = supervisor and operator-facing commander.
Digital Dominance Swarm = specialist worker fleet.
Agent 13 Digital Dominance Operator = domain coordinator.
No specialist becomes independent source truth.

## Swarm roles
1. Source Truth Agent
   Resolves approved domains, clients, repositories, templates, locations, service taxonomies, content locks, and existing receipts.

2. Search Intelligence Agent
   Collects Google-compliant keyword, query, SERP, competitor, local-intent, entity, and opportunity evidence. No ranking guarantees.

3. Site Architecture Agent
   Designs URL taxonomy, city/service clusters, canonical strategy, internal linking, sitemap partitioning, crawl budgets, and page-fleet boundaries.

4. Programmatic Content Agent
   Produces differentiated page briefs and content fields from verified business facts. Blocks fabricated reviews, customers, metrics, locations, and claims.

5. Technical SEO Agent
   Owns robots, sitemap, canonicals, redirects, status codes, structured data, Core Web Vitals repair packets, and soft-404 prevention.

6. Local Entity Agent
   Owns NAP consistency, location/service schema, geographic relevance, business entity relationships, and local landing-page evidence.

7. Build Agent
   Implements branch-safe code only. Cannot certify its own work.

8. Browser Validation Agent
   Independently renders pages, checks UX, links, forms, responsive states, indexing directives, and visual regressions.

9. Search Validation Agent
   Re-fetches HTTP state, canonical/robots/schema/sitemap outputs, compares against rules, and prepares Search Console validation packets.

10. Fleet Operations Agent
    Handles queues, retries, duplicate suppression, site generation batches, release candidates, drift detection, rollback pointers, and receipts.

11. Fault-Line Agent
    Adversarially tests thin-content risk, doorway-page risk, duplicate content, spam-policy risk, hallucinated facts, bad redirects, and broken generation logic.

12. Revenue Intelligence Agent
    Ties pages and sites to calls, forms, qualified leads, assisted conversions, rankings, impressions, CTR, and client-level ROI without inventing attribution.

## Pipeline
INGEST
-> RESOLVE SOURCE TRUTH
-> OPPORTUNITY MODEL
-> PAGE/FLEET PLAN
-> CONTENT + SCHEMA
-> BRANCH BUILD
-> TECHNICAL VALIDATION
-> BROWSER VALIDATION
-> ADVERSARIAL VALIDATION
-> APPROVAL GATE
-> RELEASE
-> SEARCH CONSOLE SUBMISSION
-> MONITOR
-> REPAIR

## Quality gates
- unique business value per indexable page
- no doorway or mass-thin-page patterns
- canonical + sitemap + robots coherence
- correct 200/301/404/410 behavior
- no fake reviews/testimonials/customers/locations
- structured data matches visible content
- responsive and accessible frontend
- deterministic generation inputs
- immutable source SHA in receipts
- independent validator PASS before release

## Persistence contract
Use one authoritative heartbeat. Do not create a cron forest.
Preferred durable loop:
queue -> lease -> worker -> validator -> receipt -> next eligible job

## Immediate implementation target
Migrate the existing generic repository agent contract to this swarm model while preserving current Base44 compatibility until each dependency is explicitly replaced or retained.
