import React, { useEffect, useState, useMemo, useRef } from 'react';
import { 
  PlusCircle, 
  Plus,
  Trash2, 
  Eye, 
  EyeOff, 
  Tag, 
  Edit3, 
  RefreshCw, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Star, 
  UploadCloud, 
  Loader2, 
  Layers,
  Image as ImageIcon,
  Video as VideoIcon,
  Play
} from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { GalleryItem } from '../../types/gallery';
import { 
  getAllGalleryItemsAdmin, 
  saveGalleryItem, 
  deleteGalleryItem, 
  replaceGalleryImage,
  replaceGalleryMedia,
  reorderGalleryItems,
  saveMultipleGalleryItems,
  subscribeToGallery,
  getAllGalleryCategories,
  saveCustomGalleryCategory,
  deleteCustomGalleryCategory,
  DEFAULT_GALLERY_CATEGORIES,
  getCustomGalleryCategories
} from '../../services/galleryService';
import { uploadToCloudinary, uploadVideoToCloudinary } from '../../lib/cloudinary';

const DEFAULT_CATEGORIES = [
  'Corporate Events',
  'Field Trials & Crop Health',
  'Farmer Interactions',
  'Farmer Seminars',
  'Distribution Network',
  'Others'
];

const CLIENT_TOP_3_IDS = [
  'indus-conf-lamp-lighting',
  'indus-conf-lamp-directors',
  'indus-conf-executive-table'
];

export interface UnifiedUploadItem {
  id: string;
  file?: File;
  mediaType: 'image' | 'video';
  preview: string;
  title: string;
  description: string;
  category: string;
  fileSizeFormatted: string;
  sourceType: 'file' | 'url';
  directVideoUrl?: string;
  progress: number;
  status: 'idle' | 'uploading' | 'done' | 'error';
  error?: string;
}

export const AdminGalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Notification banners
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [previewModalItem, setPreviewModalItem] = useState<GalleryItem | null>(null);

  // Active item references for modals
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [replacingItem, setReplacingItem] = useState<GalleryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<GalleryItem | null>(null);
  const [reorderList, setReorderList] = useState<GalleryItem[]>([]);

  // Unified Upload Queue States
  const [uploadQueue, setUploadQueue] = useState<UnifiedUploadItem[]>([]);
  const [uploadProgressIndex, setUploadProgressIndex] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states for Replace
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replacePreview, setReplacePreview] = useState<string | null>(null);
  const [replaceProgress, setReplaceProgress] = useState(0);

  // Loading indicator for ongoing mutations
  const [saving, setSaving] = useState(false);

  // Dynamic gallery categories (Standard, Custom, and Others)
  const [allCategories, setAllCategories] = useState<string[]>(() => getAllGalleryCategories());
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryTarget, setCategoryTarget] = useState<number | 'quick_all' | 'edit_item' | null>(null);

  useEffect(() => {
    const updateCats = () => {
      setAllCategories(getAllGalleryCategories(items));
    };
    updateCats();
    window.addEventListener('indus:gallery-categories-updated', updateCats);
    return () => {
      window.removeEventListener('indus:gallery-categories-updated', updateCats);
    };
  }, [items]);

  const handleCreateCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      showNotification(undefined, 'Please enter a category name.');
      return;
    }

    if (allCategories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      showNotification(undefined, `Category "${trimmed}" already exists.`);
      return;
    }

    saveCustomGalleryCategory(trimmed);
    const updated = getAllGalleryCategories(items);
    setAllCategories(updated);

    if (typeof categoryTarget === 'number') {
      setUploadQueue(prev => prev.map((q, i) => i === categoryTarget ? { ...q, category: trimmed } : q));
    } else if (categoryTarget === 'quick_all') {
      setUploadQueue(prev => prev.map(item => ({ ...item, category: trimmed })));
    } else if (categoryTarget === 'edit_item' && editingItem) {
      setEditingItem({ ...editingItem, category: trimmed });
    }

    showNotification(`Category "${trimmed}" created successfully!`);
    setShowNewCategoryModal(false);
    setNewCategoryName('');
    setCategoryTarget(null);
  };

  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState(false);

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setDeletingCategory(true);
    const cat = categoryToDelete;
    try {
      await deleteCustomGalleryCategory(cat);

      // If the admin was viewing this category filter, reset to 'All'
      if (selectedCategory.toLowerCase() === cat.toLowerCase()) {
        setSelectedCategory('All');
      }

      // Update local state items so any item with this category is moved to 'Others'
      setItems(prev => prev.map(item => 
        (item.category && item.category.trim().toLowerCase() === cat.toLowerCase())
          ? { ...item, category: 'Others' }
          : item
      ));

      // Update queue items if any
      setUploadQueue(prev => prev.map(q => 
        (q.category && q.category.trim().toLowerCase() === cat.toLowerCase())
          ? { ...q, category: 'Others' }
          : q
      ));

      // Update editingItem if currently editing
      if (editingItem && editingItem.category && editingItem.category.trim().toLowerCase() === cat.toLowerCase()) {
        setEditingItem({ ...editingItem, category: 'Others' });
      }

      const updatedCats = getAllGalleryCategories(items);
      setAllCategories(updatedCats);

      setShowDeleteCategoryModal(false);
      setCategoryToDelete(null);
      showNotification(`Category "${cat}" permanently deleted. Assigned media safely moved to "Others".`);
    } catch (err: any) {
      showNotification(undefined, `Failed to delete category: ${err?.message || 'Error occurred'}`);
    } finally {
      setDeletingCategory(false);
    }
  };

  const handleCloseNewCategoryModal = () => {
    setShowNewCategoryModal(false);
    setNewCategoryName('');
    setCategoryTarget(null);
  };

  const showNotification = (successMsg?: string, errorMsg?: string) => {
    if (successMsg) {
      setActionSuccess(successMsg);
      setActionError(null);
      setTimeout(() => setActionSuccess(null), 4000);
    }
    if (errorMsg) {
      setActionError(errorMsg);
      setActionSuccess(null);
      setTimeout(() => setActionError(null), 6000);
    }
  };

  const loadGallery = () => {
    setLoading(true);
    getAllGalleryItemsAdmin()
      .then(res => setItems(res))
      .catch(err => {
        console.error('Failed to load gallery items:', err);
        showNotification(undefined, 'Could not retrieve visual records.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let isMounted = true;
    getAllGalleryItemsAdmin()
      .then(res => {
        if (isMounted) setItems(res);
      })
      .catch(err => {
        if (isMounted) {
          console.error(err);
          showNotification(undefined, 'Could not retrieve visual records.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    const unsubscribe = subscribeToGallery(() => {
      getAllGalleryItemsAdmin().then(res => {
        if (isMounted) setItems(res);
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Filtered visuals
  const filteredItems = useMemo(() => {
    return items.filter(it => {
      if (selectedCategory !== 'All' && it.category !== selectedCategory) return false;
      if (statusFilter === 'published' && !it.isPublished) return false;
      if (statusFilter === 'draft' && it.isPublished) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = it.title.toLowerCase().includes(q);
        const matchesDesc = (it.description || '').toLowerCase().includes(q);
        const matchesCap = (it.caption || '').toLowerCase().includes(q);
        const matchesCat = (it.category || '').toLowerCase().includes(q);
        return matchesTitle || matchesDesc || matchesCap || matchesCat;
      }
      return true;
    });
  }, [items, selectedCategory, statusFilter, search]);

  // Status toggle handler
  const handleTogglePublish = async (item: GalleryItem) => {
    const updated = !item.isPublished;
    try {
      await saveGalleryItem({ isPublished: updated }, item.id);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isPublished: updated } : i));
      showNotification(`"${item.title}" is now marked as ${updated ? 'Published' : 'Draft'}.`);
    } catch (err: any) {
      showNotification(undefined, `Could not toggle visual status: ${err?.message || 'Permission denied'}`);
    }
  };

  // Quick move adjacent
  const handleQuickMove = async (indexInFullList: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? indexInFullList - 1 : indexInFullList + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const listCopy = [...items];
    const temp = listCopy[indexInFullList];
    listCopy[indexInFullList] = listCopy[targetIndex];
    listCopy[targetIndex] = temp;

    // Recalculate sortOrders
    const ordered = listCopy.map((item, idx) => ({ id: item.id, sortOrder: idx + 1 }));
    try {
      await reorderGalleryItems(ordered);
      setItems(listCopy.map((item, idx) => ({ ...item, sortOrder: idx + 1 })));
      showNotification(`Order updated: "${temp.title}" moved ${direction}.`);
    } catch (err: any) {
      showNotification(undefined, `Failed to reorder: ${err?.message || 'Error saving order'}`);
    }
  };

  // 1. UNIFIED UPLOAD HELPERS & HANDLERS
  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const processSelectedFiles = (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (!files || files.length === 0) return;

    const newItems: UnifiedUploadItem[] = files.map((file, idx) => {
      const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv|avi|m4v)$/i.test(file.name);
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').trim();
      const formattedTitle = baseName ? baseName.charAt(0).toUpperCase() + baseName.slice(1) : 'Untitled Visual';

      return {
        id: `queue-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        mediaType: isVideo ? 'video' : 'image',
        preview: URL.createObjectURL(file),
        title: formattedTitle,
        description: '',
        category: 'Field Trials & Crop Health',
        fileSizeFormatted: formatFileSize(file.size),
        sourceType: 'file',
        progress: 0,
        status: 'idle'
      };
    });

    setUploadQueue(prev => [...prev, ...newItems]);
  };

  const handleAddDirectVideoUrl = () => {
    const newItem: UnifiedUploadItem = {
      id: `queue-url-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      mediaType: 'video',
      preview: '/assets/indus-crop-hero.webp',
      title: 'Field Demonstration Video',
      description: '',
      category: 'Field Trials & Crop Health',
      fileSizeFormatted: 'Direct URL',
      sourceType: 'url',
      directVideoUrl: '',
      progress: 0,
      status: 'idle'
    };
    setUploadQueue(prev => [...prev, newItem]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      processSelectedFiles(e.dataTransfer.files);
    }
  };

  const handleUploadAll = async () => {
    if (uploadQueue.length === 0) {
      showNotification(undefined, 'Please select one or more images or videos to upload.');
      return;
    }

    // Validation: Ensure all items have a title
    for (let i = 0; i < uploadQueue.length; i++) {
      const item = uploadQueue[i];
      if (!item.title.trim()) {
        showNotification(undefined, `File #${i + 1} (${item.file?.name || 'Media'}) is missing a title.`);
        return;
      }
      if (item.sourceType === 'url' && !item.directVideoUrl?.trim()) {
        showNotification(undefined, `Please enter a valid video URL for "${item.title}".`);
        return;
      }
    }

    setSaving(true);
    let successCount = 0;
    const itemsToSave: Array<Partial<GalleryItem>> = [];

    for (let i = 0; i < uploadQueue.length; i++) {
      setUploadProgressIndex(i + 1);
      const item = uploadQueue[i];
      
      setUploadQueue(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'uploading', progress: 15 } : it));

      let finalMediaUrl = item.preview;
      let finalPublicId: string | undefined = undefined;
      let posterUrl = item.mediaType === 'video' ? '/assets/indus-crop-hero.webp' : item.preview;

      try {
        if (item.sourceType === 'url') {
          finalMediaUrl = item.directVideoUrl!.trim();
          posterUrl = '/assets/indus-crop-hero.webp';
        } else if (item.file) {
          if (item.mediaType === 'video') {
            try {
              const res = await uploadVideoToCloudinary(item.file, 'gallery', (pct) => {
                setUploadQueue(prev => prev.map((it, idx) => idx === i ? { ...it, progress: pct } : it));
              });
              finalMediaUrl = res.secureUrl;
              finalPublicId = res.publicId;
              posterUrl = '/assets/indus-crop-hero.webp';
            } catch (vErr) {
              console.warn(`Video upload fallback for ${item.file.name}:`, vErr);
              if (item.preview) finalMediaUrl = item.preview;
            }
          } else {
            // Image upload
            try {
              const res = await uploadToCloudinary(item.file, 'gallery', (pct) => {
                setUploadQueue(prev => prev.map((it, idx) => idx === i ? { ...it, progress: pct } : it));
              });
              finalMediaUrl = res.secureUrl;
              finalPublicId = res.publicId;
              posterUrl = res.secureUrl;
            } catch (imgErr) {
              console.warn(`Image upload fallback for ${item.file.name}:`, imgErr);
              if (item.preview) finalMediaUrl = item.preview;
            }
          }
        }

        const isVid = item.mediaType === 'video';
        itemsToSave.push({
          title: item.title.trim(),
          category: item.category || 'Field Trials & Crop Health',
          caption: item.description.trim() || item.title.trim(),
          description: item.description.trim() || item.title.trim(),
          altText: item.title.trim(),
          mediaType: item.mediaType,
          imageUrl: isVid ? posterUrl : finalMediaUrl,
          imagePublicId: isVid ? undefined : finalPublicId,
          videoUrl: isVid ? finalMediaUrl : undefined,
          videoPublicId: isVid ? finalPublicId : undefined,
          isPublished: true,
          sortOrder: items.length + i + 1
        });

        setUploadQueue(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'done', progress: 100 } : it));
        successCount++;
      } catch (err: any) {
        console.error(`Error uploading item ${item.title}:`, err);
        setUploadQueue(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'error', error: err?.message || 'Upload failed' } : it));
      }
    }

    try {
      if (itemsToSave.length > 0) {
        await saveMultipleGalleryItems(itemsToSave);
        setShowAddModal(false);
        setUploadQueue([]);
        showNotification(`Successfully uploaded and published ${successCount} visual(s) to the gallery!`);
        await loadGallery();
      }
    } catch (saveErr: any) {
      showNotification(undefined, `Failed to save gallery records: ${saveErr?.message || 'Database error'}`);
    } finally {
      setSaving(false);
      setUploadProgressIndex(0);
    }
  };

  // 2. EDIT EXISTING
  const handleOpenEdit = (item: GalleryItem) => {
    setEditingItem({ ...item });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editingItem.title.trim()) {
      showNotification(undefined, 'Title cannot be empty.');
      return;
    }

    const currentItem = { ...editingItem };
    setSaving(true);
    try {
      // Optimistically update the items state in the admin table immediately
      setItems(prev => prev.map(item => 
        item.id === currentItem.id 
          ? { 
              ...item, 
              title: currentItem.title.trim(),
              category: currentItem.category,
              caption: currentItem.caption?.trim() || '',
              description: currentItem.description?.trim() || '',
              altText: currentItem.altText?.trim() || currentItem.title.trim(),
              mediaType: currentItem.mediaType || (currentItem.videoUrl ? 'video' : 'image'),
              videoUrl: currentItem.videoUrl || undefined,
              imageUrl: currentItem.imageUrl,
              isPublished: currentItem.isPublished,
              updatedAt: new Date().toISOString()
            }
          : item
      ));

      await saveGalleryItem({
        title: currentItem.title.trim(),
        category: currentItem.category,
        caption: currentItem.caption?.trim() || '',
        description: currentItem.description?.trim() || '',
        altText: currentItem.altText?.trim() || currentItem.title.trim(),
        mediaType: currentItem.mediaType || (currentItem.videoUrl ? 'video' : 'image'),
        videoUrl: currentItem.videoUrl || undefined,
        imageUrl: currentItem.imageUrl,
        isPublished: currentItem.isPublished
      }, currentItem.id);

      setShowEditModal(false);
      setEditingItem(null);
      showNotification(`Changes to "${currentItem.title}" saved successfully!`);
      await loadGallery();
    } catch (err: any) {
      showNotification(undefined, `Failed to update visual: ${err?.message || 'Database error'}`);
    } finally {
      setSaving(false);
    }
  };

  // 3. REPLACE IMAGE
  const handleOpenReplace = (item: GalleryItem) => {
    setReplacingItem(item);
    setReplaceFile(null);
    setReplacePreview(null);
    setReplaceProgress(0);
    setShowReplaceModal(true);
  };

  const handleReplaceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReplaceFile(file);
    setReplacePreview(URL.createObjectURL(file));
  };

  const handleConfirmReplace = async () => {
    if (!replacingItem || !replaceFile) {
      showNotification(undefined, 'Please select a replacement file.');
      return;
    }

    setSaving(true);
    setReplaceProgress(15);
    try {
      const isVideoFile = replaceFile.type.includes('video') || 
                          replaceFile.name.toLowerCase().endsWith('.mp4') || 
                          replaceFile.name.toLowerCase().endsWith('.webm');

      if (isVideoFile || replacingItem.mediaType === 'video') {
        if (isVideoFile) {
          let finalVideoUrl = replacePreview || replacingItem.videoUrl || '';
          let videoPubId: string | undefined = undefined;
          try {
            const res = await uploadVideoToCloudinary(replaceFile, 'gallery', (pct) => {
              setReplaceProgress(pct);
            });
            finalVideoUrl = res.secureUrl;
            videoPubId = res.publicId;
          } catch (err) {
            console.warn('Replace video notice, using preview:', err);
          }

          await replaceGalleryMedia(replacingItem.id, {
            videoUrl: finalVideoUrl,
            videoPublicId: videoPubId,
            mediaType: 'video'
          });
        } else {
          // Replaced the poster image for the video
          let finalImageUrl = replacePreview || replacingItem.imageUrl;
          let imgPubId: string | undefined = undefined;
          try {
            const res = await uploadToCloudinary(replaceFile, 'gallery', (pct) => {
              setReplaceProgress(pct);
            });
            finalImageUrl = res.secureUrl;
            imgPubId = res.publicId;
          } catch (err) {
            console.warn('Replace poster image notice, using preview:', err);
          }

          await replaceGalleryMedia(replacingItem.id, {
            imageUrl: finalImageUrl,
            imagePublicId: imgPubId
          });
        }
      } else {
        let finalUrl = replacePreview || replacingItem.imageUrl;
        let pubId: string | undefined = undefined;

        try {
          const res = await uploadToCloudinary(replaceFile, 'gallery', (pct) => {
            setReplaceProgress(pct);
          });
          finalUrl = res.secureUrl;
          pubId = res.publicId;
        } catch (err) {
          console.warn('Replace image fallback to local:', err);
        }

        await replaceGalleryImage(replacingItem.id, finalUrl, pubId);
      }

      setShowReplaceModal(false);
      setReplacingItem(null);
      setReplaceFile(null);
      setReplacePreview(null);
      showNotification(`Media for "${replacingItem.title}" successfully replaced!`);
      loadGallery();
    } catch (err: any) {
      showNotification(undefined, `Failed to replace media: ${err?.message || 'Database error'}`);
    } finally {
      setSaving(false);
      setReplaceProgress(0);
    }
  };

  // 4. DELETE IMAGE
  const handleOpenDelete = (item: GalleryItem) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setSaving(true);
    try {
      await deleteGalleryItem(deletingItem.id);
      setShowDeleteModal(false);
      showNotification(`Photograph "${deletingItem.title}" was removed from the gallery.`);
      setDeletingItem(null);
      loadGallery();
    } catch (err: any) {
      showNotification(undefined, `Failed to delete visual: ${err?.message || 'Database error'}`);
    } finally {
      setSaving(false);
    }
  };

  // 5. REORDER GALLERY
  const handleOpenReorder = () => {
    setReorderList([...items]);
    setShowReorderModal(true);
  };

  const handleReorderMoveItem = (currentIndex: number, newIndex: number) => {
    if (newIndex < 0 || newIndex >= reorderList.length) return;
    const copy = [...reorderList];
    const [moved] = copy.splice(currentIndex, 1);
    copy.splice(newIndex, 0, moved);
    setReorderList(copy);
  };

  const handleResetClientTop3 = () => {
    // Find the 3 client top items and place them at indices 0, 1, 2
    const copy = [...reorderList];
    const top3Items: GalleryItem[] = [];
    CLIENT_TOP_3_IDS.forEach(id => {
      const found = copy.find(i => i.id === id);
      if (found) top3Items.push(found);
    });

    const remaining = copy.filter(i => !CLIENT_TOP_3_IDS.includes(i.id));
    setReorderList([...top3Items, ...remaining]);
    showNotification('Reordered top 3 slides to client-requested order: #1 Lamp Lighting, #2 Executive Invocation, #3 Executive Directorate Address.');
  };

  const handleSaveReorder = async () => {
    setSaving(true);
    try {
      const ordered = reorderList.map((item, idx) => ({ id: item.id, sortOrder: idx + 1 }));
      await reorderGalleryItems(ordered);
      setShowReorderModal(false);
      showNotification('Gallery order successfully updated and published!');
      loadGallery();
    } catch (err: any) {
      showNotification(undefined, `Failed to save gallery order: ${err?.message || 'Database error'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminNav />

      <main className="admin-main">
        {/* Top Header Bar */}
        <header className="admin-topbar">
          <div>
            <h1 style={{ fontSize: '1.4rem', color: 'var(--color-primary-green-dark)' }}>
              Visual Gallery Management
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
              Curate, edit, replace, delete, and reorder company visual documentation & field trials
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className="btn btn-outline btn-sm"
              onClick={handleOpenReorder}
              title="Change the display order of photographs"
            >
              <ArrowUpDown size={15} style={{ marginRight: '6px' }} />
              <span>Reorder Gallery</span>
            </button>
            <button 
              type="button" 
              className="btn btn-primary btn-sm"
              onClick={() => {
                setUploadQueue([]);
                setShowAddModal(true);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <PlusCircle size={15} />
              <span>+ Add Images / Videos</span>
            </button>
          </div>
        </header>

        <div className="admin-content">

          {/* Action Success / Error Notifications */}
          {actionSuccess && (
            <div style={{ 
              backgroundColor: '#ECFDF5', 
              color: '#065F46', 
              border: '1px solid #A7F3D0', 
              borderRadius: '8px', 
              padding: '12px 18px', 
              marginBottom: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={18} style={{ color: '#059669', flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{actionSuccess}</span>
              </div>
              <button type="button" onClick={() => setActionSuccess(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065F46' }}>
                <X size={16} />
              </button>
            </div>
          )}

          {actionError && (
            <div style={{ 
              backgroundColor: '#FEF2F2', 
              color: '#991B1B', 
              border: '1px solid #FECACA', 
              borderRadius: '8px', 
              padding: '12px 18px', 
              marginBottom: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={18} style={{ color: '#DC2626', flexShrink: 0 }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{actionError}</span>
              </div>
              <button type="button" onClick={() => setActionError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991B1B' }}>
                <X size={16} />
              </button>
            </div>
          )}

          {/* Client Requested Top 3 Slides Notice Banner */}
          <div className="gallery-admin-banner">
            <div className="gallery-admin-banner-content">
              <div className="gallery-admin-banner-icon">
                <Star size={20} fill="#D4AF37" />
              </div>
              <div>
                <h3 className="gallery-admin-banner-title">
                  Client-Approved First 3 Slides
                </h3>
                <p className="gallery-admin-banner-sub">
                  The first three slides are verified and positioned per client instruction: 
                  <strong> #1 Inaugural Lamp Lighting</strong>, 
                  <strong> #2 Executive Lamp Lighting & Invocation</strong>, and 
                  <strong> #3 Executive Directorate Address</strong>.
                </p>
              </div>
            </div>
            <button 
              type="button" 
              className="btn btn-sm"
              style={{ backgroundColor: 'rgba(212, 175, 55, 0.2)', color: '#FDE047', border: '1px solid rgba(253, 224, 71, 0.35)' }}
              onClick={handleResetClientTop3}
              title="Reset order to ensure top 3 client slides remain strictly 1, 2, 3"
            >
              Verify Client Top 3
            </button>
          </div>

          {/* Table Container Card */}
          <div className="admin-table-card">
            
            {/* Table Header Controls */}
            <div className="admin-table-header" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-title)' }}>
                    Total Visuals: {items.length}
                  </span>
                  <span className="badge badge-green">
                    Published: {items.filter(i => i.isPublished).length}
                  </span>
                  {items.some(i => !i.isPublished) && (
                    <span className="badge badge-gold">
                      Drafts: {items.filter(i => !i.isPublished).length}
                    </span>
                  )}
                </div>

                {/* Status Toggle filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button 
                    type="button" 
                    className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: '0.8rem', padding: '5px 10px' }}
                    onClick={() => setStatusFilter('all')}
                  >
                    All Status
                  </button>
                  <button 
                    type="button" 
                    className={`btn btn-sm ${statusFilter === 'published' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: '0.8rem', padding: '5px 10px' }}
                    onClick={() => setStatusFilter('published')}
                  >
                    Published
                  </button>
                  <button 
                    type="button" 
                    className={`btn btn-sm ${statusFilter === 'draft' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ fontSize: '0.8rem', padding: '5px 10px' }}
                    onClick={() => setStatusFilter('draft')}
                  >
                    Drafts
                  </button>
                </div>
              </div>

              {/* Search input bar */}
              <div className="gallery-admin-search">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search visual title, caption, or keywords..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              {/* Category Filter Chips */}
              <div className="gallery-category-filter-chips">
                <button 
                  type="button" 
                  className={`gallery-filter-chip ${selectedCategory === 'All' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('All')}
                >
                  All Categories ({items.length})
                </button>
                {allCategories.map(cat => {
                  const count = items.filter(i => i.category === cat).length;
                  const isCustom = !DEFAULT_GALLERY_CATEGORIES.includes(cat);
                  return (
                    <div key={cat} style={{ display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
                      <button 
                        type="button" 
                        className={`gallery-filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                        style={isCustom ? { paddingRight: '28px' } : undefined}
                      >
                        {cat} ({count})
                      </button>
                      {isCustom && (
                        <button
                          type="button"
                          className="gallery-delete-category-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCategoryToDelete(cat);
                            setShowDeleteCategoryModal(true);
                          }}
                          title={`Delete custom category "${cat}"`}
                          style={{
                            position: 'absolute',
                            right: '7px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: selectedCategory === cat ? '#FCA5A5' : '#EF4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2px',
                            borderRadius: '50%'
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}
                <button
                  type="button"
                  className="gallery-filter-chip"
                  style={{ borderStyle: 'dashed', borderColor: 'var(--color-primary-green)', color: 'var(--color-primary-green)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => {
                    setCategoryTarget(null);
                    setNewCategoryName('');
                    setShowNewCategoryModal(true);
                  }}
                  title="Create a new gallery category"
                >
                  <Plus size={13} /> New Category
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px auto', color: 'var(--color-primary-green)' }} />
                <p>Loading gallery items...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <ImageIcon size={44} style={{ color: '#D1D5DB', margin: '0 auto 14px auto' }} />
                <h4 style={{ color: 'var(--color-text-title)', marginBottom: '6px' }}>No Visual Records Found</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  {search ? `No visuals match your search "${search}".` : 'No photographs in this category yet.'}
                </p>
                {(search || selectedCategory !== 'All' || statusFilter !== 'all') && (
                  <button 
                    type="button" 
                    className="btn btn-outline btn-sm" 
                    style={{ marginTop: '16px' }}
                    onClick={() => { setSearch(''); setSelectedCategory('All'); setStatusFilter('all'); }}
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="admin-table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Order</th>
                      <th style={{ width: '90px' }}>Preview</th>
                      <th>Title & Description</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right', minWidth: '160px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map(item => {
                      const fullIndex = items.findIndex(i => i.id === item.id);
                      const isClientTop3 = CLIENT_TOP_3_IDS.includes(item.id);

                      return (
                        <tr key={item.id} className={isClientTop3 ? 'gallery-row-locked' : ''}>
                          {/* Order & Client Lock Badge */}
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.95rem', color: '#111827' }}>
                                #{item.sortOrder || fullIndex + 1}
                              </span>
                              {isClientTop3 && (
                                <span className="badge-client-locked" title="Client locked slide order">
                                  <Star size={10} fill="#92400E" /> Slide {fullIndex + 1}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Thumbnail with Click to preview */}
                          <td>
                            <div 
                              style={{ cursor: 'pointer', position: 'relative', display: 'inline-block' }}
                              onClick={() => setPreviewModalItem(item)}
                              title="Click to view full preview"
                            >
                              <img 
                                src={item.imageUrl || '/assets/indus-crop-hero.webp'} 
                                alt={item.title} 
                                className="table-thumb" 
                                style={{ width: '74px', height: '54px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                              />
                              {(item.mediaType === 'video' || item.videoUrl) && (
                                <div style={{ 
                                  position: 'absolute', 
                                  inset: 0, 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  background: 'rgba(0,0,0,0.38)', 
                                  borderRadius: '6px' 
                                }}>
                                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(6,95,70,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Play size={11} fill="#FFFFFF" style={{ marginLeft: '1px' }} />
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Title & Caption */}
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--color-text-title)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span>{item.title}</span>
                              {(item.mediaType === 'video' || item.videoUrl) && (
                                <span className="badge badge-gold" style={{ fontSize: '0.68rem', padding: '2px 7px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                  <VideoIcon size={10} /> Video
                                </span>
                              )}
                            </div>
                            {item.caption && (
                              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '2px', lineHeight: '1.4' }}>
                                {item.caption}
                              </div>
                            )}
                          </td>

                          {/* Category */}
                          <td>
                            <span className="badge badge-green" style={{ whiteSpace: 'nowrap' }}>
                              <Tag size={11} style={{ marginRight: '4px' }} />
                              {item.category}
                            </span>
                          </td>

                          {/* Status toggle */}
                          <td>
                            <button 
                              type="button"
                              onClick={() => handleTogglePublish(item)}
                              className={`badge ${item.isPublished ? 'badge-green' : 'badge-gold'}`}
                              style={{ cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              title="Click to toggle publish status"
                            >
                              {item.isPublished ? (
                                <><Eye size={12} /> Published</>
                              ) : (
                                <><EyeOff size={12} /> Draft</>
                              )}
                            </button>
                          </td>

                          {/* Row Actions */}
                          <td style={{ textAlign: 'right' }}>
                            <div className="gallery-action-btn-group">
                              {/* Reorder quick buttons */}
                              <button 
                                type="button"
                                className="btn-icon-reorder"
                                disabled={fullIndex === 0}
                                onClick={() => handleQuickMove(fullIndex, 'up')}
                                title="Move Up"
                              >
                                <ArrowUp size={13} />
                              </button>
                              <button 
                                type="button"
                                className="btn-icon-reorder"
                                disabled={fullIndex === items.length - 1}
                                onClick={() => handleQuickMove(fullIndex, 'down')}
                                title="Move Down"
                              >
                                <ArrowDown size={13} />
                              </button>

                              {/* Edit metadata */}
                              <button 
                                type="button" 
                                className="btn-icon"
                                onClick={() => handleOpenEdit(item)}
                                title="Edit details (Title, category, caption)"
                              >
                                <Edit3 size={14} />
                              </button>

                              {/* Replace photograph */}
                              <button 
                                type="button" 
                                className="btn-icon"
                                onClick={() => handleOpenReplace(item)}
                                title="Replace photograph file (preserves details)"
                              >
                                <RefreshCw size={14} />
                              </button>

                              {/* Delete visual */}
                              <button 
                                type="button" 
                                className="btn-icon delete"
                                onClick={() => handleOpenDelete(item)}
                                title="Delete visual from gallery"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* ========================================================
          1. ADD NEW VISUAL(S) MODAL (Single & Multiple Modes)
          ======================================================== */}
      {/* ========================================================
          1. ADD NEW IMAGES & VIDEOS MODAL (Unified Experience)
          ======================================================== */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => !saving && setShowAddModal(false)}>
          <div 
            className="modal-dialog" 
            style={{ maxWidth: '840px', width: '95%' }} 
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-green-dark)', margin: '0 0 4px 0', fontWeight: 700 }}>
                  Add Images & Videos
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Upload company photographs and field trial videos to the media gallery
                </p>
              </div>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => !saving && setShowAddModal(false)}
                disabled={saving}
              >
                ✕
              </button>
            </div>

            <div className="gallery-modal-body-scroll" style={{ padding: '20px 28px' }}>
              
              {/* Drag and drop selection area */}
              <div 
                className={`gallery-unified-dropzone ${isDragOver ? 'is-dragover' : ''} ${uploadQueue.length > 0 ? 'compact' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  multiple 
                  accept="image/*,video/*,image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                  onChange={e => {
                    if (e.target.files) {
                      processSelectedFiles(e.target.files);
                      e.target.value = '';
                    }
                  }}
                  style={{ display: 'none' }}
                  disabled={saving}
                />
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                    <UploadCloud size={32} style={{ color: 'var(--color-primary-green)' }} />
                    <ImageIcon size={22} style={{ color: '#059669' }} />
                    <VideoIcon size={22} style={{ color: '#D97706' }} />
                  </div>
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-title)', margin: '0 0 4px 0' }}>
                    Select or drag and drop images and videos here. You can select multiple files together.
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Supports JPG, PNG, WebP photos & MP4, WebM videos (up to 25MB each)
                  </p>
                </div>
              </div>

              {/* Action bar when files are selected */}
              {uploadQueue.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  flexWrap: 'wrap', 
                  gap: '12px',
                  margin: '16px 0 12px 0',
                  padding: '10px 14px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-title)' }}>
                      Selected Files ({uploadQueue.length}):
                    </span>
                    <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
                      {uploadQueue.filter(q => q.mediaType === 'image').length} Image(s)
                    </span>
                    <span className="badge badge-amber" style={{ fontSize: '0.75rem', backgroundColor: '#FEF3C7', color: '#92400E' }}>
                      {uploadQueue.filter(q => q.mediaType === 'video').length} Video(s)
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      type="button" 
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.78rem', padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={saving}
                    >
                      <Plus size={13} />
                      Add More Files
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.78rem', padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={handleAddDirectVideoUrl}
                      disabled={saving}
                    >
                      <VideoIcon size={13} />
                      Add Video URL
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.78rem', padding: '3px 10px', color: '#DC2626', borderColor: '#FECACA' }}
                      onClick={() => setUploadQueue([])}
                      disabled={saving}
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              )}

              {/* Quick apply common category helper */}
              {uploadQueue.length > 1 && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  marginBottom: '14px', 
                  padding: '8px 12px', 
                  backgroundColor: '#ECFDF5', 
                  borderRadius: '6px',
                  border: '1px solid #A7F3D0'
                }}>
                  <Tag size={15} style={{ color: '#047857' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#065F46' }}>
                    Quick Category: Apply to all:
                  </span>
                  <select 
                    className="form-control"
                    style={{ padding: '3px 8px', fontSize: '0.8rem', width: 'auto', flex: 1, maxWidth: '260px', height: 'auto' }}
                    defaultValue=""
                    onChange={e => {
                      if (e.target.value === '__CREATE_NEW__') {
                        setCategoryTarget('quick_all');
                        setNewCategoryName('');
                        setShowNewCategoryModal(true);
                        e.target.value = '';
                      } else if (e.target.value) {
                        const newCat = e.target.value;
                        setUploadQueue(prev => prev.map(item => ({ ...item, category: newCat })));
                      }
                    }}
                    disabled={saving}
                  >
                    <option value="">-- Choose Category to Apply to All --</option>
                    {allCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="__CREATE_NEW__" style={{ fontWeight: 700, color: '#047857' }}>
                      + Create New Category
                    </option>
                  </select>
                  <span style={{ fontSize: '0.74rem', color: '#047857', fontStyle: 'italic' }}>
                    (You can still change each item's category individually below)
                  </span>
                </div>
              )}

              {/* Scrollable list of file cards with INDIVIDUAL details */}
              {uploadQueue.length > 0 && (
                <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                  {uploadQueue.map((item, idx) => (
                    <div key={item.id} className="gallery-queue-item">
                      
                      {/* Left: Preview & Badges */}
                      <div className="gallery-queue-preview-box">
                        <div style={{ position: 'relative', width: '120px', height: '80px' }}>
                          {item.mediaType === 'video' ? (
                            item.sourceType === 'file' ? (
                              <video 
                                src={item.preview} 
                                className="gallery-queue-thumb" 
                                muted 
                                preload="metadata" 
                              />
                            ) : (
                              <img 
                                src={item.preview || '/assets/indus-crop-hero.webp'} 
                                alt="Video preview" 
                                className="gallery-queue-thumb" 
                              />
                            )
                          ) : (
                            <img 
                              src={item.preview} 
                              alt="Thumbnail" 
                              className="gallery-queue-thumb" 
                            />
                          )}

                          {item.mediaType === 'video' && (
                            <div style={{
                              position: 'absolute',
                              inset: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'rgba(0,0,0,0.3)',
                              borderRadius: '6px',
                              pointerEvents: 'none'
                            }}>
                              <Play size={20} fill="#FFFFFF" color="#FFFFFF" />
                            </div>
                          )}
                        </div>

                        {/* Media Type Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {item.mediaType === 'video' ? (
                            <span 
                              className="badge" 
                              style={{ 
                                backgroundColor: '#FEF3C7', 
                                color: '#92400E', 
                                border: '1px solid #FDE68A',
                                fontSize: '0.72rem',
                                padding: '1px 6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              <VideoIcon size={10} />
                              Video
                            </span>
                          ) : (
                            <span 
                              className="badge badge-green" 
                              style={{ 
                                fontSize: '0.72rem', 
                                padding: '1px 6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              <ImageIcon size={10} />
                              Image
                            </span>
                          )}
                          <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                            {item.fileSizeFormatted}
                          </span>
                        </div>
                      </div>

                      {/* Right: Individual Editable Details */}
                      <div className="gallery-queue-fields">
                        
                        {/* Title and Category Row */}
                        <div className="gallery-queue-fields-row">
                          <div>
                            <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '3px' }}>
                              Title <span className="req">*</span>
                            </label>
                            <input 
                              type="text" 
                              className="form-control"
                              style={{ padding: '6px 10px', fontSize: '0.86rem', fontWeight: 600 }}
                              value={item.title}
                              onChange={e => {
                                const newTitle = e.target.value;
                                setUploadQueue(prev => prev.map((q, i) => i === idx ? { ...q, title: newTitle } : q));
                              }}
                              placeholder="Title for this item"
                              disabled={saving}
                              required
                            />
                          </div>

                          <div>
                            <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '3px' }}>
                              Category <span className="req">*</span>
                            </label>
                            <select 
                              className="form-control"
                              style={{ padding: '6px 10px', fontSize: '0.84rem' }}
                              value={item.category}
                              onChange={e => {
                                if (e.target.value === '__CREATE_NEW__') {
                                  setCategoryTarget(idx);
                                  setNewCategoryName('');
                                  setShowNewCategoryModal(true);
                                } else {
                                  const newCat = e.target.value;
                                  setUploadQueue(prev => prev.map((q, i) => i === idx ? { ...q, category: newCat } : q));
                                }
                              }}
                              disabled={saving}
                            >
                              {allCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                              <option value="__CREATE_NEW__" style={{ fontWeight: 700, color: '#047857' }}>
                                + Create New Category
                              </option>
                            </select>
                          </div>
                        </div>

                        {/* Description Field (Individual per file!) */}
                        <div>
                          <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '3px' }}>
                            Description <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>(Specific to this item)</span>
                          </label>
                          <textarea 
                            className="form-control"
                            rows={2}
                            style={{ padding: '6px 10px', fontSize: '0.84rem', resize: 'vertical' }}
                            value={item.description}
                            onChange={e => {
                              const newDesc = e.target.value;
                              setUploadQueue(prev => prev.map((q, i) => i === idx ? { ...q, description: newDesc } : q));
                            }}
                            placeholder="Add description, location, or crop highlights for this specific photo/video..."
                            disabled={saving}
                          />
                        </div>

                        {/* If Direct URL mode for video */}
                        {item.sourceType === 'url' && (
                          <div>
                            <label className="form-label" style={{ fontSize: '0.78rem', marginBottom: '3px' }}>
                              Direct Video URL <span className="req">*</span>
                            </label>
                            <input 
                              type="text" 
                              className="form-control"
                              style={{ padding: '6px 10px', fontSize: '0.84rem' }}
                              value={item.directVideoUrl || ''}
                              onChange={e => {
                                const newUrl = e.target.value;
                                setUploadQueue(prev => prev.map((q, i) => i === idx ? { 
                                  ...q, 
                                  directVideoUrl: newUrl,
                                  preview: newUrl.trim() || '/assets/indus-crop-hero.webp' 
                                } : q));
                              }}
                              placeholder="e.g. /videos/hero-cinematic.mp4 or https://res.cloudinary.com/.../video.mp4"
                              disabled={saving}
                            />
                          </div>
                        )}

                        {/* Individual Upload Progress / Status */}
                        {item.status === 'uploading' && (
                          <div style={{ marginTop: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#047857', fontWeight: 600, marginBottom: '2px' }}>
                              <span>Uploading to Cloudinary...</span>
                              <span>{item.progress}%</span>
                            </div>
                            <div style={{ width: '100%', backgroundColor: '#E2E8F0', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${item.progress}%`, backgroundColor: '#059669', height: '100%', transition: 'width 0.2s' }} />
                            </div>
                          </div>
                        )}

                        {item.status === 'done' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#059669', fontWeight: 600 }}>
                            <CheckCircle2 size={13} />
                            <span>Uploaded successfully</span>
                          </div>
                        )}

                        {item.status === 'error' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#DC2626', fontWeight: 600 }}>
                            <AlertCircle size={13} />
                            <span>{item.error || 'Upload error'}</span>
                          </div>
                        )}
                      </div>

                      {/* Remove item button */}
                      <button 
                        type="button" 
                        className="btn-icon delete"
                        style={{ alignSelf: 'flex-start', marginTop: '2px' }}
                        onClick={() => setUploadQueue(prev => prev.filter((_, i) => i !== idx))}
                        disabled={saving}
                        title="Remove this file from upload queue"
                      >
                        <Trash2 size={15} />
                      </button>

                    </div>
                  ))}
                </div>
              )}

              {/* Overall Progress when saving */}
              {saving && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px 16px', 
                  backgroundColor: '#ECFDF5', 
                  borderRadius: '8px', 
                  border: '1px solid #A7F3D0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <Loader2 size={18} className="animate-spin" style={{ color: '#059669' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#065F46', marginBottom: '4px' }}>
                      <span>Processing uploads ({uploadProgressIndex} of {uploadQueue.length})...</span>
                      <span>Please keep this window open</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                alignItems: 'center', 
                gap: '12px', 
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px solid #E2E8F0'
              }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setShowAddModal(false)} 
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleUploadAll}
                  disabled={saving || uploadQueue.length === 0}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minWidth: '160px', justifyContent: 'center' }}
                >
                  {saving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Uploading All...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={15} />
                      <span>{uploadQueue.length > 0 ? `Upload All (${uploadQueue.length})` : 'Upload All'}</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          2. EDIT VISUAL DETAILS MODAL
          ======================================================== */}
      {showEditModal && editingItem && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-dialog" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-green-dark)', margin: '0 0 4px 0' }}>
                  Edit Photograph Details
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Modify title, category, caption highlights, or description
                </p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowEditModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="gallery-modal-body-scroll">
              
              {/* Highlight photo being edited */}
              <div className="gallery-preview-card-large">
                {(editingItem.mediaType === 'video' || editingItem.videoUrl) ? (
                  <video 
                    src={editingItem.videoUrl} 
                    poster={editingItem.imageUrl}
                    controls
                    className="gallery-preview-img-large"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <img 
                    src={editingItem.imageUrl} 
                    alt={editingItem.title} 
                    className="gallery-preview-img-large" 
                  />
                )}
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Visual Record #{editingItem.sortOrder}</span>
                    {(editingItem.mediaType === 'video' || editingItem.videoUrl) && (
                      <span className="badge badge-gold" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                        <VideoIcon size={10} style={{ marginRight: '3px' }} /> Video
                      </span>
                    )}
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '4px 0 6px 0' }}>
                    {editingItem.title}
                  </h4>
                  <span className="badge badge-green">
                    <Tag size={10} style={{ marginRight: '4px' }} />
                    {editingItem.category}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Visual Title <span className="req">*</span>
                </label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editingItem.title}
                  onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  className="form-control"
                  value={editingItem.category}
                  onChange={e => {
                    if (e.target.value === '__CREATE_NEW__') {
                      setCategoryTarget('edit_item');
                      setNewCategoryName('');
                      setShowNewCategoryModal(true);
                    } else {
                      setEditingItem({ ...editingItem, category: e.target.value });
                    }
                  }}
                >
                  {allCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__CREATE_NEW__" style={{ fontWeight: 700, color: '#047857' }}>
                    + Create New Category
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Caption / Key Highlights</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editingItem.caption || ''}
                  onChange={e => setEditingItem({ ...editingItem, caption: e.target.value })}
                  placeholder="Short highlight shown on gallery card"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Extended Details)</label>
                <textarea 
                  className="form-control"
                  rows={3}
                  value={editingItem.description || ''}
                  onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Detailed notes, location, or background..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Accessibility Alt Text</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editingItem.altText || ''}
                  onChange={e => setEditingItem({ ...editingItem, altText: e.target.value })}
                  placeholder="Accessible screen-reader description"
                />
              </div>

              {(editingItem.mediaType === 'video' || editingItem.videoUrl) && (
                <>
                  <div className="form-group">
                    <label className="form-label">Video URL</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={editingItem.videoUrl || ''}
                      onChange={e => setEditingItem({ ...editingItem, videoUrl: e.target.value })}
                      placeholder="e.g. /videos/hero-cinematic.mp4 or https://..."
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Video Cover / Poster Image URL</label>
                    <input 
                      type="text" 
                      className="form-control"
                      value={editingItem.imageUrl || ''}
                      onChange={e => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                      placeholder="e.g. /assets/indus-crop-hero.webp or image URL"
                    />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                <input 
                  type="checkbox" 
                  id="edit-is-published" 
                  checked={editingItem.isPublished} 
                  onChange={e => setEditingItem({ ...editingItem, isPublished: e.target.checked })} 
                />
                <label htmlFor="edit-is-published" style={{ fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>
                  Visible in public gallery (Published)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          3. REPLACE PHOTOGRAPH MODAL
          ======================================================== */}
      {showReplaceModal && replacingItem && (
        <div className="modal-overlay" onClick={() => setShowReplaceModal(false)}>
          <div className="modal-dialog" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-green-dark)', margin: '0 0 4px 0' }}>
                  Replace Photograph
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Replace the image file for <strong>&ldquo;{replacingItem.title}&rdquo;</strong> while preserving existing metadata
                </p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowReplaceModal(false)}>
                ✕
              </button>
            </div>

            <div className="gallery-modal-body-scroll">
              {/* Side-by-Side Comparison */}
              <div className="gallery-replace-grid">
                {/* Left: Current */}
                <div className="gallery-replace-pane">
                  <h4>Current Image</h4>
                  <img src={replacingItem.imageUrl} alt="Current" className="gallery-replace-thumb" />
                  <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '8px 0 0 0' }}>
                    Category: {replacingItem.category}
                  </p>
                </div>

                {/* Right: New Replacement */}
                <div className="gallery-replace-pane">
                  <h4>New Replacement Image</h4>
                  {replacePreview ? (
                    <div>
                      {replaceFile && (replaceFile.type.includes('video') || replaceFile.name.toLowerCase().endsWith('.mp4') || replaceFile.name.toLowerCase().endsWith('.webm')) ? (
                        <video src={replacePreview} controls className="gallery-replace-thumb" style={{ background: '#000' }} />
                      ) : (
                        <img src={replacePreview} alt="New Replacement" className="gallery-replace-thumb" />
                      )}
                      <label htmlFor="replace-photo-input" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-primary-green)', fontWeight: 600, marginTop: '8px', cursor: 'pointer' }}>
                        Click to choose different file
                      </label>
                    </div>
                  ) : (
                    <div style={{ padding: '24px 10px' }}>
                      <input 
                        type="file" 
                        accept={replacingItem.mediaType === 'video' || replacingItem.videoUrl ? "image/jpeg,image/png,image/webp,image/jpg,video/mp4,video/webm" : "image/jpeg,image/png,image/webp,image/jpg"} 
                        onChange={handleReplaceFileChange} 
                        style={{ display: 'none' }} 
                        id="replace-photo-input"
                        disabled={saving}
                      />
                      <label htmlFor="replace-photo-input" style={{ cursor: 'pointer', display: 'block' }}>
                        <UploadCloud size={36} style={{ color: 'var(--color-primary-green)', margin: '0 auto 8px auto' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>
                          {replacingItem.mediaType === 'video' || replacingItem.videoUrl ? 'Select Replacement Video or Cover' : 'Select New Photograph'}
                        </span>
                      </label>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept={replacingItem.mediaType === 'video' || replacingItem.videoUrl ? "image/jpeg,image/png,image/webp,image/jpg,video/mp4,video/webm" : "image/jpeg,image/png,image/webp,image/jpg"} 
                    onChange={handleReplaceFileChange} 
                    style={{ display: 'none' }} 
                    id="replace-photo-input"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Progress bar */}
              {saving && (
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Loader2 size={16} className="animate-spin" style={{ color: 'var(--color-primary-green)' }} />
                  <div style={{ flex: 1, backgroundColor: '#E0E0E0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${replaceProgress}%`, backgroundColor: 'var(--color-primary-green)', height: '100%', transition: 'width 0.2s' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-green)' }}>{replaceProgress}%</span>
                </div>
              )}

              <div style={{ backgroundColor: '#F3F4F6', borderRadius: '6px', padding: '10px 14px', fontSize: '0.82rem', color: '#4B5563', marginTop: '12px' }}>
                ✓ Title, category, caption, description, and display order will be preserved automatically.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowReplaceModal(false)} disabled={saving}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleConfirmReplace} 
                  disabled={saving || !replaceFile}
                >
                  {saving ? 'Replacing Image...' : 'Confirm & Replace Image'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          4. DELETE VISUAL CONFIRMATION MODAL
          ======================================================== */}
      {showDeleteModal && deletingItem && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-dialog" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>
                  <Trash2 size={20} />
                </div>
                <h3 style={{ fontSize: '1.2rem', color: '#991B1B', margin: 0 }}>
                  Confirm Photograph Deletion
                </h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowDeleteModal(false)}>
                ✕
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '0.92rem', color: '#374151', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                Are you sure you want to remove this photograph from the website gallery?
              </p>

              <div style={{ display: 'flex', gap: '12px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px', marginBottom: '16px', alignItems: 'center' }}>
                <img src={deletingItem.imageUrl} alt="Delete target" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>{deletingItem.title}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>Category: {deletingItem.category}</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '10px 14px', fontSize: '0.8rem', color: '#1E40AF', lineHeight: '1.4' }}>
                <strong>Safety Guarantee:</strong> Original project files in the project repository will remain completely untouched. This action only unregisters the visual record from the website.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowDeleteModal(false)} disabled={saving}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleConfirmDelete} 
                  disabled={saving}
                  style={{ backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none' }}
                >
                  {saving ? 'Deleting...' : 'Yes, Delete Photograph'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          5. REORDER GALLERY MODAL
          ======================================================== */}
      {showReorderModal && (
        <div className="modal-overlay" onClick={() => setShowReorderModal(false)}>
          <div className="modal-dialog" style={{ maxWidth: '820px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-green-dark)', margin: '0 0 4px 0' }}>
                  Reorder Gallery Sequence
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Adjust the sequence of visuals displayed on the public gallery.
                </p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowReorderModal(false)}>
                ✕
              </button>
            </div>

            <div className="gallery-modal-body-scroll">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.86rem', color: '#4B5563' }}>
                  Tip: Use the Up / Down arrows to move items, or reset to client defaults.
                </span>
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm"
                  onClick={handleResetClientTop3}
                  title="Locks top 3 client slides to exact positions 1, 2, 3"
                >
                  <Star size={13} fill="#D4AF37" style={{ marginRight: '5px' }} />
                  Lock Client Top 3
                </button>
              </div>

              <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                <table className="gallery-reorder-table">
                  <thead>
                    <tr style={{ backgroundColor: '#F9FAFB' }}>
                      <th style={{ width: '60px' }}>Pos</th>
                      <th style={{ width: '64px' }}>Preview</th>
                      <th>Title & Category</th>
                      <th style={{ width: '120px', textAlign: 'center' }}>Move</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reorderList.map((item, idx) => {
                      const isClientTop3 = CLIENT_TOP_3_IDS.includes(item.id);

                      return (
                        <tr key={item.id} style={{ backgroundColor: isClientTop3 ? 'rgba(254, 243, 199, 0.3)' : undefined }}>
                          <td>
                            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>
                              #{idx + 1}
                            </div>
                            {isClientTop3 && (
                              <span style={{ fontSize: '0.68rem', color: '#92400E', fontWeight: 700 }}>
                                Top Slide {idx + 1}
                              </span>
                            )}
                          </td>
                          <td>
                            <img src={item.imageUrl} alt={item.title} className="gallery-reorder-thumb" />
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.88rem' }}>
                              {item.title}
                            </div>
                            <span className="badge badge-green" style={{ fontSize: '0.72rem', padding: '1px 6px', marginTop: '2px' }}>
                              {item.category}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button 
                                type="button" 
                                className="btn-icon-reorder" 
                                disabled={idx === 0}
                                onClick={() => handleReorderMoveItem(idx, idx - 1)}
                                title="Move Up"
                              >
                                <ArrowUp size={13} />
                              </button>
                              <button 
                                type="button" 
                                className="btn-icon-reorder" 
                                disabled={idx === reorderList.length - 1}
                                onClick={() => handleReorderMoveItem(idx, idx + 1)}
                                title="Move Down"
                              >
                                <ArrowDown size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowReorderModal(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSaveReorder} disabled={saving}>
                  {saving ? 'Saving Order...' : 'Save Reordered Sequence'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          6. FULL PREVIEW LIGHTBOX MODAL
          ======================================================== */}
      {previewModalItem && (
        <div className="modal-overlay" onClick={() => setPreviewModalItem(null)}>
          <div className="modal-dialog" style={{ maxWidth: '800px', backgroundColor: '#0B1B10', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ backgroundColor: '#0B1B10', borderBottomColor: 'rgba(255,255,255,0.1)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge badge-green">{previewModalItem.category}</span>
                  {(previewModalItem.mediaType === 'video' || previewModalItem.videoUrl) && (
                    <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <VideoIcon size={12} /> Video
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', margin: 0 }}>{previewModalItem.title}</h3>
              </div>
              <button type="button" className="modal-close-btn" style={{ color: '#FFFFFF' }} onClick={() => setPreviewModalItem(null)}>
                ✕
              </button>
            </div>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              {(previewModalItem.mediaType === 'video' || previewModalItem.videoUrl) ? (
                <video 
                  src={previewModalItem.videoUrl} 
                  poster={previewModalItem.imageUrl}
                  controls 
                  autoPlay 
                  style={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: '8px', background: '#000000', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }} 
                >
                  Your browser does not support HTML5 video.
                </video>
              ) : (
                <img 
                  src={previewModalItem.imageUrl} 
                  alt={previewModalItem.title} 
                  style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: '8px' }} 
                />
              )}
              {previewModalItem.caption && (
                <p style={{ color: '#D1D5DB', fontSize: '0.92rem', marginTop: '14px', lineHeight: '1.5' }}>
                  {previewModalItem.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          7. CREATE NEW CATEGORY MODAL
          ======================================================== */}
      {showNewCategoryModal && (
        <div className="modal-overlay" style={{ zIndex: 1400 }} onClick={handleCloseNewCategoryModal}>
          <div className="modal-dialog" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '6px',
                  backgroundColor: '#ECFDF5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary-green)'
                }}>
                  <Tag size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--color-primary-green-dark)', margin: 0 }}>
                    Create New Category
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Add a custom category for photographs and videos
                  </p>
                </div>
              </div>
              <button type="button" className="modal-close-btn" onClick={handleCloseNewCategoryModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCategory} style={{ padding: '20px' }}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                  Category Name <span className="req">*</span>
                </label>
                <input 
                  type="text" 
                  className="form-control"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Export Shipments, Research & Labs, Awards..."
                  autoFocus
                  required
                  style={{ padding: '9px 12px', fontSize: '0.92rem' }}
                />
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '6px', marginBottom: 0 }}>
                  This category will immediately be available in upload dropdowns and as a filter chip on the website.
                </p>
              </div>

              {/* Existing Categories Preview */}
              <div style={{ marginBottom: '20px', padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Current Categories:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {allCategories.map(c => {
                    const isCustom = !DEFAULT_GALLERY_CATEGORIES.includes(c);
                    return (
                      <span 
                        key={c} 
                        style={{ 
                          fontSize: '0.74rem', 
                          padding: isCustom ? '2px 6px 2px 8px' : '2px 8px', 
                          borderRadius: '12px', 
                          backgroundColor: isCustom ? '#FEF2F2' : '#E2E8F0', 
                          color: isCustom ? '#991B1B' : '#334155',
                          border: isCustom ? '1px solid #FECACA' : 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span>{c}</span>
                        {isCustom && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCategoryToDelete(c);
                              setShowDeleteCategoryModal(true);
                            }}
                            title={`Delete custom category "${c}"`}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#DC2626',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
                <button 
                  type="button" 
                  className="btn btn-outline btn-sm" 
                  onClick={handleCloseNewCategoryModal}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={14} />
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          8. DELETE CUSTOM CATEGORY CONFIRMATION MODAL
          ======================================================== */}
      {showDeleteCategoryModal && categoryToDelete && (
        <div className="modal-overlay" style={{ zIndex: 1500 }} onClick={() => setShowDeleteCategoryModal(false)}>
          <div className="modal-dialog" style={{ maxWidth: '440px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#FEF2F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#DC2626',
                flexShrink: 0
              }}>
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#111827', margin: 0, fontWeight: 700 }}>
                  Delete Category
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#DC2626', fontWeight: 600 }}>
                  {categoryToDelete}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.92rem', color: '#374151', lineHeight: '1.5', margin: '0 0 12px 0' }}>
              <strong>Are you sure you want to permanently delete this category?</strong>
            </p>

            <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '0 0 20px 0', lineHeight: '1.4' }}>
              Existing images and videos will not be deleted. Any media currently in this category will be safely moved to <strong>Others</strong>.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                className="btn btn-outline btn-sm" 
                onClick={() => {
                  setShowDeleteCategoryModal(false);
                  setCategoryToDelete(null);
                }}
                disabled={deletingCategory}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-sm"
                style={{ backgroundColor: '#DC2626', color: '#FFFFFF', borderColor: '#DC2626', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={handleConfirmDeleteCategory}
                disabled={deletingCategory}
              >
                {deletingCategory ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
