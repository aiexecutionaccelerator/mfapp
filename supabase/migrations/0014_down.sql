-- Rollback for 0014: back to the 0013 rule (junk under 40% of letters passes).

create or replace function public.not_real_words(body text)
returns boolean
language plpgsql
immutable
as $$
declare
  tok text;
  total integer := 0;
  junk integer := 0;
begin
  for tok in select (regexp_matches(coalesce(body, ''), '[A-Za-z’'']+', 'g'))[1] loop
    tok := regexp_replace(tok, '[’'']', '', 'g');
    continue when tok = '';
    total := total + char_length(tok);
    if (char_length(tok) >= 3 and tok <> upper(tok) and tok !~* '[aeiouy]'
          and lower(tok) <> all (array['hmm', 'mrs', 'shh', 'nth', 'pfft', 'tsk', 'brr', 'psst']))
       or tok ~* '[b-df-hj-np-tv-xz]{6,}'
       or tok ~* '([a-z])\1\1\1' then
      junk := junk + char_length(tok);
    end if;
  end loop;
  return total = 0 or junk * 10 >= total * 4;
end;
$$;
