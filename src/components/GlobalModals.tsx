"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Toast from "@/components/Toast";
import dynamic from "next/dynamic";

const CommentModal = dynamic(() => import("@/components/CommentModal"), { ssr: false });
const ShareModal = dynamic(() => import("@/components/modals/ShareModal"), { ssr: false });

export function GlobalModals() {
  const supabase = createClient();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | "warning"; isVisible: boolean }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({ message, type, isVisible: true });
  };

  // State managed via window events or global state for simple triggering
  const [commentModal, setCommentModal] = useState<{isOpen: boolean, post?: any}>({isOpen: false});
  const [shareModal, setShareModal] = useState<{isOpen: boolean, post?: any}>({isOpen: false});

  useEffect(() => {
    const handleOpenComment = (e: any) => setCommentModal({isOpen: true, post: e.detail});
    const handleOpenShare = (e: any) => setShareModal({isOpen: true, post: e.detail});
    const handleToast = (e: any) => showToast(e.detail.message, e.detail.type);

    window.addEventListener('open-comment', handleOpenComment);
    window.addEventListener('open-share', handleOpenShare);
    window.addEventListener('show-toast', handleToast);

    return () => {
      window.removeEventListener('open-comment', handleOpenComment);
      window.removeEventListener('open-share', handleOpenShare);
      window.removeEventListener('show-toast', handleToast);
    };
  }, []);

  return (
    <>
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />
      {commentModal.isOpen && commentModal.post && (
        <CommentModal 
          isOpen={commentModal.isOpen}
          onClose={() => setCommentModal({isOpen: false})}
          postId={commentModal.post.id}
          postAuthor={commentModal.post.authorName}
          postContent={commentModal.post.description}
        />
      )}
      {shareModal.isOpen && shareModal.post && (
        <ShareModal 
          isOpen={shareModal.isOpen}
          onClose={() => setShareModal({isOpen: false})}
          postId={shareModal.post.id}
          postContent={shareModal.post.description}
          onShowToast={showToast}
        />
      )}
    </>
  );
}
