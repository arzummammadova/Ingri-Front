"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { noteService, type NoteInput, type NoteQuery } from "@/services/noteService";
import { playSound } from "@/lib/sound";

export const notesKey = ["notes"] as const;

export function useNotes(query: NoteQuery = {}) {
  return useQuery({
    queryKey: [...notesKey, query],
    queryFn: () => noteService.list(query),
    placeholderData: keepPreviousData,
  });
}

export function useNoteMutations() {
  const qc = useQueryClient();
  const onSuccess = () => qc.invalidateQueries({ queryKey: notesKey });
  return {
    create: useMutation({ mutationFn: (body: NoteInput) => noteService.create(body), onSuccess: () => { playSound("saved"); return onSuccess(); } }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Partial<NoteInput> }) => noteService.update(id, body),
      onSuccess: () => { playSound("saved"); return onSuccess(); },
    }),
    pin: useMutation({ mutationFn: (id: string) => noteService.pin(id), onSuccess }),
    remove: useMutation({ mutationFn: (id: string) => noteService.remove(id), onSuccess }),
    bulkRemove: useMutation({ mutationFn: (ids: string[]) => noteService.bulkRemove(ids), onSuccess }),
  };
}
