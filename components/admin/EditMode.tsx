"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

// 관리자 EDIT MODE 상태. TopNavigation 과 카드 grid 가 공유한다 (저장소 없음, 새로고침 시 꺼짐).
const Ctx = createContext<{ editMode: boolean; setEditMode: (v: boolean) => void }>({
  editMode: false,
  setEditMode: () => {},
});

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [editMode, setEditMode] = useState(false);
  return <Ctx.Provider value={{ editMode, setEditMode }}>{children}</Ctx.Provider>;
}

export function useEditMode() {
  return useContext(Ctx);
}
