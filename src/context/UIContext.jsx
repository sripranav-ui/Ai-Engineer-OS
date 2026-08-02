import React, {
  createContext,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";

// =======================================================
// UIContext.jsx — Global UI Infrastructure
// =======================================================
// Provides application-wide UI primitives accessible from
// any component without prop drilling:
//   - Confirmation dialog (replaces alert/window.confirm)
//   - Global loading overlay
//   - Context menu
//
// Usage:
//   const { confirm, showLoading, hideLoading, openContextMenu } = useUI();
// =======================================================

export const UIContext = createContext(null);

// ─── Default state shapes ──────────────────────────────

const DEFAULT_CONFIRM = {
  open:        false,
  title:       "",
  message:     "",
  confirmLabel:"Confirm",
  cancelLabel: "Cancel",
  variant:     "default",  // "default" | "danger" | "warning"
  onConfirm:   null,
  onCancel:    null,
};

const DEFAULT_LOADING = {
  active:  false,
  message: "",
};

const DEFAULT_CONTEXT_MENU = {
  open:    false,
  x:       0,
  y:       0,
  items:   [],
};

// =======================================================

export function UIProvider({ children }) {
  const [confirmState, setConfirmState]     = useState(DEFAULT_CONFIRM);
  const [loadingState, setLoadingState]     = useState(DEFAULT_LOADING);
  const [contextMenu,  setContextMenu]      = useState(DEFAULT_CONTEXT_MENU);

  // Track pending confirm Promise resolvers
  const confirmResolverRef = useRef(null);

  // ─── Confirmation Dialog ─────────────────────────────

  /**
   * Opens a confirmation dialog and returns a Promise<boolean>.
   * Awaitable — resolves true on confirm, false on cancel.
   *
   * @param {object} options
   * @param {string} options.title
   * @param {string} options.message
   * @param {string} [options.confirmLabel]
   * @param {string} [options.cancelLabel]
   * @param {'default'|'danger'|'warning'} [options.variant]
   */
  const confirm = useCallback(
    ({ title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", variant = "default" }) => {
      return new Promise((resolve) => {
        confirmResolverRef.current = resolve;
        setConfirmState({
          open: true,
          title,
          message,
          confirmLabel,
          cancelLabel,
          variant,
        });
      });
    },
    []
  );

  const handleConfirmResolve = useCallback((result) => {
    setConfirmState(DEFAULT_CONFIRM);
    if (confirmResolverRef.current) {
      confirmResolverRef.current(result);
      confirmResolverRef.current = null;
    }
  }, []);

  // ─── Loading Overlay ─────────────────────────────────

  const showLoading = useCallback((message = "Loading…") => {
    setLoadingState({ active: true, message });
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingState(DEFAULT_LOADING);
  }, []);

  // ─── Context Menu ─────────────────────────────────────

  /**
   * Opens a context menu at the pointer position.
   * @param {MouseEvent} event
   * @param {Array<{label:string, icon?:string, action:()=>void, divider?:boolean, disabled?:boolean}>} items
   */
  const openContextMenu = useCallback((event, items) => {
    event.preventDefault();
    const x = Math.min(event.clientX, window.innerWidth  - 200);
    const y = Math.min(event.clientY, window.innerHeight - 200);
    setContextMenu({ open: true, x, y, items });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(DEFAULT_CONTEXT_MENU);
  }, []);

  // ─── Value ───────────────────────────────────────────

  const value = useMemo(
    () => ({
      // Confirmation
      confirmState,
      confirm,
      handleConfirmResolve,

      // Loading
      loadingState,
      showLoading,
      hideLoading,

      // Context menu
      contextMenu,
      openContextMenu,
      closeContextMenu,
    }),
    [
      confirmState,
      confirm,
      handleConfirmResolve,
      loadingState,
      showLoading,
      hideLoading,
      contextMenu,
      openContextMenu,
      closeContextMenu,
    ]
  );

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

// ─── Convenience hook ────────────────────────────────────

export function useUI() {
  const ctx = React.useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside <UIProvider>");
  return ctx;
}

export default UIContext;
