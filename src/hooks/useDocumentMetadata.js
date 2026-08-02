import { useEffect } from "react";

// =======================================================
// useDocumentMetadata.js
// Reusable hook to dynamically set document title and meta description
// =======================================================

export function useDocumentMetadata(title, description) {
  useEffect(() => {
    // Set document title
    document.title = title ? `${title} | AI Engineer OS` : "AI Engineer OS";

    // Set meta description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", description);
    }
  }, [title, description]);
}

export default useDocumentMetadata;
