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
    const handleOpenComment = (e: any) => {
      setCommentModal({isOpen: true, post: e.detail});
      window.history.pushState({ modal: 'comment' }, '');
    };
    const handleOpenShare = (e: any) => {
      setShareModal({isOpen: true, post: e.detail});
      window.history.pushState({ modal: 'share' }, '');
    };
    const handleToast = (e: any) => showToast(e.detail.message, e.detail.type);

    const handlePopState = (e: PopStateEvent) => {
      // If we navigate back, close any open modals
      setCommentModal(prev => prev.isOpen ? { ...prev, isOpen: false } : prev);
      setShareModal(prev => prev.isOpen ? { ...prev, isOpen: false } : prev);
    };

    window.addEventListener('open-comment', handleOpenComment);
    window.addEventListener('open-share', handleOpenShare);
    window.addEventListener('show-toast', handleToast);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('open-comment', handleOpenComment);
      window.removeEventListener('open-share', handleOpenShare);
      window.removeEventListener('show-toast', handleToast);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const closeCommentModal = () => {
    if (commentModal.isOpen) {
      setCommentModal({ ...commentModal, isOpen: false });
      // If the current history state is our modal, go back to clean it up
      if (window.history.state?.modal === 'comment') {
        window.history.back();
      }
    }
  };

  const closeShareModal = () => {
    if (shareModal.isOpen) {
      setShareModal({ ...shareModal, isOpen: false });
      if (window.history.state?.modal === 'share') {
        window.history.back();
      }
    }
  };

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
          onClose={closeCommentModal}
          postId={commentModal.post.id}
          postAuthor={commentModal.post.authorName}
          postAuthorId={commentModal.post.authorId}
          postContent={commentModal.post.description}
          showToast={showToast}
        />
      )}
      {shareModal.isOpen && shareModal.post && (
        <ShareModal 
          isOpen={shareModal.isOpen}
          onClose={closeShareModal}
          postId={shareModal.post.id}
          postContent={shareModal.post.description}
          onShowToast={showToast}
        />
      )}
    </>
  );
}
