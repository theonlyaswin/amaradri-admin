'use client';
import { useRef, useState } from 'react';
import { Image as ImageIcon, SaveIcon, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { storage, database } from '@/lib/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { ref as dbRef, set, get } from 'firebase/database';
import { fetchGalleryImagesOrdered } from '@/lib/firebase';
import { useEffect } from 'react';
import isEqual from 'lodash.isequal';

interface PreviewImage {
  id: string; // Add id to the type
  url: string;
  name: string;
  order?: number;
}

function SortableImageCard({ img, idx, removeImage, isDragging, overId, activeId }: {
  img: PreviewImage;
  idx: number;
  removeImage: (url: string) => void;
  isDragging: boolean;
  overId: string | null;
  activeId: string | null;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isCardDragging,
    isOver,
  } = useSortable({ id: img.url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isCardDragging ? 100 : undefined,
    opacity: isCardDragging ? 0.7 : 1,
  };

  // Shake only the card that is the current drop target (overId === img.url)
  const shouldShake = overId === img.url && activeId !== img.url;
  // Slide right if this card is being hovered for reorder
  const shouldSlideRight = overId === img.url && activeId !== img.url;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={
        `w-40 h-40 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center bg-white relative group cursor-move ` +
        (shouldShake ? ' animate-shake' : '') +
        (shouldSlideRight ? ' animate-slide-right' : '')
      }
    >
      {/* Remove Button */}
      <button
        type="button"
        className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-800 hover:text-gray-200 text-white rounded-full p-1 shadow transition"
        onClick={() => removeImage(img.url)}
        aria-label="Remove image"
      >
        <X className="w-5 h-5" />
      </button>
      <Image
        src={img.url}
        alt={img.name}
        fill
        style={{ objectFit: 'cover' }}
        className="rounded-2xl"
      />
    </div>
  );
}

export default function GalleryLayout() {
  const [images, setImages] = useState<PreviewImage[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [originalImages, setOriginalImages] = useState<PreviewImage[]>([]);

  useEffect(() => {
    async function loadGallery() {
      setLoading(true);
      try {
        const imgs = await fetchGalleryImagesOrdered();
        const mapped = imgs.map(img => ({ ...img, name: img.id, id: img.id, order: img.order }));
        setImages(mapped);
        setOriginalImages(mapped);
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, []);

  // When adding new images, assign a temporary id for new (blob) images
  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    const imagePreviews = imageFiles.map((file, idx) => ({
      id: `blob-${Date.now()}-${idx}`,
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setImages((prev) => [...prev, ...imagePreviews]);
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((img) => img.url !== url));
  };

  // dnd-kit setup
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: any) => {
    setOverId(event.over?.id || null);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);
    if (active.id !== over?.id) {
      const oldIndex = images.findIndex((img) => img.url === active.id);
      const newIndex = images.findIndex((img) => img.url === over.id);
      setImages((imgs) => arrayMove(imgs, oldIndex, newIndex));
    }
  };

  // Check if save should be enabled
  const hasNewImages = images.some(img => img.url.startsWith('blob:'));
  const hasOrderChanged = !isEqual(
    images.filter(img => !img.url.startsWith('blob:')).map(img => img.id),
    originalImages.map(img => img.id)
  ) || images.length !== originalImages.length;
  const canSave = hasNewImages || hasOrderChanged;

  async function handleSave() {
    setUploading(true);
    setUploadProgress(0);
    try {
      // 0. Delete removed images from storage
      const deletedImages = originalImages.filter(orig => !images.some(img => img.id === orig.id));
      for (const img of deletedImages) {
        // Only delete if not a blob (i.e., already uploaded)
        if (!img.url.startsWith('blob:')) {
          const fileRef = storageRef(storage, `livegallery/${img.id}`);
          try {
            await deleteObject(fileRef);
          } catch (e) {
            // Optionally handle error (e.g., already deleted)
          }
        }
      }
      // 1. Update order of existing images if changed
      const existingImages = images.filter(img => !img.url.startsWith('blob:'));
      const originalIds = originalImages.map(img => img.id);
      const newOrderIds = existingImages.map(img => img.id);
      if (!isEqual(originalIds, newOrderIds) || images.length !== originalImages.length) {
        // Update order in realtime db (for existing images only)
        const galleryData = existingImages.map((img, i) => ({ id: img.id, order: i }));
        await set(dbRef(database, 'livegallery'), galleryData);
      }
      // 2. Upload new images (if any) and append to db
      const newImages = images.filter(img => img.url.startsWith('blob:'));
      if (newImages.length > 0) {
        // Get the latest gallery from db to append
        const snapshot = await get(dbRef(database, 'livegallery'));
        let galleryArr = snapshot.val() || [];
        if (!Array.isArray(galleryArr)) galleryArr = [];
        let orderStart = galleryArr.length;
        for (let i = 0; i < newImages.length; i++) {
          const img = newImages[i];
          const response = await fetch(img.url);
          const blob = await response.blob();
          const fileName = `${Date.now()}_${img.name}`;
          const fileRef = storageRef(storage, `livegallery/${fileName}`);
          await uploadBytes(fileRef, blob);
          // No need to get downloadURL for order
          galleryArr.push({ id: fileName, order: orderStart + i });
          setUploadProgress(Math.round(((i + 1) / newImages.length) * 100));
        }
        await set(dbRef(database, 'livegallery'), galleryArr);
      }
      setUploading(false);
      setSaveDialogOpen(false);
      setUploadProgress(null);
      // Optionally: show a toast or notification
      // Refresh gallery
      const imgs = await fetchGalleryImagesOrdered();
      const mapped = imgs.map(img => ({ ...img, name: img.id }));
      setImages(mapped);
      setOriginalImages(mapped);
    } catch (err) {
      setUploading(false);
      setUploadProgress(null);
      alert('Failed to upload images: ' + (err as Error).message);
    }
  }

  return (
    <div className="flex flex-col min-h-screen relative bg-white">
      <style>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
          100% { transform: translateX(0); }
        }
        .animate-shake {
          animation: shake 0.4s infinite;
        }
        @keyframes slide-right {
          0% { transform: translateX(0); }
          100% { transform: translateX(30px); }
        }
        .animate-slide-right {
          animation: slide-right 0.3s forwards;
        }
      `}</style>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={images.map((img) => img.url)}
          strategy={verticalListSortingStrategy}
        >
          <div
            className="grid gap-6 justify-center items-center w-full max-w-6xl p-4"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}
          >
            {/* Upload Card */}
            <div
              className="w-40 h-40 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 transition group bg-gray-50 relative"
              onClick={() => inputRef.current && inputRef.current.click()}
            >
              <ImageIcon className="w-12 h-12 text-gray-400 group-hover:text-orange-400 transition" />
              <span className="mt-2 text-xs text-gray-400 group-hover:text-orange-400">Upload Images</span>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFiles}
              />
            </div>
            {/* Selected Images */}
            {loading ? (
              <div className="col-span-full text-center text-gray-400 text-lg py-12">Loading gallery...</div>
            ) : images.length === 0 ? (
              <div className="col-span-full text-center text-gray-400 text-lg py-12">No images in gallery.</div>
            ) : (
              images.map((img, idx) => (
                <SortableImageCard
                  key={img.url + idx}
                  img={img}
                  idx={idx}
                  removeImage={removeImage}
                  isDragging={activeId !== null}
                  overId={overId}
                  activeId={activeId}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
      {/* Floating Save Button */}
      <Button
        className="fixed bottom-8 right-8 z-50 rounded-xl px-8 py-4 shadow-lg text-lg font-semibold bg-black hover:bg-gray-700 text-white"
        size="lg"
        onClick={() => setSaveDialogOpen(true)}
        disabled={!canSave || uploading}
      >
        <SaveIcon className="w-4 h-4 mr-2" />
        Save
      </Button>
      {/* Save Confirmation Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="z-[1000]">
          <DialogHeader>
            <DialogTitle>Confirm Save</DialogTitle>
            <DialogDescription>
              Are you sure you want to save these images?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button className="bg-black hover:bg-gray-700 text-white" onClick={handleSave} disabled={uploading || !canSave}>
              {uploading ? `Uploading...${uploadProgress !== null ? ` (${uploadProgress}%)` : ''}` : 'Yes, Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}