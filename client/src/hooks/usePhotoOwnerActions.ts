import { useMutation, useQueryClient } from "@tanstack/react-query";
import { photoService } from "../services/photo.service";
import { useAuthStore } from "../store/authStore";
import type { Photo, Visibility } from "../types";

interface UpdatePhotoInput {
  title: string;
  description: string;
  visibility: Visibility;
}

interface UsePhotoOwnerActionsOptions {
  onDeleted?: () => void;
}

export function usePhotoOwnerActions(photo: Photo | undefined, options: UsePhotoOwnerActionsOptions = {}) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const isOwner = Boolean(user && photo && user.id === photo.userId);

  const updateMutation = useMutation({
    mutationFn: (input: UpdatePhotoInput) => {
      if (!photo || !token) {
        throw new Error("You must be logged in to update this photo.");
      }

      return photoService.updatePhoto(photo.id, input, token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["photos"] });
    }
  });

  const updateTagsMutation = useMutation({
    mutationFn: (tagNames: string[]) => {
      if (!photo || !token) {
        throw new Error("You must be logged in to update tags.");
      }

      return photoService.updatePhotoTags(photo.id, tagNames, token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["photos", photo?.id] });
      await queryClient.invalidateQueries({ queryKey: ["photos"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!photo || !token) {
        throw new Error("You must be logged in to delete this photo.");
      }

      return photoService.deletePhoto(photo.id, token);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["photos"] });
      options.onDeleted?.();
    }
  });

  return { isOwner, updateMutation, updateTagsMutation, deleteMutation };
}
