export interface Thought {
  id: string;
  title: string;
  url: string;
  type: string;
  tags: string[];
  description: string;
  embed_url?: string;
  thumbnail_url?: string;
  // Optimistic UI state properties
  status?: "processing" | "done" | "failed";
  supermemory_status?: string;
}

export interface OptimisticThought extends Thought {
  isOptimistic?: boolean;
}

export interface Profile {
  id: string;
  username: string;
  email: string;
  is_brain_shared: boolean;
}

export interface ShareLink {
  id: string;
  token: string;
  entityType: "brain" | "thought" | "tag";
  entityId: string;
  userId: string;
}
