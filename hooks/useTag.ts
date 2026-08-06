import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TagService } from "@/services/tag.service";
import { CreateTagDto, UpdateTagDto } from "@/types/tag";

export const TAG_KEYS = {
  all: ["tags"] as const,
  personal: () => [...TAG_KEYS.all, "personal"] as const,
  team: (teamId: number) => [...TAG_KEYS.all, "team", teamId] as const,
  detail: (id: number) => [...TAG_KEYS.all, "detail", id] as const,
};

export const useGetPersonalTags = () => {
  return useQuery({
    queryKey: TAG_KEYS.personal(),
    queryFn: async () => {
      const { data } = await TagService.getTagPersonal();
      return data;
    },
  });
};

export const useGetTeamTags = (teamId: number) => {
  return useQuery({
    queryKey: TAG_KEYS.team(teamId),
    queryFn: async () => {
      const { data } = await TagService.getTagTeam(teamId);
      return data;
    },
    enabled: !!teamId,
  });
};

export const useTag = (teamId?: number | null) => {
  const isTeam = Boolean(teamId && teamId > 0);
  const personalQuery = useGetPersonalTags();
  const teamQuery = useGetTeamTags(teamId ?? 0);

  return isTeam ? teamQuery : personalQuery;
};

export const useGetTagById = (id: number) => {
  return useQuery({
    queryKey: TAG_KEYS.detail(id),
    queryFn: async () => {
      const { data } = await TagService.getTagById(id);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateTagDto) => TagService.createTag(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TAG_KEYS.all,
      });
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTagDto }) =>
      TagService.updateTag(data, id),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: TAG_KEYS.detail(variables.id),
      });

      queryClient.invalidateQueries({
        queryKey: TAG_KEYS.all,
      });
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => TagService.deleteTag(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TAG_KEYS.all,
      });
    },
  });
};
