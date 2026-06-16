"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useDesktop } from "../DesktopContext";
import type { DocPayload, TextPayload, DocType } from "../types";
import { saveFile, appForDoc } from "../fileStore";

/** Shared save/open plumbing for the Office editors. Owns the current document
 *  id + name, seeds the editor from an opened file (or a default), and exposes a
 *  Save / Save As flow wired to fileStore (which mirrors to the cloud). Editors
 *  supply how to read/write their own content format. */
export function useDocFile(opts: {
  docType: DocType;
  /** Content shown for a brand-new/unopened document. */
  defaultContent: string;
  /** Window title to show for an unsaved document. */
  untitled: string;
  /** Load serialized content into the editor (set state / innerHTML / parse JSON). */
  applyContent: (content: string) => void;
  /** Serialize the editor's current content for saving. */
  getContent: () => string;
}) {
  const { docType, defaultContent, untitled } = opts;
  const appId = appForDoc(docType);
  const { payloads, notify, setDocTitle } = useDesktop();
  const payload = payloads[appId] as DocPayload | TextPayload | undefined;

  const [docId, setDocId] = useState<string | undefined>(payload?.kind === "doc" ? payload.docId : undefined);
  const [name, setName] = useState<string | undefined>(payload && "name" in payload ? payload.name : undefined);
  const [saveAsOpen, setSaveAsOpen] = useState(false);

  // Keep editor callbacks in refs so the seed effect only fires on payload change.
  const applyRef = useRef(opts.applyContent); applyRef.current = opts.applyContent;
  const getRef = useRef(opts.getContent); getRef.current = opts.getContent;

  const seeded = useRef(false);
  const lastPayload = useRef<object | null>(null);
  useEffect(() => {
    if (!seeded.current) {
      seeded.current = true;
      lastPayload.current = payload ?? null;
      applyRef.current(payload?.content ?? defaultContent);
      return;
    }
    if (payload && payload !== lastPayload.current) {
      lastPayload.current = payload;
      applyRef.current(payload.content ?? defaultContent);
      setDocId(payload.kind === "doc" ? payload.docId : undefined);
      setName("name" in payload ? payload.name : undefined);
    }
  }, [payload, defaultContent]);

  const doSave = useCallback((saveName: string) => {
    const id = saveFile({ id: docId, type: docType, name: saveName, content: getRef.current() });
    setDocId(id);
    setName(saveName);
    setDocTitle(appId, saveName);
    setSaveAsOpen(false);
    notify("Document saved", `“${saveName}” was saved.`);
  }, [docId, docType, appId, setDocTitle, notify]);

  const requestSave = useCallback(() => {
    if (name) doSave(name);
    else setSaveAsOpen(true);
  }, [name, doSave]);

  const onNew = useCallback(() => {
    applyRef.current(defaultContent);
    setDocId(undefined);
    setName(undefined);
    setDocTitle(appId, untitled);
  }, [defaultContent, untitled, appId, setDocTitle]);

  return {
    name,
    saveAsOpen,
    suggestedName: name ?? untitled,
    requestSave,
    onNew,
    onSaveAs: () => setSaveAsOpen(true),
    closeSaveAs: () => setSaveAsOpen(false),
    commitSaveAs: doSave,
  };
}
