# COURSE QC — Mission Fragrances Academy → in-app Course

Source: all 29 lessons pulled from the Academy (Xperiencify) API — text, video, thumbnails, action-task prompts. Read in full. Videos probed (26 have video; total ≈ 1h 45m; each 2–8 min).

## Verdict

**Keep all 29 — one lesson per day of the 30-Day Mission, Day 30 = completion.** The course already has a clean arc (Quick Start → Core Values → Vivid Vision across 7 life areas → execution frameworks → Review/Frame/Broadcast) and the lessons are short. Cutting half would break the Vivid Vision sequence (Module 3's seven areas feed the Module 5 Review). What it needs is not pruning but **de-Academy-ing**: remove points/email-me/platform references, bring the videos and tasks in-app, and fix two real inconsistencies (below).

Day map: Module 1 → Days 1–5 · Module 2 → Days 6–10 · Module 3 → Days 11–18 · Module 4 → Days 19–26 · Module 5 → Days 27–29 · Day 30 → 30-Day Mission Complete.

## Two things Antonio must decide

1. **S.T.A.R. means two different things.** The course (Lesson 1.3) teaches **Select · Take Action · Anchor · Repeat** — the spray ritual (select a value, spray, anchor a memory of living that value for 5–15s, repeat). The app brief defines the loop as **SELECT → TRIGGER → ACT → REINFORCE** (declare action, spray, do it, record it). Recommendation: the app adopts the course's S.T.A.R. as the *ritual* shown on the Trigger screen ("Select → Take Action (apply) → Anchor (recall a moment you lived this value) → Repeat"), and the Mission loop keeps its own name (“Declare → Trigger → Act → Record”). Onboarding screen C currently teaches the brief's version — it must change to whatever he picks.
2. **The course's daily mantra is literally a Mission.** 17 lessons end with *"Today, I'll take one small courageous action to honor my commitment to being my best self"* + *"What Scent Trigger did you use today?"* That IS the app's Mission loop. Recommendation: every lesson page ends with **"Today's Mission → Start a Mission"** (pre-selecting the lesson's trigger where relevant), and completing that Mission is what the course calls the courageous action. This unifies Course Reps and Mission Reps into one system instead of two.

## What changes per lesson (QC pass)

Legend: KEEP = content as-is · EDIT = copy fix · REWORK = structural change. Tasks = action tasks become in-app prompts (stored as *lesson responses*), not Xperiencify checkboxes.

| Day | Lesson | Video | Verdict | Notes |
|---|---|---|---|---|
| 1 | Welcome & Get Started | 2:10 | EDIT | No text in source — write a 3-line intro under the video. Resources are Xperiencify sample PDF/MP3 — drop. |
| 2 | Mission Fragrances Set Overview | 3:27 | KEEP | Great. Scent-note images (Honor/Courage/Commitment charts, atomizer how-to) bring in-app. Task: "Which Scent Trigger are you most drawn to, and why?" |
| 3 | S.T.A.R. System | 7:49 | EDIT | Remove "lifetime member of my exclusive Academy". Keep the 4 STAR graphics. Task: go through S.T.A.R. once → **Start a Mission**. See decision #1. |
| 4 | 30 Day Mission Challenge | — (no video) | REWORK | Entire first half is about 1000 MF Points + a gift — obsolete. Keep "The Importance of Consistency". Rewrite intro: the 30-Day Mission in the app = one lesson + one Mission a day; Reps are the evidence. Task: "I commit to 30 days." |
| 5 | Mindset To Succeed | 4:00 | EDIT | Remove "final lesson of Module 1 / In Module 2…" navigation lines. Keep Coachable / Take Action / Be Patient / Growth Mindset. Task: commitment checkbox. |
| 6 | Your Legacy | 3:59 | EDIT | "send your eulogy to me" → write it in-app (stored). Drop sample resources. |
| 7 | The Importance of Honor | 2:44 | KEEP | Task: 3 examples of being honorable (stored). + Start an Honor Mission. |
| 8 | The Need for Courage | 2:27 | KEEP | Task: 3 examples. + Start a Courage Mission. |
| 9 | The Power of Commitment | 2:06 | KEEP | Task: 3 examples. + Start a Commitment Mission. |
| 10 | Shrine to Self-Improvement | 3:27 | EDIT | Remove "In Module 3…" lines. Task "email me a photo" → optional "Share with Antonio" mailto; in-app checkbox "My shrine is set up". |
| 11 | Why You Need a Vision | 5:04 | EDIT | Keep. Frame/markers Amazon links → optional. Task: "one courageous action today" → Start a Mission. |
| 12 | Your Reputation | 5:37 | KEEP | 4 essay prompts + trigger question. Store answers; trigger question → Start a Mission. 10 action ideas → offer as Mission suggestions on that day. |
| 13 | Relationships | 4:28 | KEEP | Same pattern (vision / steps / obstacles / one action). |
| 14 | Career & Business | 3:16 | KEEP | Same. |
| 15 | Health | 4:14 | KEEP | Same. |
| 16 | Wealth | 3:48 | KEEP | Same. |
| 17 | Lifestyle | 3:16 | KEEP | Same. |
| 18 | Social Impact & Legacy | 4:02 | KEEP | Same. |
| 19 | Mindset for Your Vivid Vision | 4:51 | EDIT | Remove "Great job getting through Module 3". |
| 20 | Pareto Principle | 4:53 | KEEP | Task: where to apply 80/20. |
| 21 | Essentialism | 4:07 | KEEP | |
| 22 | 1% Better Daily | 2:53 | KEEP | |
| 23 | Doing Nothing vs Doing One Thing | 2:45 | KEEP | |
| 24 | Latent Potential | 3:59 | KEEP | |
| 25 | Identity-Based Decision Making | 4:46 | KEEP | |
| 26 | SMART Goals | 3:09 | KEEP | Task: write one SMART goal (stored). |
| 27 | Review — Your Vivid Vision | 3:30 | REWORK | Source relies on Xperiencify merging essays into `{VIVID_VISION}`. In-app: compile the user's stored answers from Days 12–18 into a "Your Vivid Vision" page, editable, then confirm. |
| 28 | Frame | — | REWORK | Source = AI image emailed by the platform. In-app: a clean printable "Vivid Vision" page (Save as PDF / print) + "I've printed and framed it". No AI image in V1. |
| 29 | Broadcast | — | EDIT | Share via device share sheet; "schedule a date 3 years out" → one-tap calendar (.ics); "share with me" → optional mailto. |
| 30 | **30-Day Mission Complete** | — | (app) | Existing completion screen + certificate request. |

Global removals: every "MF Points", "email it to me", "lifetime member", "Module N" navigation reference, platform resources (sample PDFs/MP3s). Global additions: every lesson ends with **Mark complete (+1 Course Rep)** and **Today's Mission → Start a Mission**.

## Architecture for "self-contained"

- **Video**: the source streams are public HLS on Xperiencify's CDN. We download the 720p MP4s (≈1 GB total) and host them ourselves so the app never depends on the Academy. Hosting options: Cloudflare R2 (10 GB free, no egress fees — recommended) or Bunny Stream (cheap, adaptive). Supabase Storage free tier (1 GB) is too tight. Player: native `<video>` with poster = lesson thumbnail (also downloaded). Until R2 exists, the app can temporarily stream the HLS directly.
- **Lesson responses**: new table `lesson_responses(user_id, lesson_id, prompt_id, answer, updated_at)` with RLS; powers the Vivid Vision compile on Day 27 and lets a man see what he wrote. Private like reflections.
- **Course ↔ Challenge**: `challengeDay` → today's lesson; Home shows "Day N · today's lesson" card; Course tab lists all days (future days visible but marked "Day N"; not locked — no punishment, Antonio's rule).
- **Content files**: `content/course.ts` becomes the full text (cleaned), prompts, image refs, video file names. Antonio/Yuri edit copy there.

## Effort

Content clean-up (29 lessons, copy edits above): half a day. App rebuild (video player, lesson responses, Vivid Vision compile/print, day mapping, Today's Mission hand-off, remove link-out): ~1 day Opus. Video re-hosting: 1 hour once an R2 bucket exists.

---

## UPDATE — Skool is the source of truth (newer copy, 30 lessons, YouTube video)

The Skool classroom (Brotherhood of Scent → Mission Fragrances Academy) has the **current** text and embeds the videos as **unlisted YouTube** — so no re-hosting is needed; the app embeds YouTube directly (privacy-enhanced `youtube-nocookie.com` iframe, 16:9, poster from `i.ytimg.com`). Source data saved to `docs/course-source/skool-lessons.json` (title, ytId, text as markdown, links, images) and `docs/course-source/academy-lessons.json` (older copy + the structured action-task prompts, useful for in-app prompts).

**Skool has 30 lessons — exactly one per day of the 30-Day Mission.** Module 5 = "Your Vivid Vision Is Coming to Life" (video), "Review Your Vivid Vision", "Broadcast Your Vivid Vision", "Frame". Day 30 = Frame + 30-Day Mission Complete.

YouTube IDs: 1 p1VGPvExpx0 · 2 FCZ7-xwRPWI · 3 _xs_ANlHjJ8 · 4 — · 5 MSSMEO8ZGGc · 6 hbqprG4UFIM · 7 a9yG3pylUKY · 8 NCeKnEezPWs · 9 ihWgFp5H0DU · 10 GCpsEfFp_E8 · 11 NhI4wxne2Hk · 12 AWdD1k2ccJ0 · 13 NGi4l1rNc50 · 14 8UbE1PcGqC0 · 15 co2ZBwcMsjM · 16 GqQmxeLr6GI · 17 qF8IJk2xadQ · 18 oU7fHhMoXoY · 19 odhvU6I3Kz0 · 20 CiNTVRxOgyY · 21 VkA4H2mZNII · 22 MePOS7sTKH0 · 23 FaJhvhVPb9c · 24 qWaP70yaVe0 · 25 ZMBy99RiuvM · 26 QZQjcgh26jA · 27 SwZrllkuszY · 28 — · 29 — · 30 —.

### Skool-specific things to replace in-app (every lesson)
- "Click the check icon (✔️) at the top right to complete this lesson…" → remove (app has MARK COMPLETE).
- "Post inside the Community Tab with #30DayTriggerChallenge / #DailyScentTrigger / #VividVisionFramed" → replaced by the in-app action: **Start a Mission** (the #DailyScentTrigger post *is* a Mission) and **lesson responses** (stored privately; nothing is public).
- "If anything is too personal… send to Antonio via Skool chat" + "Antonio's Skool Profile: Click Here" → remove; responses are private by design. Keep one optional "Share with Antonio" (mailto) on the Vivid Vision lessons only.
- Day 1 has no text in Skool (only the check-icon note) → write the 3-line welcome.
- Day 4: Skool copy still promises "a special gift from Antonio" for finishing in 30 days — keep only if Antonio confirms the gift; otherwise remove that sentence. Points are already gone in Skool's copy.
- Day 11: Amazon affiliate links for frame/markers — keep as optional links (fine in-app).
- Module 5 flow in Skool = user messages Antonio → team hand-writes the Vivid Vision within 72h from the user's community posts. **Decision for Antonio:** (A) keep the human process — in-app button "Request my Vivid Vision" emails the team the user's stored answers (Days 12–18 + SMART goal), team replies by email; or (B) app compiles a draft Vivid Vision from the stored answers instantly (editable, printable) and optionally sends it to the team for polish. Recommend **B with the optional send** — self-contained, instant, still lets the team add the personal touch. The AI image (Day 29/30) stays a team deliverable by email or is dropped in V1.

### Revised day table (Skool order)
Days 1–5 Quick Start · 6–10 Legacy & Core Values · 11–18 The Man You Know Yourself To Be · 19–26 Laws of Men Who Get Sh*t Done · 27 Vivid Vision Is Coming to Life · 28 Review · 29 Broadcast · 30 Frame + Complete. Per-lesson KEEP/EDIT/REWORK verdicts above still apply (shifted by the Module 5 change).
