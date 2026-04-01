export interface Thought {
  id: string;
  title: string;
  url: string;
  type: string;
  tags: string[];
  description: string;
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
  entityType: 'brain' | 'thought' | 'tag';
  entityId: string;
  userId: string;
}
