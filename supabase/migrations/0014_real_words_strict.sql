-- Stricter real-words rule (25 Nov 2026, Antonio's third Loom). HANDOFF.md.
--
-- 0013 refused an answer only when junk made up 40% or more of its letters,
-- so mash after a real starter got through ("I told the truth when
-- askjdfh", "sdgsdgf I placed my bottles on my desk"). Now any junk word
-- refuses it. A word is junk when it has three or more letters, isn't all
-- capitals, and has no vowel (y counts); or holds a letter pair English
-- doesn't use (jh, kj, fj…); or five consonants in a row outside th/ch/sh/ng
-- clusters (six always); or one letter four times running. Short no-vowel
-- words people really type (thx, pls, bbq…) are allowed.
-- Matches notRealWords() in src/lib/curriculum.ts: keep them in step.
--
-- Only not_real_words changes; the 0013 trigger calls it. Idempotent.
-- Rollback: 0014_down.sql restores the 0013 rule.

create or replace function public.not_real_words(body text)
returns boolean
language plpgsql
immutable
as $$
declare
  tok text;
  run text;
  words integer := 0;
begin
  for tok in select (regexp_matches(coalesce(body, ''), '[A-Za-z’'']+', 'g'))[1] loop
    tok := regexp_replace(tok, '[’'']', '', 'g');
    continue when tok = '';
    words := words + 1;
    continue when lower(tok) = any (array[
      'hmm', 'mrs', 'shh', 'nth', 'pfft', 'tsk', 'brr', 'psst', 'thx', 'pls', 'plz',
      'btw', 'lbs', 'hrs', 'mph', 'bbq', 'dvd', 'gps', 'pdf', 'nfl', 'nba', 'mlb',
      'tbh', 'smh', 'ppl', 'bc', 'rn']);
    if (char_length(tok) >= 3 and tok <> upper(tok) and tok !~* '[aeiouy]')
       or tok ~* '(jh|hj|jf|fj|jg|gj|jk|kj|jq|qj|jx|xj|jz|zj|jv|vj|jw|wj|qg|gq|qk|kq|qx|xq|qz|zq|vq|qv|fq|qf|zx|xz|vx|xv|kz|zk|hx|xh|vf|fv)'
       or tok ~* '([a-z])\1\1\1' then
      return true;
    end if;
    for run in select (regexp_matches(tok, '[b-df-hj-np-tv-xz]{5,}', 'gi'))[1] loop
      if char_length(run) >= 6 or run !~* '(th|ch|sh|ng)' then
        return true;
      end if;
    end loop;
  end loop;
  return words = 0;
end;
$$;
