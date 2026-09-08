-- Bucket prive des photos de repas. Chaque utilisateur ecrit et lit
-- uniquement dans son dossier <user_id>/...
insert into storage.buckets (id, name, public)
values ('photos-repas', 'photos-repas', false)
on conflict (id) do nothing;

create policy "lit ses photos de repas"
  on storage.objects for select to authenticated
  using (bucket_id = 'photos-repas' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "depose ses photos de repas"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'photos-repas' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "efface ses photos de repas"
  on storage.objects for delete to authenticated
  using (bucket_id = 'photos-repas' and (storage.foldername(name))[1] = auth.uid()::text);
