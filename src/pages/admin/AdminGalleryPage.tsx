import React, { useEffect, useState, useMemo } from 'react';
import { 
  PlusCircle, 
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
  Image as ImageIcon
} from 'lucide-react';
import { AdminNav } from '../../components/admin/AdminNav';
import { GalleryItem } from '../../types/gallery';
import { 
  getAllGalleryItemsAdmin, 
  saveGalleryItem, 
  deleteGalleryItem, 
  replaceGalleryImage,
  reorderGalleryItems,
  saveMultipleGalleryItems,
  subscribeToGallery 
} from '../../services/galleryService';
import { uploadToCloudinary } from '../../lib/cloudinary';

const OFFICIAL_CATEGORIES = [
  'Corporate Events',
  'Field Trials & Crop Health',
  'Farmer Interactions',
  'Farmer Seminars',
  'Distribution Network'
];

const CLIENT_TOP_3_IDS = [
  'indus-conf-lamp-lighting',
  'indus-conf-lamp-directors',
  'indus-conf-executive-table'
];

interface MultiFileItem {
  file: File;
  preview: string;
  title: string;
  category: string;
  caption: string;
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
  const [addMode, setAddMode] = useState<'single' | 'multiple'>('single');
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

  // Form states for Single Add
  const [singleTitle, setSingleTitle] = useState('');
  const [singleCategory, setSingleCategory] = useState('Corporate Events');
  const [singleCaption, setSingleCaption] = useState('');
  const [singleDescription, setSingleDescription] = useState('');
  const [singleAltText, setSingleAltText] = useState('');
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [singlePreview, setSinglePreview] = useState<string | null>(null);
  const [singleProgress, setSingleProgress] = useState(0);
  const [singleIsPublished, setSingleIsPublished] = useState(true);

  // Form states for Multi Add
  const [multiFiles, setMultiFiles] = useState<MultiFileItem[]>([]);
  const [multiCommonCategory, setMultiCommonCategory] = useState('Corporate Events');

  // Form states for Replace
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replacePreview, setReplacePreview] = useState<string | null>(null);
  const [replaceProgress, setReplaceProgress] = useState(0);

  // Loading indicator for ongoing mutations
  const [saving, setSaving] = useState(false);

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

  // 1. ADD NEW (Single)
  const handleSingleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSingleFile(file);
    const objUrl = URL.createObjectURL(file);
    setSinglePreview(objUrl);
    if (!singleTitle) {
      // derive nice title from filename
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setSingleTitle(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }
  };

  const handleSingleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleTitle.trim()) {
      showNotification(undefined, 'Please provide a photograph title.');
      return;
    }
    if (!singleFile && !singlePreview) {
      showNotification(undefined, 'Please choose a photograph to upload.');
      return;
    }

    setSaving(true);
    setSingleProgress(10);
    try {
      let finalUrl = singlePreview || '/images/products/ias-405.jpg';
      let publicId: string | undefined = undefined;

      if (singleFile) {
        try {
          const res = await uploadToCloudinary(singleFile, 'gallery', (pct) => {
            setSingleProgress(pct);
          });
          finalUrl = res.secureUrl;
          publicId = res.publicId;
        } catch (uploadErr) {
          console.warn('Cloudinary upload fallback to local preview:', uploadErr);
          // Keep local preview
        }
      }

      await saveGalleryItem({
        title: singleTitle.trim(),
        category: singleCategory,
        caption: singleCaption.trim() || singleTitle.trim(),
        description: singleDescription.trim() || singleCaption.trim() || singleTitle.trim(),
        altText: singleAltText.trim() || singleTitle.trim(),
        imageUrl: finalUrl,
        imagePublicId: publicId,
        isPublished: singleIsPublished,
        sortOrder: items.length + 1
      });

      setShowAddModal(false);
      resetSingleForm();
      showNotification(`Photograph "${singleTitle}" successfully published to gallery!`);
      loadGallery();
    } catch (err: any) {
      showNotification(undefined, `Failed to add visual: ${err?.message || 'Database error'}`);
    } finally {
      setSaving(false);
      setSingleProgress(0);
    }
  };

  const resetSingleForm = () => {
    setSingleTitle('');
    setSingleCategory('Corporate Events');
    setSingleCaption('');
    setSingleDescription('');
    setSingleAltText('');
    setSingleFile(null);
    setSinglePreview(null);
    setSingleProgress(0);
    setSingleIsPublished(true);
  };

  // 1. ADD NEW (Multiple)
  const handleMultiFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newMulti: MultiFileItem[] = Array.from(files).map(file => {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      return {
        file,
        preview: URL.createObjectURL(file),
        title: baseName.charAt(0).toUpperCase() + baseName.slice(1),
        category: multiCommonCategory,
        caption: '',
        progress: 0,
        status: 'idle'
      };
    });

    setMultiFiles(prev => [...prev, ...newMulti]);
  };

  const handleMultiCreate = async () => {
    if (multiFiles.length === 0) {
      showNotification(undefined, 'Please select one or more photographs to upload.');
      return;
    }

    setSaving(true);
    let successCount = 0;
    const itemsToSave: Array<Partial<GalleryItem>> = [];

    for (let i = 0; i < multiFiles.length; i++) {
      const mf = multiFiles[i];
      setMultiFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'uploading' } : f));
      
      let finalUrl = mf.preview;
      let pubId: string | undefined = undefined;

      try {
        const res = await uploadToCloudinary(mf.file, 'gallery', (pct) => {
          setMultiFiles(prev => prev.map((f, idx) => idx === i ? { ...f, progress: pct } : f));
        });
        finalUrl = res.secureUrl;
        pubId = res.publicId;
      } catch (e: any) {
        console.warn(`Multi-upload Cloudinary notice for ${mf.file.name}:`, e);
      }

      itemsToSave.push({
        title: mf.title.trim() || 'Untitled Photograph',
        category: mf.category || multiCommonCategory,
        caption: mf.caption.trim() || mf.title.trim(),
        description: mf.caption.trim() || mf.title.trim(),
        altText: mf.title.trim(),
        imageUrl: finalUrl,
        imagePublicId: pubId,
        isPublished: true,
        sortOrder: items.length + i + 1
      });

      setMultiFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'done', progress: 100 } : f));
      successCount++;
    }

    try {
      await saveMultipleGalleryItems(itemsToSave);
      setShowAddModal(false);
      setMultiFiles([]);
      showNotification(`Successfully added ${successCount} photographs to the gallery!`);
      loadGallery();
    } catch (err: any) {
      showNotification(undefined, `Failed to save batch visuals: ${err?.message || 'Database error'}`);
    } finally {
      setSaving(false);
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
      showNotification(undefined, 'Please select a replacement image.');
      return;
    }

    setSaving(true);
    setReplaceProgress(15);
    try {
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
      setShowReplaceModal(false);
      setReplacingItem(null);
      setReplaceFile(null);
      setReplacePreview(null);
      showNotification(`Photograph for "${replacingItem.title}" successfully replaced!`);
      loadGallery();
    } catch (err: any) {
      showNotification(undefined, `Failed to replace photograph: ${err?.message || 'Database error'}`);
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
                resetSingleForm();
                setMultiFiles([]);
                setShowAddModal(true);
              }}
            >
              <PlusCircle size={15} style={{ marginRight: '6px' }} />
              <span>Add Photograph(s)</span>
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
                {OFFICIAL_CATEGORIES.map(cat => {
                  const count = items.filter(i => i.category === cat).length;
                  return (
                    <button 
                      key={cat}
                      type="button" 
                      className={`gallery-filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
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
                              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111827' }}>
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
                                src={item.imageUrl} 
                                alt={item.title} 
                                className="table-thumb" 
                                style={{ width: '74px', height: '54px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                              />
                            </div>
                          </td>

                          {/* Title & Caption */}
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--color-text-title)', fontSize: '0.95rem' }}>
                              {item.title}
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
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-dialog" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary-green-dark)', margin: '0 0 4px 0' }}>
                  Add Visual Photography
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Upload new corporate conference, field trial, or agricultural exhibition photos
                </p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>

            {/* Mode Selector Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', padding: '0 28px' }}>
              <button 
                type="button" 
                className={`btn btn-sm ${addMode === 'single' ? 'btn-primary' : ''}`}
                style={{ borderRadius: '6px 6px 0 0', margin: '8px 6px 0 0', borderBottom: 'none' }}
                onClick={() => setAddMode('single')}
              >
                Single Photograph
              </button>
              <button 
                type="button" 
                className={`btn btn-sm ${addMode === 'multiple' ? 'btn-primary' : ''}`}
                style={{ borderRadius: '6px 6px 0 0', margin: '8px 0 0 0', borderBottom: 'none' }}
                onClick={() => setAddMode('multiple')}
              >
                <Layers size={14} style={{ marginRight: '6px' }} />
                Batch / Multi-Upload
              </button>
            </div>

            {/* SINGLE UPLOAD MODE */}
            {addMode === 'single' ? (
              <form onSubmit={handleSingleCreate} className="gallery-modal-body-scroll">
                <div className="form-group">
                  <label className="form-label">
                    Visual Title <span className="req">*</span>
                  </label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. Annual Conference 2026–27 Directorate Address"
                    value={singleTitle}
                    onChange={e => setSingleTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category <span className="req">*</span></label>
                  <select 
                    className="form-control"
                    value={singleCategory}
                    onChange={e => setSingleCategory(e.target.value)}
                  >
                    {OFFICIAL_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Caption / Key Highlights</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="e.g. Executive board members inaugurating conference deliberations"
                    value={singleCaption}
                    onChange={e => setSingleCaption(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description (Optional)</label>
                  <textarea 
                    className="form-control"
                    rows={2}
                    placeholder="Extended background notes or location details..."
                    value={singleDescription}
                    onChange={e => setSingleDescription(e.target.value)}
                  />
                </div>

                {/* Dropzone with preview */}
                <div className="form-group">
                  <label className="form-label">Photograph File <span className="req">*</span></label>
                  <div className="image-uploader-dropzone">
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,image/webp,image/jpg" 
                      onChange={handleSingleFileSelect}
                      style={{ display: 'none' }}
                      id="single-photo-input"
                      disabled={saving}
                    />
                    <label htmlFor="single-photo-input" style={{ cursor: 'pointer', display: 'block' }}>
                      {singlePreview ? (
                        <div>
                          <img src={singlePreview} alt="Preview" className="uploader-preview-img" style={{ maxHeight: '180px' }} />
                          <p style={{ fontSize: '0.85rem', color: 'var(--color-primary-green)', fontWeight: 600, margin: '8px 0 0 0' }}>
                            Click to change photograph
                          </p>
                        </div>
                      ) : (
                        <div>
                          <UploadCloud size={38} style={{ color: 'var(--color-primary-green)', margin: '0 auto 8px auto' }} />
                          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-title)', margin: '0 0 4px 0' }}>
                            Click or drag photograph here
                          </p>
                          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>
                            Supports JPG, PNG, WebP up to 10MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Progress bar if saving */}
                {saving && (
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Loader2 size={16} className="animate-spin" style={{ color: 'var(--color-primary-green)' }} />
                    <div style={{ flex: 1, backgroundColor: '#E0E0E0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${singleProgress}%`, backgroundColor: 'var(--color-primary-green)', height: '100%', transition: 'width 0.2s' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-green)' }}>{singleProgress}%</span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px' }}>
                  <input 
                    type="checkbox" 
                    id="single-publish-check" 
                    checked={singleIsPublished} 
                    onChange={e => setSingleIsPublished(e.target.checked)} 
                  />
                  <label htmlFor="single-publish-check" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                    Publish to public gallery immediately
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)} disabled={saving}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving || (!singleFile && !singlePreview)}>
                    {saving ? 'Publishing...' : 'Publish to Gallery'}
                  </button>
                </div>
              </form>
            ) : (
              /* MULTIPLE UPLOAD MODE */
              <div className="gallery-modal-body-scroll">
                <div className="form-group">
                  <label className="form-label">Apply Common Category to All</label>
                  <select 
                    className="form-control"
                    value={multiCommonCategory}
                    onChange={e => {
                      setMultiCommonCategory(e.target.value);
                      setMultiFiles(prev => prev.map(f => ({ ...f, category: e.target.value })));
                    }}
                  >
                    {OFFICIAL_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Multiple Photographs</label>
                  <div className="image-uploader-dropzone">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/jpeg,image/png,image/webp,image/jpg" 
                      onChange={handleMultiFilesSelect}
                      style={{ display: 'none' }}
                      id="multi-photos-input"
                      disabled={saving}
                    />
                    <label htmlFor="multi-photos-input" style={{ cursor: 'pointer', display: 'block' }}>
                      <Layers size={38} style={{ color: 'var(--color-primary-green)', margin: '0 auto 8px auto' }} />
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-title)', margin: '0 0 4px 0' }}>
                        Click to select multiple photographs (Hold Ctrl or Shift)
                      </p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0 }}>
                        Select 2, 5, 10 or more images at once
                      </p>
                    </label>
                  </div>
                </div>

                {multiFiles.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text-title)' }}>
                        Selected Files ({multiFiles.length}):
                      </span>
                      <button 
                        type="button" 
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                        onClick={() => setMultiFiles([])}
                        disabled={saving}
                      >
                        Clear All
                      </button>
                    </div>

                    <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                      {multiFiles.map((mf, idx) => (
                        <div key={idx} className="gallery-multi-file-item">
                          <img src={mf.preview} alt="Thumb" className="gallery-multi-file-thumb" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <input 
                              type="text" 
                              className="form-control"
                              style={{ padding: '6px 10px', fontSize: '0.84rem' }}
                              value={mf.title}
                              onChange={e => {
                                const newTitle = e.target.value;
                                setMultiFiles(prev => prev.map((f, i) => i === idx ? { ...f, title: newTitle } : f));
                              }}
                              placeholder="Title"
                              disabled={saving}
                            />
                            {mf.status === 'uploading' && (
                              <div style={{ width: '100%', backgroundColor: '#E5E7EB', height: '4px', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                                <div style={{ width: `${mf.progress}%`, backgroundColor: '#0E6B38', height: '100%' }} />
                              </div>
                            )}
                          </div>
                          <button 
                            type="button" 
                            className="btn-icon delete"
                            onClick={() => setMultiFiles(prev => prev.filter((_, i) => i !== idx))}
                            disabled={saving}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)} disabled={saving}>
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleMultiCreate} 
                    disabled={saving || multiFiles.length === 0}
                  >
                    {saving ? 'Uploading Batch...' : `Upload & Save All (${multiFiles.length})`}
                  </button>
                </div>
              </div>
            )}
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
                <img 
                  src={editingItem.imageUrl} 
                  alt={editingItem.title} 
                  className="gallery-preview-img-large" 
                />
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>
                    Visual Record #{editingItem.sortOrder}
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
                  onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                >
                  {OFFICIAL_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
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
                      <img src={replacePreview} alt="New Replacement" className="gallery-replace-thumb" />
                      <label htmlFor="replace-photo-input" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-primary-green)', fontWeight: 600, marginTop: '8px', cursor: 'pointer' }}>
                        Click to choose different image
                      </label>
                    </div>
                  ) : (
                    <div style={{ padding: '24px 10px' }}>
                      <input 
                        type="file" 
                        accept="image/jpeg,image/png,image/webp,image/jpg" 
                        onChange={handleReplaceFileChange} 
                        style={{ display: 'none' }} 
                        id="replace-photo-input"
                        disabled={saving}
                      />
                      <label htmlFor="replace-photo-input" style={{ cursor: 'pointer', display: 'block' }}>
                        <UploadCloud size={36} style={{ color: 'var(--color-primary-green)', margin: '0 auto 8px auto' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>
                          Select New Photograph
                        </span>
                      </label>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png,image/webp,image/jpg" 
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
                            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827' }}>
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
                <span className="badge badge-green" style={{ marginBottom: '6px' }}>{previewModalItem.category}</span>
                <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', margin: 0 }}>{previewModalItem.title}</h3>
              </div>
              <button type="button" className="modal-close-btn" style={{ color: '#FFFFFF' }} onClick={() => setPreviewModalItem(null)}>
                ✕
              </button>
            </div>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <img 
                src={previewModalItem.imageUrl} 
                alt={previewModalItem.title} 
                style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: '8px' }} 
              />
              {previewModalItem.caption && (
                <p style={{ color: '#D1D5DB', fontSize: '0.92rem', marginTop: '14px', lineHeight: '1.5' }}>
                  {previewModalItem.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
