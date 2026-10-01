-- Tagihan untuk siswa yang belum punya akun tidak memicu notifikasi (belum ada penerima).
create or replace function app_private.on_invoice() returns trigger language plpgsql security definer set search_path = '' as $$
declare v_link text := '/dashboard/sekolah/' || new.school_id || '/keuangan';
begin
  if new.member_id is null then return new; end if;
  perform app_private.notify_student_and_guardians(new.school_id, new.member_id, 'tagihan', 'Tagihan baru: ' || new.title, 'Jumlah Rp' || new.amount::text, v_link, v_link);
  return new;
end $$;
