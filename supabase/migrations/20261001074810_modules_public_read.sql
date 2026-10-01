-- Katalog modul dan isi paket bersifat publik (ditampilkan di halaman paket).
grant select on public.modules, public.plan_modules to anon;
create policy modules_read_anon on public.modules for select to anon using (true);
create policy plan_modules_read_anon on public.plan_modules for select to anon using (true);
