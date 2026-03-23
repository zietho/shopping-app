export interface Profile {
  id: string;
  username: string;
  avatar_color: string;
  created_at: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  list_id: string;
  name: string;
  quantity: string;
  checked: boolean;
  position: number;
  added_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  name: string;
  created_by: string | null;
  is_favorite: boolean;
  created_at: string;
  template_items?: TemplateItem[];
}

export interface TemplateItem {
  id: string;
  template_id: string;
  name: string;
  quantity: string;
  position: number;
}

export interface UserPresence {
  user_id: string;
  list_id: string | null;
  last_seen: string;
}

export interface PresenceInfo {
  userId: string;
  username: string;
  avatarColor: string;
  listId: string | null;
  listName: string | null;
}

export interface Toast {
  id: string;
  message: string;
  undoFn?: () => void;
}
