"use client";

import { useActionState, useRef, useState } from "react";
import { updateProfilePhotoAction } from "@/app/actions/profile";

type Props = {
  initial: string; // first letter fallback
  currentPhoto?: string | null;
};

export function AvatarUpload({ initial, currentPhoto }: Props) {
  const [preview, setPreview] = useState<string | null>(currentPhoto ?? null);
  const [base64, setBase64] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [state, action, pending] = useActionState(updateProfilePhotoAction, null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setClientError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setClientError("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setClientError("Image must be under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      setBase64(result);
      // Auto-submit after encoding
      setTimeout(() => formRef.current?.requestSubmit(), 50);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="relative shrink-0 group">
      {/* Avatar display */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-brand text-white text-3xl font-bold relative"
        title="Change profile photo"
      >
        {preview ? (
          <img src={preview} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span>{initial}</span>
        )}
        {/* Hover overlay */}
        <span className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </span>
      </button>

      {/* Loading ring */}
      {pending && (
        <div className="absolute inset-0 rounded-full border-2 border-brand border-t-transparent animate-spin" />
      )}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {/* Hidden form for server action */}
      <form ref={formRef} action={action} className="hidden">
        <input type="hidden" name="photo" value={base64 ?? ""} />
      </form>

      {/* Error tooltip */}
      {(clientError || state?.error) && (
        <p className="absolute top-full left-1/2 -translate-x-1/2 mt-1 text-[10px] text-red-600 bg-white border border-red-200 rounded px-2 py-0.5 whitespace-nowrap shadow-sm">
          {clientError ?? state?.error}
        </p>
      )}
    </div>
  );
}
