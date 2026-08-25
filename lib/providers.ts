export type TextGenerationRequest = {
  system: string;
  prompt: string;
  reasoning?: boolean;
};

export type TextGenerationResult = {
  content: string;
  model: string;
};

export type CoverGenerationRequest = {
  prompt: string;
  negativePrompt?: string;
  count?: number;
};

export type CoverGenerationResult = {
  taskId: string;
  imageUrls: string[];
};

export interface TextModelProvider {
  generate(request: TextGenerationRequest): Promise<TextGenerationResult>;
}

export interface ImageModelProvider {
  generateCover(request: CoverGenerationRequest): Promise<CoverGenerationResult>;
}

/**
 * Phase-one provider: deterministic examples for UI development.
 * Real providers will live behind server-only route handlers in phase two.
 */
export class MockTextProvider implements TextModelProvider {
  async generate(): Promise<TextGenerationResult> {
    return { content: "故事正在寻找它的下一句话。", model: "eidolon-mock" };
  }
}
