import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export interface LeaderboardEntry {
  name: string;
  score: number;
}

export function useLeaderboard() {
  const { actor, isFetching } = useActor();
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getLeaderboard();
      return result.map((s) => ({
        name: s.playerName,
        score: Number(s.score),
      }));
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useSubmitScore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, score }: { name: string; score: number }) => {
      if (!actor) throw new Error("No actor");
      await actor.submitScore(name, BigInt(score));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}
