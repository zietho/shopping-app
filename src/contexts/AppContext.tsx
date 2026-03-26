import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import { ShoppingList, Item, Template, TemplateItem, Toast } from '../types';

interface ListMember {
  user_id: string;
  role: string;
  username: string;
  avatar_color: string;
}

interface AppContextType {
  lists: ShoppingList[];
  activeList: ShoppingList | null;
  items: Item[];
  templates: Template[];
  toasts: Toast[];
  shoppingMode: boolean;
  loadingItems: boolean;
  activeListMembers: ListMember[];
  setActiveList: (list: ShoppingList) => void;
  setShoppingMode: (val: boolean) => void;
  addItem: (name: string, quantity?: string) => Promise<void>;
  toggleItem: (item: Item) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateItem: (id: string, name: string, quantity: string) => Promise<void>;
  clearChecked: () => Promise<void>;
  uncheckAll: () => Promise<void>;
  createList: (name: string) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  renameList: (id: string, name: string) => Promise<void>;
  createTemplate: (name: string, itemNames: string[]) => Promise<void>;
  updateTemplate: (id: string, name: string, itemNames: string[]) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  applyTemplate: (template: Template) => Promise<void>;
  toggleFavoriteTemplate: (id: string, val: boolean) => Promise<void>;
  removeItemsByIds: (ids: string[]) => void;
  addToast: (message: string, undoFn?: () => void) => void;
  removeToast: (id: string) => void;
  generateShareCode: (listId: string) => Promise<string | null>;
  joinListByCode: (code: string) => Promise<{ error: string | null; listName?: string }>;
  leaveList: (listId: string) => Promise<void>;
  isOwnerOfList: (listId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeList, setActiveListState] = useState<ShoppingList | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [shoppingMode, setShoppingMode] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [activeListMembers, setActiveListMembers] = useState<ListMember[]>([]);
  const [listMemberRoles, setListMemberRoles] = useState<Record<string, string>>({});
  const toastTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if (!user) return;
    loadLists().then(() => {
      const pendingCode = sessionStorage.getItem('pending_join_code');
      if (pendingCode) {
        sessionStorage.removeItem('pending_join_code');
        joinListByCodeInternal(pendingCode);
      }
    });
    loadTemplates();
  }, [user]);

  useEffect(() => {
    if (!activeList || !user) return;
    loadItems(activeList.id);
    loadActiveListMembers(activeList.id);

    const channel = supabase
      .channel(`items:${activeList.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'items',
        filter: `list_id=eq.${activeList.id}`,
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newItem = payload.new as Item;
          setItems(prev => {
            if (prev.find(i => i.id === newItem.id)) return prev;
            return [newItem, ...prev].sort((a, b) => a.position - b.position);
          });
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as Item;
          setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
        } else if (payload.eventType === 'DELETE') {
          setItems(prev => prev.filter(i => i.id !== (payload.old as Item).id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeList?.id, user]);

  async function joinListByCodeInternal(code: string) {
    if (!user) return;

    const { data: invite } = await supabase
      .from('share_invites')
      .select('id, list_id, used_by')
      .eq('invite_code', code.trim().toUpperCase())
      .maybeSingle();

    if (!invite) return;

    const { data: existingMember } = await supabase
      .from('list_members')
      .select('user_id')
      .eq('list_id', invite.list_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingMember) {
      const { data: listData } = await supabase
        .from('lists')
        .select('*')
        .eq('id', invite.list_id)
        .maybeSingle();
      if (listData) {
        setActiveListState(listData);
      }
      return;
    }

    const { error: memberError } = await supabase.from('list_members').insert({
      list_id: invite.list_id,
      user_id: user.id,
      role: 'member',
    });

    if (memberError) return;

    await supabase.from('share_invites').update({ used_by: user.id }).eq('id', invite.id);

    const { data: listData } = await supabase
      .from('lists')
      .select('*')
      .eq('id', invite.list_id)
      .maybeSingle();

    if (listData) {
      setLists(prev => {
        if (prev.find(l => l.id === listData.id)) return prev;
        return [...prev, listData];
      });
      setListMemberRoles(prev => ({ ...prev, [listData.id]: 'member' }));
      setActiveListState(listData);
      addToast(`${t.sharing.joinSuccess} „${listData.name}"`);
    }
  }

  async function createDefaultList() {
    if (!user) return;
    const newId = crypto.randomUUID();
    const { error } = await supabase.from('lists').insert({
      id: newId,
      name: t.lists.defaultListName,
      created_by: user.id,
    });
    if (error) return;
    await supabase.from('list_members').insert({
      list_id: newId,
      user_id: user.id,
      role: 'owner',
    });
    const { data } = await supabase.from('lists').select('*').eq('id', newId).maybeSingle();
    if (data) {
      setLists([data]);
      setActiveListState(data);
      setListMemberRoles({ [data.id]: 'owner' });
    }
  }

  async function loadLists() {
    if (!user) return;
    const { data } = await supabase
      .from('lists')
      .select('*')
      .order('created_at', { ascending: true });
    if (data) {
      if (data.length === 0) {
        await createDefaultList();
        return;
      }
      setLists(data);
      if (data.length > 0 && !activeList) {
        setActiveListState(data[0]);
      }

      const { data: memberRows } = await supabase
        .from('list_members')
        .select('list_id, role')
        .eq('user_id', user.id);
      if (memberRows) {
        const roleMap: Record<string, string> = {};
        memberRows.forEach(r => { roleMap[r.list_id] = r.role; });
        setListMemberRoles(roleMap);
      }
    }
  }

  async function loadItems(listId: string) {
    setLoadingItems(true);
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('list_id', listId)
      .order('position', { ascending: true });
    setItems(data ?? []);
    setLoadingItems(false);
  }

  async function loadTemplates() {
    const { data: tmplData } = await supabase
      .from('templates')
      .select('*, template_items(*)')
      .order('created_at', { ascending: true });
    if (tmplData) {
      setTemplates(tmplData.map(t => ({
        ...t,
        template_items: (t.template_items as TemplateItem[]).sort((a, b) => a.position - b.position),
      })));
    }
  }

  async function loadActiveListMembers(listId: string) {
    const { data } = await supabase
      .from('list_members')
      .select('user_id, role')
      .eq('list_id', listId);

    if (!data || data.length === 0) {
      setActiveListMembers([]);
      return;
    }

    const userIds = data.map(r => r.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_color')
      .in('id', userIds);

    const profMap: Record<string, { username: string; avatar_color: string }> = {};
    (profiles ?? []).forEach(p => { profMap[p.id] = p; });

    setActiveListMembers(data.map(r => ({
      user_id: r.user_id,
      role: r.role,
      username: profMap[r.user_id]?.username ?? 'Unknown',
      avatar_color: profMap[r.user_id]?.avatar_color ?? '#6B7A99',
    })));
  }

  function setActiveList(list: ShoppingList) {
    setActiveListState(list);
    setShoppingMode(false);
  }

  function isOwnerOfList(listId: string): boolean {
    return listMemberRoles[listId] === 'owner';
  }

  function addToast(message: string, undoFn?: () => void) {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, undoFn }]);
    toastTimers.current[id] = setTimeout(() => removeToast(id), 3000);
  }

  function removeToast(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (toastTimers.current[id]) {
      clearTimeout(toastTimers.current[id]);
      delete toastTimers.current[id];
    }
  }

  const addItem = useCallback(async (name: string, quantity = '') => {
    if (!activeList || !user) return;
    const minPos = items.length > 0 ? Math.min(...items.map(i => i.position)) - 1 : 1;
    const tempId = `temp-${Date.now()}`;
    const optimistic: Item = {
      id: tempId,
      list_id: activeList.id,
      name,
      quantity,
      checked: false,
      position: minPos,
      added_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setItems(prev => [optimistic, ...prev]);

    const { data, error } = await supabase.from('items').insert({
      list_id: activeList.id,
      name,
      quantity,
      position: minPos,
      added_by: user.id,
    }).select().maybeSingle();

    if (error) {
      setItems(prev => prev.filter(i => i.id !== tempId));
      addToast(t.itemActions.errorAdd);
    } else if (data) {
      setItems(prev => prev.map(i => i.id === tempId ? data : i));
    }
  }, [activeList, user, items]);

  const toggleItem = useCallback(async (item: Item) => {
    const newChecked = !item.checked;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, checked: newChecked } : i));

    const { error } = await supabase.from('items').update({
      checked: newChecked,
      updated_at: new Date().toISOString(),
    }).eq('id', item.id);

    if (error) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, checked: item.checked } : i));
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    const itemToDelete = items.find(i => i.id === id);
    setItems(prev => prev.filter(i => i.id !== id));

    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error && itemToDelete) {
      setItems(prev => [...prev, itemToDelete].sort((a, b) => a.position - b.position));
      addToast(t.itemActions.errorDelete);
    }
  }, [items]);

  const updateItem = useCallback(async (id: string, name: string, quantity: string) => {
    const prev = items.find(i => i.id === id);
    setItems(p => p.map(i => i.id === id ? { ...i, name, quantity } : i));
    const { error } = await supabase.from('items').update({ name, quantity, updated_at: new Date().toISOString() }).eq('id', id);
    if (error && prev) {
      setItems(p => p.map(i => i.id === id ? prev : i));
      addToast(t.itemActions.errorUpdate);
    }
  }, [items]);

  const clearChecked = useCallback(async () => {
    if (!activeList) return;
    const checkedIds = items.filter(i => i.checked).map(i => i.id);
    const checkedItems = items.filter(i => i.checked);
    setItems(prev => prev.filter(i => !i.checked));
    const { error } = await supabase.from('items').delete().in('id', checkedIds);
    if (error) {
      setItems(prev => [...prev, ...checkedItems].sort((a, b) => a.position - b.position));
    }
  }, [activeList, items]);

  const uncheckAll = useCallback(async () => {
    if (!activeList) return;
    const snapshot = [...items];
    setItems(prev => prev.map(i => ({ ...i, checked: false })));
    const { error } = await supabase.from('items').update({ checked: false }).eq('list_id', activeList.id);
    if (error) setItems(snapshot);
  }, [activeList, items]);

  const createList = useCallback(async (name: string) => {
    if (!user) return;
    const newId = crypto.randomUUID();
    const { error } = await supabase.from('lists').insert({
      id: newId,
      name,
      created_by: user.id,
    });
    if (error) return;

    await supabase.from('list_members').insert({
      list_id: newId,
      user_id: user.id,
      role: 'owner',
    });

    const { data } = await supabase.from('lists').select('*').eq('id', newId).maybeSingle();
    if (data) {
      setLists(prev => [...prev, data]);
      setActiveListState(data);
      setListMemberRoles(prev => ({ ...prev, [data.id]: 'owner' }));
    }
  }, [user]);

  const deleteList = useCallback(async (id: string) => {
    const prev = [...lists];
    setLists(prev => prev.filter(l => l.id !== id));
    if (activeList?.id === id) {
      const remaining = lists.filter(l => l.id !== id);
      setActiveListState(remaining[0] ?? null);
    }
    const { error } = await supabase.from('lists').delete().eq('id', id);
    if (error) setLists(prev);
  }, [lists, activeList]);

  const renameList = useCallback(async (id: string, name: string) => {
    const prevList = lists.find(l => l.id === id);
    setLists(prev => prev.map(l => l.id === id ? { ...l, name } : l));
    if (activeList?.id === id) setActiveListState(prev => prev ? { ...prev, name } : prev);
    const { error } = await supabase.from('lists').update({ name }).eq('id', id);
    if (error && prevList) {
      setLists(prev => prev.map(l => l.id === id ? prevList : l));
      if (activeList?.id === id) setActiveListState(prevList);
      addToast(t.lists.errorRename);
    }
  }, [activeList, lists]);

  const createTemplate = useCallback(async (name: string, itemNames: string[]) => {
    if (!user) return;
    const { data: tmpl, error } = await supabase.from('templates').insert({
      name,
      created_by: user.id,
    }).select().maybeSingle();
    if (error || !tmpl) return;

    const tmplItems = itemNames.filter(n => n.trim()).map((n, i) => ({
      template_id: tmpl.id,
      name: n.trim(),
      quantity: '',
      position: i + 1,
    }));

    if (tmplItems.length > 0) {
      const { data: insertedItems } = await supabase.from('template_items').insert(tmplItems).select();
      setTemplates(prev => [...prev, { ...tmpl, template_items: insertedItems ?? [] }]);
    } else {
      setTemplates(prev => [...prev, { ...tmpl, template_items: [] }]);
    }
  }, [user]);

  const updateTemplate = useCallback(async (id: string, name: string, itemNames: string[]) => {
    await supabase.from('templates').update({ name }).eq('id', id);
    await supabase.from('template_items').delete().eq('template_id', id);

    const tmplItems = itemNames.filter(n => n.trim()).map((n, i) => ({
      template_id: id,
      name: n.trim(),
      quantity: '',
      position: i + 1,
    }));

    let newItems: TemplateItem[] = [];
    if (tmplItems.length > 0) {
      const { data } = await supabase.from('template_items').insert(tmplItems).select();
      newItems = data ?? [];
    }

    setTemplates(prev => prev.map(t => t.id === id
      ? { ...t, name, template_items: newItems }
      : t
    ));
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    const prev = [...templates];
    setTemplates(p => p.filter(t => t.id !== id));
    const { error } = await supabase.from('templates').delete().eq('id', id);
    if (error) setTemplates(prev);
  }, [templates]);

  const applyTemplate = useCallback(async (template: Template) => {
    if (!activeList || !user) return;
    const tItems = template.template_items ?? [];
    const maxPos = items.length > 0 ? Math.max(...items.map(i => i.position)) : 0;
    const newItems = tItems.map((ti, idx) => ({
      list_id: activeList.id,
      name: ti.name,
      quantity: ti.quantity,
      checked: false,
      position: maxPos + idx + 1,
      added_by: user.id,
    }));

    if (newItems.length > 0) {
      const { data } = await supabase.from('items').insert(newItems).select();
      if (data) {
        setItems(prev => [...prev, ...data].sort((a, b) => a.position - b.position));
      }
      addToast(`„${template.name}" ${t.itemActions.templateApplied} — ${newItems.length} ${t.itemActions.templateItems}`);
    }
  }, [activeList, user, items]);

  const removeItemsByIds = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setItems(prev => prev.filter(i => !idSet.has(i.id)));
  }, []);

  const toggleFavoriteTemplate = useCallback(async (id: string, val: boolean) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, is_favorite: val } : t));
    await supabase.from('templates').update({ is_favorite: val }).eq('id', id);
  }, []);

  const generateShareCode = useCallback(async (listId: string): Promise<string | null> => {
    if (!user) return null;

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: existing } = await supabase
      .from('share_invites')
      .select('invite_code, expires_at')
      .eq('list_id', listId)
      .eq('created_by', user.id)
      .is('used_by', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) return existing.invite_code;

    let code = generateCode();
    let attempts = 0;
    while (attempts < 5) {
      const { error } = await supabase.from('share_invites').insert({
        list_id: listId,
        invite_code: code,
        created_by: user.id,
        expires_at: expiresAt,
      });
      if (!error) return code;
      code = generateCode();
      attempts++;
    }
    return null;
  }, [user]);

  const joinListByCode = useCallback(async (code: string): Promise<{ error: string | null; listName?: string }> => {
    if (!user) return { error: 'NOT_LOGGED_IN' };

    const { data: invite } = await supabase
      .from('share_invites')
      .select('id, list_id, used_by')
      .eq('invite_code', code.trim().toUpperCase())
      .maybeSingle();

    if (!invite) return { error: 'INVALID_CODE' };

    const { data: existingMember } = await supabase
      .from('list_members')
      .select('user_id')
      .eq('list_id', invite.list_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingMember) return { error: 'ALREADY_MEMBER' };

    const { error: memberError } = await supabase.from('list_members').insert({
      list_id: invite.list_id,
      user_id: user.id,
      role: 'member',
    });

    if (memberError) return { error: 'GENERIC' };

    await supabase.from('share_invites').update({ used_by: user.id }).eq('id', invite.id);

    const { data: listData } = await supabase
      .from('lists')
      .select('*')
      .eq('id', invite.list_id)
      .maybeSingle();

    if (listData) {
      setLists(prev => {
        if (prev.find(l => l.id === listData.id)) return prev;
        return [...prev, listData];
      });
      setListMemberRoles(prev => ({ ...prev, [listData.id]: 'member' }));
      setActiveListState(listData);
    }

    return { error: null, listName: listData?.name };
  }, [user]);

  const leaveList = useCallback(async (listId: string) => {
    if (!user) return;
    await supabase.from('list_members')
      .delete()
      .eq('list_id', listId)
      .eq('user_id', user.id);

    setLists(prev => {
      const remaining = prev.filter(l => l.id !== listId);
      if (activeList?.id === listId) {
        setActiveListState(remaining[0] ?? null);
      }
      return remaining;
    });
    setListMemberRoles(prev => {
      const next = { ...prev };
      delete next[listId];
      return next;
    });
  }, [user, activeList]);

  return (
    <AppContext.Provider value={{
      lists, activeList, items, templates, toasts, shoppingMode, loadingItems, activeListMembers,
      setActiveList, setShoppingMode,
      addItem, toggleItem, deleteItem, updateItem, clearChecked, uncheckAll,
      createList, deleteList, renameList,
      createTemplate, updateTemplate, deleteTemplate, applyTemplate, toggleFavoriteTemplate,
      removeItemsByIds,
      addToast, removeToast,
      generateShareCode, joinListByCode, leaveList, isOwnerOfList,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
