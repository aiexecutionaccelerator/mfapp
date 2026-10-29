# Curriculum revision 2: summary and to-do

Source: `curriculum-v2-spec.docx` (full text in `curriculum-v2-spec.txt`).
Prepared for Antonio Centeno, 28 Oct 2026. **This is the implementation
contract. The exact copy for all 30 Missions is in the .txt, not here.**

## What changes

Rewrite the 30 Missions into a deliberate progression in four stages. Keep
the mission numbers, the four tabs, the 430px shell, the S.T.A.R. steps,
the black-and-gold look, the completion screen, the Proof Log, Personal Code
and the S.T.A.R. explainer + video.

| Stage | Missions | Purpose |
|---|---|---|
| Build self-trust | 1–7 | Give credit, face avoidance, keep a promise, repair a mistake, ask for help, recall a strength, set a cue |
| Set your standards | 8–14 | Five Personal Code lines (8–12), identity (13), practice one line (14) |
| Put your values to work | 15–21 | Care, self-care, focus, honest review, environment, service; 21 picks a focus area + 7-day aim |
| Build lasting momentum | 22–30 | Use the aim (22–25), recover (26), practice plan (27), repeat (28), share a code line (29), plan the next month (30) |

New titles: 1 Give Credit Where Credit Is Due · 2 Break the Avoidance Loop ·
3 Keep One Small Promise · 4 Own Your Part · 5 Ask Instead of Pretending ·
6 Remember Your Own Strength · 7 Give Your Practice a Place · 8 Define Your
Honor · 9 Define Your Courage · 10 Define Your Commitment · 11 Draw One
Honest Boundary · 12 Choose the Promise That Matters · 13 Name the Man You
Are Becoming · 14 Put Your Code to Work · 15 Make Room for Someone ·
16 Support the Man Doing the Work · 17 Finish One Focused Block · 18 Face One
Useful Fact · 19 Make Your Priority Easier · 20 Be Useful on Purpose ·
21 Choose One Direction · 22 Take the Step You Are Avoiding · 23 Make
Tomorrow Easier · 24 Protect Your Yes · 25 Remove One Recurring Distraction ·
26 Recover Without Excuses · 27 Build a Practice You Can Keep · 28 Repeat
What Worked · 29 Let Someone Support Your Standard · 30 Carry Your Momentum
Forward.

## Per-Mission data (each of the 30)

Stage, title, value, **kind**, time estimate, hook, Select line (value
rationale), Act task, **three "ways to do it"**, Record prompt, **two
examples**, "Done when" rule, optional user note. `curriculumVersion: 2`.

## Record kinds

| Kind | Missions | Counts as an action? |
|---|---|---|
| Action | 1–5, 7, 14–20, 22–26, 28–29 (20) | Yes |
| Reflection | 6 | No |
| Code | 8–13 | No |
| Plan | 21, 27, 30 | No |
| Draft | any unfinished | No, and not complete |

All 30 count toward 30/30. One-Off Actions count as actions but never
toward 30/30.

## Screen and interaction rules

- S.T.A.R. shared wording. S: "Select your Scent Trigger." T: "Spray the
  fragrance and breathe it in." A: "Take one small action that's aligned
  with the value, or recall a time you lived it." R: **"Log what you did,
  recalled, defined, or planned. Completed actions build your evidence;
  plans describe practice still ahead."**
- **New closer:** "Repeat the practice. Let your scent remind you of the
  values you choose to live."
- Order: back, "N of 30", saved state → stage label, title, hook, S.T.A.R.
  reminder link → S, T, A, R. Act holds the task, time and kind, the
  approaches, saved context, the note and Done when. Record holds the
  prompt, a blank own-words field, the examples, mission fields, an optional
  photo and the action confirmation.
- Act options: expandable **"Choose one way to do it"**, helper "Pick the
  option that fits your life, or use your own version of the same task."
  Not radios, not a quiz.
- Record examples: expandable **"Need an example?"**, helper "For
  inspiration. Write what is true for you." **Examples must never fill the
  field** (this replaces tap-to-use and pre-fill).
- Mission 13 is the only pre-filled field: the current identity, or "Keeps
  his word, acts despite fear, and follows through." Viewing it never
  completes it.
- Action missions: unchecked checkbox **"I have taken this action."** is
  required.
- Buttons: "RECORD · COMPLETE MISSION N", "SAVE REFLECTION", "SAVE TO MY
  CODE", "SAVE FOCUS & AIM" (21), "SAVE PRACTICE PLAN" (27, 30), "SAVE
  CHANGES" when editing, and **"SAVE DRAFT FOR LATER"** on every unfinished
  Mission.
- Success: "MISSION COMPLETE." plus one line per kind: "You acted with
  [value]." / "Your reflection is saved." / "Your Personal Code is taking
  shape." / "Your focus and aim are saved." / "Your practice plan is saved."
- Pacing: suggest one a day, always point to the next unfinished Mission,
  allow browsing all 30, no resets or locks. Only real prerequisites block.

## Prerequisites and context

- Code lines 8–12 are all required for **14 and 29**. Show the code and link
  to whatever is missing.
- Promise (12) is shown on 15–21. It doesn't block.
- **Mission 21:** focus area (Relationships, Health, Work, Money, Home,
  Service) plus the aim and reason in the text. **Required for 22–25.** Show
  it there, with a link back to 21 when it's missing.
- Aim shown on 26–30 when present.
- Practice (27) shown on 28–30, even without 21.
- Recent actions shown on 21, 28 and 30. **28 needs one prior completed
  action.**
- 13 syncs with the profile identity. A profile edit updates the same
  record, never a duplicate.
- **27 and 30** also save a frequency (Daily / Three times a week / Weekly)
  and a **future** review date, plus the fragrance.
- Snapshot the mission wording and context on completion. Later edits never
  rewrite old records. Drafts pick up newly saved context, and offer a
  choice if the aim changed.
- Photos only on 7 and 19.

## Validation and data

- The kind comes from the server's mission version, never from the client.
- Fragrance must be one of the three. Text is trimmed and non-empty, max
  1,000 characters (280 on 13). Name max 60.
- Server checks the confirmation and the prerequisites. Drafts skip
  validation.
- One canonical record per Mission per user. Retries update it, never
  duplicate it. Drafts are stored apart from completed records. Keep the
  original completion date and add `updated_at`. Remove/restore keeps the
  same record.

## Migration

- Snapshot the live v1 definitions. Old records keep their original
  wording, with an "earlier wording" notice. Old Mission 4 (gratitude) must
  not be relabeled "Own Your Part".
- Keep all completion credit; nobody redoes Missions.
- Legacy 21 without an aim: keep it, but ask for an aim before 22–25.
- Back up first. Make it idempotent and report counts. Rollback must keep
  v2 records intact.

## Deliverables Antonio expects

A branch or PR, a staging walkthrough (new user and returning user,
12→21→22, 27→30, S.T.A.R. video, an older-wording record), pass/fail on
C01–C12 (content) and D01–D14 (state/migration), migration counts, and a
rollback plan. Don't put real journal text in screenshots.

## Where this overrides earlier decisions

- Examples were tap-to-use, and a single example pre-filled the field. Now
  they are inspiration only (2 per Mission), behind "Need an example?".
- The "I commit to " prefix and commitment-tense logging go away. Each
  Mission has its own prompt and Done when rule.
- The S.T.A.R. Record wording and the closer both change.
- Each Mission now has 3 approaches under Act.
- New: drafts, record kinds, the action checkbox, prerequisites, focus and
  aim fields, frequency and review date.
- The Mission 13 pre-fill stays, but it must be saved on purpose.
