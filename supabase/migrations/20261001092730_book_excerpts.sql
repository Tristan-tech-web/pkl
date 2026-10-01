-- Kutipan buku/kurikulum sekolah untuk tutor AI. Siswa tidak bisa membaca berkas langsung;
-- fungsi ini hanya mengembalikan cuplikan teks (bukan berkas) bagi anggota sekolah bila modul tutor aktif.
create function public.book_excerpts(p_school_id uuid, p_node_id uuid)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_title text; v_subject uuid; v_words text[]; r record; v_pos int; v_out jsonb := '[]'::jsonb; v_text text;
begin
  if not app_private.is_member(p_school_id) or not app_private.module_enabled(p_school_id, 'ai_tutor') then
    return '[]'::jsonb;
  end if;
  select title, subject_id into v_title, v_subject from public.competency_nodes where id = p_node_id and school_id = p_school_id;
  if v_title is null then return '[]'::jsonb; end if;
  select coalesce(array_agg(w), '{}') into v_words
    from (select lower(w) w from regexp_split_to_table(v_title, '[^[:alnum:]]+') w where char_length(w) >= 4 limit 6) x;
  if cardinality(v_words) = 0 then return '[]'::jsonb; end if;
  for r in
    select f.name, f.text_content from public.school_files f
    where f.school_id = p_school_id and f.category in ('buku_paket','lks','kurikulum')
      and f.text_content is not null and (f.subject_id is null or f.subject_id = v_subject)
    order by f.created_at desc limit 5
  loop
    v_text := lower(r.text_content);
    select min(position(w in v_text)) into v_pos from unnest(v_words) w where position(w in v_text) > 0;
    if v_pos is not null then
      v_out := v_out || jsonb_build_array(jsonb_build_object('file', r.name, 'excerpt', substr(r.text_content, greatest(1, v_pos - 200), 1400)));
    end if;
    exit when jsonb_array_length(v_out) >= 2;
  end loop;
  return v_out;
end $$;
revoke all on function public.book_excerpts(uuid, uuid) from public, anon;
grant execute on function public.book_excerpts(uuid, uuid) to authenticated;
