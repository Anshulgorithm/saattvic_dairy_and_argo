import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductCategory } from '../types';
import { X, Upload, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';

interface AdminProductModalProps {
  productToEdit: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: ProductCategory[] = [
  'Ghee & Dairy',
  'Honey & Naturals',
  'Cold-Pressed Oils',
  'Agro Produce',
  'Farm Essentials',
];

const PRESET_PHOTOS = [
  { label: 'Ghee Jar (Close-up)', url: '/src/assets/images/product_bilona_ghee_jar_close.jpg' },
  { label: 'Ghee Jar (In Hand) 1', url: '/src/assets/images/product_bilona_ghee_hand_1.jpg' },
  { label: 'Ghee Jar (In Hand) 2', url: '/src/assets/images/product_bilona_ghee_hand_2.jpg' },
  { label: 'Ghee Jars Group Shot', url: '/src/assets/images/product_bilona_ghee_jars_group.jpg' },
];

export const AdminProductModal: React.FC<AdminProductModalProps> = ({
  productToEdit,
  isOpen,
  onClose,
}) => {
  const { addProduct, updateProduct, showToast } = useStore();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Ghee & Dairy');
  const [price, setPrice] = useState(1500);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [stock, setStock] = useState(10);
  const [lowStockThreshold, setLowStockThreshold] = useState(3);
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [details, setDetails] = useState<string[]>(['']);
  const [customImageUrl, setCustomImageUrl] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSku(productToEdit.sku);
      setCategory(productToEdit.category);
      setPrice(productToEdit.price);
      setOriginalPrice(productToEdit.originalPrice);
      setStock(productToEdit.stock);
      setLowStockThreshold(productToEdit.lowStockThreshold || 3);
      setDescription(productToEdit.description);
      setMaterial(productToEdit.material || '');
      setDimensions(productToEdit.dimensions || '');
      setFeatured(productToEdit.featured);
      setImages(productToEdit.images || []);
      setDetails(productToEdit.details?.length ? productToEdit.details : ['']);
    } else {
      // Default new product values
      setName('');
      setSku('SDA-' + Math.floor(100 + Math.random() * 900));
      setCategory('Ghee & Dairy');
      setPrice(1200);
      setOriginalPrice(undefined);
      setStock(15);
      setLowStockThreshold(3);
      setDescription('');
      setMaterial('');
      setDimensions('');
      setFeatured(false);
      setImages(['/src/assets/images/product_bilona_ghee_jar_close.jpg']);
      setDetails(['Made using traditional methods', 'Quality checked before dispatch']);
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds 5MB limit.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setImages((prev) => [result, ...prev]);
        showToast('Photo uploaded successfully.', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddImageUrl = () => {
    if (!customImageUrl.trim()) return;
    setImages((prev) => [...prev, customImageUrl.trim()]);
    setCustomImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDetailChange = (index: number, val: string) => {
    setDetails((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleAddDetailRow = () => {
    setDetails((prev) => [...prev, '']);
  };

  const handleRemoveDetailRow = (index: number) => {
    setDetails((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Please provide a product title.', 'warning');
      return;
    }

    if (images.length === 0) {
      showToast('Please add at least one product photo.', 'warning');
      return;
    }

    const cleanedDetails = details.filter((d) => d.trim().length > 0);

    const productPayload = {
      name: name.trim(),
      sku: sku.trim() || 'SKU-' + Date.now().toString().slice(-4),
      category,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      stock: Math.max(0, Number(stock)),
      lowStockThreshold: Number(lowStockThreshold),
      description: description.trim(),
      material: material.trim(),
      dimensions: dimensions.trim(),
      featured,
      images,
      details: cleanedDetails,
      rating: productToEdit ? productToEdit.rating : 5.0,
      reviewsCount: productToEdit ? productToEdit.reviewsCount : 1,
      tags: [category.split(' ')[0], 'Studio', 'Handmade'],
    };

    if (productToEdit) {
      updateProduct(productToEdit.id, productPayload);
    } else {
      addProduct(productPayload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#fafaf8]">
          <h2 className="text-base font-semibold text-stone-900">
            {productToEdit ? 'Edit Product in Catalog' : 'Upload New Product & Stock'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5 text-xs text-stone-700">
          {/* Photos Upload Section */}
          <div className="space-y-2">
            <label className="block font-semibold text-stone-900">
              Product Photos & Assets *
            </label>
            <p className="text-[11px] text-stone-500">
              Upload photos directly from your device, pick a studio preset, or paste an image URL.
            </p>

            {/* Existing images list */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-stone-300 group shrink-0"
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-stone-900/80 text-white rounded hover:bg-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-0 inset-x-0 bg-stone-900/90 text-white text-[9px] text-center py-0.5 font-medium">
                      Primary
                    </span>
                  )}
                </div>
              ))}

              {/* Upload Button */}
              <label className="w-20 h-20 rounded-lg border-2 border-dashed border-stone-300 hover:border-stone-500 bg-stone-50 hover:bg-stone-100 flex flex-col items-center justify-center cursor-pointer transition-colors shrink-0">
                <Upload className="w-4 h-4 text-stone-500 mb-1" />
                <span className="text-[10px] text-stone-600 font-medium">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Quick preset presets */}
            <div className="pt-2">
              <span className="text-[11px] text-stone-400 block mb-1">Or choose studio presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_PHOTOS.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setImages((prev) => [...prev, preset.url])}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[11px] font-medium transition-colors"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* URL input */}
            <div className="flex gap-2 pt-1">
              <input
                type="url"
                placeholder="Or paste image URL (https://...)"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                className="flex-1 bg-white border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-2 bg-stone-100 border border-stone-300 rounded-lg text-stone-800 hover:bg-stone-200 font-medium"
              >
                Add URL
              </button>
            </div>
          </div>

          {/* Basic Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone-100 pt-4">
            <div className="sm:col-span-2">
              <label className="block text-stone-800 font-medium mb-1">Product Title *</label>
              <input
                type="text"
                placeholder="e.g. Hand-Thrown Stoneware Pitcher"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:border-stone-600"
              />
            </div>

            <div>
              <label className="block text-stone-800 font-medium mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:border-stone-600 font-medium"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-stone-800 font-medium mb-1">SKU Code</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 font-mono-nums focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-800 font-medium mb-1">Selling Price *</label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
                className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 font-mono-nums focus:outline-none focus:border-stone-600"
              />
            </div>

            <div>
              <label className="block text-stone-800 font-medium mb-1">Original / Retail Price (Optional)</label>
              <input
                type="number"
                min="0"
                placeholder="Leave blank if no discount"
                value={originalPrice ?? ''}
                onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 font-mono-nums focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-800 font-medium mb-1">Current Available Stock (Units) *</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                required
                className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 font-mono-nums focus:outline-none focus:border-stone-600"
              />
            </div>

            <div>
              <label className="block text-stone-800 font-medium mb-1">Low Stock Warning Threshold</label>
              <input
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 font-mono-nums focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-stone-800 font-medium mb-1">Short Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tactile details, story, and everyday functionality..."
                className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:border-stone-600"
              />
            </div>

            <div>
              <label className="block text-stone-800 font-medium mb-1">Material Composition</label>
              <input
                type="text"
                placeholder="e.g. Stoneware, Red Clay, Brass"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-stone-800 font-medium mb-1">Dimensions / Sizing</label>
              <input
                type="text"
                placeholder="e.g. 14cm × 9cm (350ml capacity)"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg p-2.5 text-stone-900 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="feat-check"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-stone-900 focus:ring-0"
              />
              <label htmlFor="feat-check" className="text-xs font-medium text-stone-800 cursor-pointer">
                Feature prominently on Storefront homepage
              </label>
            </div>
          </div>

          {/* Details / Bullet Points */}
          <div className="border-t border-stone-100 pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-stone-800 font-medium">Key Product Highlights & Specs</label>
              <button
                type="button"
                onClick={handleAddDetailRow}
                className="text-stone-700 hover:text-stone-950 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Bullet Point</span>
              </button>
            </div>

            {details.map((detail, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Individually wheel-thrown in Bengaluru studio"
                  value={detail}
                  onChange={(e) => handleDetailChange(idx, e.target.value)}
                  className="flex-1 bg-white border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-none"
                />
                {details.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDetailRow(idx)}
                    className="p-2 text-stone-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Footer Submit */}
          <div className="border-t border-stone-200 pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-stone-900 text-white rounded-lg font-medium hover:bg-stone-800 transition-colors shadow-xs"
            >
              {productToEdit ? 'Save Changes' : 'Publish Product to Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
