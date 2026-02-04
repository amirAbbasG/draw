import { useMutateWithJob } from "@/hooks/useMutateWithJob";
import { AiResult, GenerateResponse } from "@/types/generate";

export interface Result extends AiResult {
  diagram: string;
}

export type TextToMermaidRes = GenerateResponse<Result>;

export const useTextToMermaid = () => {
  return useMutateWithJob<TextToMermaidRes>({
    url: "/draws/jobs/mermaid/generate/",
    method: "post",
  });
};
