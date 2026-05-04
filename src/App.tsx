import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Calendar, Layers, Upload, Sparkles, Leaf, Check, X, ChevronDown } from 'lucide-react';

type PackageType = 'mylar-bags' | 'glass-jars' | 'child-resistant' | 'tubes' | 'boxes' | 'pouches';
type Size = 'small' | 'medium' | 'large' | 'custom';

interface FormData {
  packageType: PackageType | '';
  size: Size | '';
  customDimensions: string;
  quantity: number;
  deliveryDate: string;
  rushOrder: boolean;
  customPrinting: boolean;
  embossing: boolean;
  foilStamping: boolean;
  uploadedFiles: File[];
  companyName: string;
  email: string;
  notes: string;
}

interface QuoteResult {
  basePrice: number;
  addons: number;
  rushFee: number;
  total: number;
  perUnit: number;
}

const packageTypes: { value: PackageType; label: string; icon: string; basePrice: number }[] = [
  { value: 'mylar-bags', label: 'Mylar Bags', icon: '🌿', basePrice: 0.45 },
  { value: 'glass-jars', label: 'Glass Jars', icon: '🫙', basePrice: 1.20 },
  { value: 'child-resistant', label: 'Child-Resistant', icon: '🔒', basePrice: 0.85 },
  { value: 'tubes', label: 'Pre-Roll Tubes', icon: '📦', basePrice: 0.35 },
  { value: 'boxes', label: 'Display Boxes', icon: '📦', basePrice: 2.50 },
  { value: 'pouches', label: 'Stand-Up Pouches', icon: '🛍️', basePrice: 0.65 },
];

const sizes: { value: Size; label: string; multiplier: number }[] = [
  { value: 'small', label: '1g - 3.5g', multiplier: 1 },
  { value: 'medium', label: '7g - 14g', multiplier: 1.3 },
  { value: 'large', label: '28g+', multiplier: 1.6 },
  { value: 'custom', label: 'Custom Size', multiplier: 1.8 },
];

function App() {
  const [formData, setFormData] = useState<FormData>({
    packageType: '',
    size: '',
    customDimensions: '',
    quantity: 1000,
    deliveryDate: '',
    rushOrder: false,
    customPrinting: true,
    embossing: false,
    foilStamping: false,
    uploadedFiles: [],
    companyName: '',
    email: '',
    notes: '',
  });

  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [showQuote, setShowQuote] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateQuote = (): QuoteResult => {
    const pkg = packageTypes.find(p => p.value === formData.packageType);
    const size = sizes.find(s => s.value === formData.size);

    const basePrice = (pkg?.basePrice || 0) * (size?.multiplier || 1) * formData.quantity;

    let addons = 0;
    if (formData.customPrinting) addons += formData.quantity * 0.15;
    if (formData.embossing) addons += formData.quantity * 0.25;
    if (formData.foilStamping) addons += formData.quantity * 0.35;

    const today = new Date();
    const delivery = new Date(formData.deliveryDate);
    const daysUntilDelivery = Math.ceil((delivery.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const rushFee = formData.rushOrder || daysUntilDelivery < 14 ? basePrice * 0.25 : 0;

    const total = basePrice + addons + rushFee;

    return {
      basePrice,
      addons,
      rushFee,
      total,
      perUnit: total / formData.quantity,
    };
  };

  const handleSubmit = () => {
    const result = calculateQuote();
    setQuote(result);
    setShowQuote(true);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFormData(prev => ({
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, ...newFiles],
      }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, ...newFiles],
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index),
    }));
  };

  const isFormValid = formData.packageType && formData.size && formData.quantity > 0 && formData.deliveryDate && formData.email;

  return (
    <div className="min-h-screen bg-[#f8f5e9] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.03 }}
          transition={{ duration: 2 }}
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 C35 15, 45 20, 55 25 C45 30, 35 35, 30 55 C25 35, 15 30, 5 25 C15 20, 25 15, 30 5Z' fill='%231a3325' fill-opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: '120px 120px',
          }}
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 200, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full border border-[#c9a227]/10"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 300, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-60 -left-60 w-[500px] h-[500px] rounded-full border border-[#1a3325]/10"
        />
      </div>

      {/* Header */}
      <header className="relative z-10 py-6 md:py-8 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#1a3325] to-[#2d5240] flex items-center justify-center">
              <Leaf className="w-5 h-5 md:w-6 md:h-6 text-[#c9a227]" />
            </div>
            <div>
              <h1 className="font-display text-xl md:text-2xl text-[#1a3325] tracking-tight">KushPack Co.</h1>
              <p className="text-[10px] md:text-xs text-[#94a89c] tracking-[0.2em] uppercase">Premium Cannabis Packaging</p>
            </div>
          </div>
          <a
            href="https://kushpackco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#1a3325]/60 hover:text-[#c9a227] transition-colors font-body"
          >
            kushpackco.com
          </a>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4 md:px-8 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-8 md:mb-16"
          >
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl text-[#1a3325] mb-3 md:mb-4 leading-tight">
              Craft Your<br className="md:hidden" /> Custom Quote
            </h2>
            <p className="font-body text-base md:text-lg text-[#1a3325]/70 max-w-2xl mx-auto px-4">
              Premium packaging solutions tailored to elevate your cannabis brand.
              Configure your order below for an instant estimate.
            </p>
          </motion.div>

          {/* Quote Form */}
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column - Package Selection */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="lg:col-span-2 space-y-6 md:space-y-8"
            >
              {/* Package Type */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-xl shadow-[#1a3325]/5 border border-[#1a3325]/5">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#1a3325] flex items-center justify-center">
                    <Package className="w-4 h-4 md:w-5 md:h-5 text-[#c9a227]" />
                  </div>
                  <h3 className="font-display text-xl md:text-2xl text-[#1a3325]">Package Type</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {packageTypes.map((pkg) => (
                    <motion.button
                      key={pkg.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData(prev => ({ ...prev, packageType: pkg.value }))}
                      className={`p-4 md:p-5 rounded-xl md:rounded-2xl border-2 transition-all text-left ${
                        formData.packageType === pkg.value
                          ? 'border-[#c9a227] bg-gradient-to-br from-[#1a3325] to-[#2d5240] text-white'
                          : 'border-[#1a3325]/10 bg-[#f8f5e9]/50 hover:border-[#94a89c]'
                      }`}
                    >
                      <span className="text-xl md:text-2xl mb-2 block">{pkg.icon}</span>
                      <span className={`font-body font-medium text-sm md:text-base block ${
                        formData.packageType === pkg.value ? 'text-white' : 'text-[#1a3325]'
                      }`}>
                        {pkg.label}
                      </span>
                      <span className={`text-xs md:text-sm ${
                        formData.packageType === pkg.value ? 'text-[#c9a227]' : 'text-[#94a89c]'
                      }`}>
                        From ${pkg.basePrice.toFixed(2)}/unit
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Size & Quantity */}
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-xl shadow-[#1a3325]/5 border border-[#1a3325]/5">
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#1a3325] flex items-center justify-center">
                      <Layers className="w-4 h-4 md:w-5 md:h-5 text-[#c9a227]" />
                    </div>
                    <h3 className="font-display text-lg md:text-xl text-[#1a3325]">Size</h3>
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    {sizes.map((size) => (
                      <motion.button
                        key={size.value}
                        whileHover={{ x: 4 }}
                        onClick={() => setFormData(prev => ({ ...prev, size: size.value }))}
                        className={`w-full p-3 md:p-4 rounded-xl border-2 transition-all flex justify-between items-center ${
                          formData.size === size.value
                            ? 'border-[#c9a227] bg-[#1a3325] text-white'
                            : 'border-[#1a3325]/10 hover:border-[#94a89c]'
                        }`}
                      >
                        <span className="font-body text-sm md:text-base">{size.label}</span>
                        {formData.size === size.value && <Check className="w-4 h-4 md:w-5 md:h-5 text-[#c9a227]" />}
                      </motion.button>
                    ))}
                  </div>
                  {formData.size === 'custom' && (
                    <motion.input
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      type="text"
                      placeholder="Enter dimensions (e.g., 4x6x2 inches)"
                      value={formData.customDimensions}
                      onChange={(e) => setFormData(prev => ({ ...prev, customDimensions: e.target.value }))}
                      className="mt-3 md:mt-4 w-full p-3 md:p-4 rounded-xl border-2 border-[#1a3325]/10 bg-[#f8f5e9]/50 font-body text-sm md:text-base focus:outline-none focus:border-[#c9a227]"
                    />
                  )}
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-xl shadow-[#1a3325]/5 border border-[#1a3325]/5">
                  <h3 className="font-display text-lg md:text-xl text-[#1a3325] mb-4 md:mb-6">Quantity</h3>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="numeric"
                      min="100"
                      step="100"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                      className="w-full p-4 md:p-5 text-2xl md:text-3xl font-display text-[#1a3325] text-center rounded-xl border-2 border-[#1a3325]/10 bg-[#f8f5e9]/50 focus:outline-none focus:border-[#c9a227]"
                    />
                    <span className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-[#94a89c] text-sm md:text-base font-body">units</span>
                  </div>
                  <div className="flex gap-2 mt-3 md:mt-4">
                    {[500, 1000, 5000, 10000].map((qty) => (
                      <button
                        key={qty}
                        onClick={() => setFormData(prev => ({ ...prev, quantity: qty }))}
                        className={`flex-1 py-2 md:py-2 px-1 md:px-3 rounded-lg text-xs md:text-sm font-body transition-all ${
                          formData.quantity === qty
                            ? 'bg-[#1a3325] text-white'
                            : 'bg-[#f8f5e9] text-[#1a3325] hover:bg-[#94a89c]/20'
                        }`}
                      >
                        {qty >= 1000 ? `${qty/1000}K` : qty}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Delivery & Addons */}
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-xl shadow-[#1a3325]/5 border border-[#1a3325]/5">
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#1a3325] flex items-center justify-center">
                      <Calendar className="w-4 h-4 md:w-5 md:h-5 text-[#c9a227]" />
                    </div>
                    <h3 className="font-display text-lg md:text-xl text-[#1a3325]">Delivery</h3>
                  </div>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 md:p-4 rounded-xl border-2 border-[#1a3325]/10 bg-[#f8f5e9]/50 font-body text-sm md:text-base text-[#1a3325] focus:outline-none focus:border-[#c9a227]"
                  />
                  <label className="flex items-center gap-3 mt-3 md:mt-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.rushOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, rushOrder: e.target.checked }))}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 md:w-6 md:h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                      formData.rushOrder ? 'bg-[#c9a227] border-[#c9a227]' : 'border-[#1a3325]/20'
                    }`}>
                      {formData.rushOrder && <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />}
                    </div>
                    <span className="font-body text-sm md:text-base text-[#1a3325]">Rush Order (+25%)</span>
                  </label>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-xl shadow-[#1a3325]/5 border border-[#1a3325]/5">
                  <div className="flex items-center gap-3 mb-4 md:mb-6">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#1a3325] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-[#c9a227]" />
                    </div>
                    <h3 className="font-display text-lg md:text-xl text-[#1a3325]">Finishing</h3>
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    {[
                      { key: 'customPrinting', label: 'Custom Printing', price: '+$0.15/unit' },
                      { key: 'embossing', label: 'Embossing', price: '+$0.25/unit' },
                      { key: 'foilStamping', label: 'Foil Stamping', price: '+$0.35/unit' },
                    ].map((addon) => (
                      <label key={addon.key} className="flex items-center justify-between cursor-pointer p-2 md:p-3 rounded-lg hover:bg-[#f8f5e9]/50">
                        <div className="flex items-center gap-2 md:gap-3">
                          <input
                            type="checkbox"
                            checked={formData[addon.key as keyof FormData] as boolean}
                            onChange={(e) => setFormData(prev => ({ ...prev, [addon.key]: e.target.checked }))}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 md:w-6 md:h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                            formData[addon.key as keyof FormData] ? 'bg-[#c9a227] border-[#c9a227]' : 'border-[#1a3325]/20'
                          }`}>
                            {formData[addon.key as keyof FormData] && <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />}
                          </div>
                          <span className="font-body text-sm md:text-base text-[#1a3325]">{addon.label}</span>
                        </div>
                        <span className="text-xs md:text-sm text-[#94a89c]">{addon.price}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-xl shadow-[#1a3325]/5 border border-[#1a3325]/5">
                <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#1a3325] flex items-center justify-center">
                    <Upload className="w-4 h-4 md:w-5 md:h-5 text-[#c9a227]" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg md:text-xl text-[#1a3325]">Artwork & Graphics</h3>
                    <p className="text-xs md:text-sm text-[#94a89c]">Upload reference files, logos, or designs</p>
                  </div>
                </div>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl md:rounded-2xl p-6 md:p-10 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-[#c9a227] bg-[#c9a227]/5'
                      : 'border-[#1a3325]/20 hover:border-[#94a89c] bg-[#f8f5e9]/30'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.ai,.psd,.eps"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className={`w-8 h-8 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 transition-colors ${
                    dragActive ? 'text-[#c9a227]' : 'text-[#94a89c]'
                  }`} />
                  <p className="font-body text-sm md:text-base text-[#1a3325]">
                    <span className="text-[#c9a227] font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs md:text-sm text-[#94a89c] mt-1">PNG, JPG, PDF, AI, PSD, EPS</p>
                </div>

                {formData.uploadedFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 md:mt-4 space-y-2"
                  >
                    {formData.uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 md:p-3 bg-[#f8f5e9] rounded-lg">
                        <div className="flex items-center gap-2 md:gap-3 min-w-0">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#1a3325]/10 flex items-center justify-center flex-shrink-0">
                            <Layers className="w-4 h-4 md:w-5 md:h-5 text-[#1a3325]" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-body text-xs md:text-sm text-[#1a3325] truncate">{file.name}</p>
                            <p className="text-xs text-[#94a89c]">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Right Column - Contact & Summary */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="space-y-6 md:space-y-8"
            >
              {/* Contact Info */}
              <div className="bg-gradient-to-br from-[#1a3325] to-[#2d5240] rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-2xl">
                <h3 className="font-display text-xl md:text-2xl text-white mb-4 md:mb-6">Contact Details</h3>
                <div className="space-y-3 md:space-y-4">
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full p-3 md:p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 font-body text-sm md:text-base focus:outline-none focus:border-[#c9a227]"
                  />
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-3 md:p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 font-body text-sm md:text-base focus:outline-none focus:border-[#c9a227]"
                  />
                  <textarea
                    placeholder="Additional Notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full p-3 md:p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 font-body text-sm md:text-base focus:outline-none focus:border-[#c9a227] resize-none"
                  />
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-xl shadow-[#1a3325]/5 border border-[#1a3325]/5 sticky top-4">
                <h3 className="font-display text-xl md:text-2xl text-[#1a3325] mb-4 md:mb-6">Order Summary</h3>
                <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[#94a89c] font-body text-sm md:text-base">Package</span>
                    <span className="text-[#1a3325] font-body font-medium text-sm md:text-base">
                      {packageTypes.find(p => p.value === formData.packageType)?.label || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#94a89c] font-body text-sm md:text-base">Size</span>
                    <span className="text-[#1a3325] font-body font-medium text-sm md:text-base">
                      {sizes.find(s => s.value === formData.size)?.label || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#94a89c] font-body text-sm md:text-base">Quantity</span>
                    <span className="text-[#1a3325] font-body font-medium text-sm md:text-base">
                      {formData.quantity.toLocaleString()} units
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#94a89c] font-body text-sm md:text-base">Delivery</span>
                    <span className="text-[#1a3325] font-body font-medium text-sm md:text-base">
                      {formData.deliveryDate ? new Date(formData.deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </span>
                  </div>
                  {formData.uploadedFiles.length > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-[#94a89c] font-body text-sm md:text-base">Artwork</span>
                      <span className="text-[#c9a227] font-body font-medium text-sm md:text-base">
                        {formData.uploadedFiles.length} file{formData.uploadedFiles.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-[#1a3325]/10 pt-4 md:pt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={!isFormValid}
                    className={`w-full py-4 md:py-5 rounded-xl md:rounded-2xl font-display text-base md:text-lg tracking-wide transition-all ${
                      isFormValid
                        ? 'bg-gradient-to-r from-[#c9a227] to-[#dbb940] text-[#1a3325] shadow-lg shadow-[#c9a227]/30 hover:shadow-xl hover:shadow-[#c9a227]/40'
                        : 'bg-[#94a89c]/30 text-[#94a89c] cursor-not-allowed'
                    }`}
                  >
                    Generate Quote
                  </motion.button>
                  <p className="text-center text-xs text-[#94a89c] mt-3 font-body">
                    Instant estimate • No obligation
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Quote Modal */}
      <AnimatePresence>
        {showQuote && quote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#1a3325]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowQuote(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#f8f5e9] rounded-2xl md:rounded-3xl p-6 md:p-10 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-[#c9a227]/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-tr from-[#1a3325]/10 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />

              <button
                onClick={() => setShowQuote(false)}
                className="absolute top-4 right-4 p-2 hover:bg-[#1a3325]/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 md:w-6 md:h-6 text-[#1a3325]" />
              </button>

              <div className="relative">
                <div className="text-center mb-6 md:mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#c9a227] to-[#dbb940] flex items-center justify-center mx-auto mb-3 md:mb-4"
                  >
                    <Leaf className="w-7 h-7 md:w-8 md:h-8 text-[#1a3325]" />
                  </motion.div>
                  <h3 className="font-display text-2xl md:text-3xl text-[#1a3325]">Your Quote</h3>
                  <p className="text-sm text-[#94a89c] font-body mt-1">Estimated pricing for your order</p>
                </div>

                <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-between items-center"
                  >
                    <span className="text-[#94a89c] font-body text-sm md:text-base">Base Price</span>
                    <span className="text-[#1a3325] font-body font-medium text-sm md:text-base">${quote.basePrice.toFixed(2)}</span>
                  </motion.div>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-between items-center"
                  >
                    <span className="text-[#94a89c] font-body text-sm md:text-base">Finishing Add-ons</span>
                    <span className="text-[#1a3325] font-body font-medium text-sm md:text-base">${quote.addons.toFixed(2)}</span>
                  </motion.div>
                  {quote.rushFee > 0 && (
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex justify-between items-center"
                    >
                      <span className="text-[#c9a227] font-body text-sm md:text-base">Rush Fee</span>
                      <span className="text-[#c9a227] font-body font-medium text-sm md:text-base">${quote.rushFee.toFixed(2)}</span>
                    </motion.div>
                  )}
                </div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-gradient-to-br from-[#1a3325] to-[#2d5240] rounded-xl md:rounded-2xl p-5 md:p-6 text-center"
                >
                  <p className="text-[#94a89c] text-xs md:text-sm font-body mb-1">Estimated Total</p>
                  <p className="font-display text-3xl md:text-4xl text-white mb-2">${quote.total.toFixed(2)}</p>
                  <p className="text-[#c9a227] text-sm md:text-base font-body">
                    ${quote.perUnit.toFixed(3)} per unit
                  </p>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center text-xs md:text-sm text-[#94a89c] mt-4 md:mt-6 font-body"
                >
                  This is an estimate. Final pricing may vary based on artwork complexity and specific requirements.
                </motion.p>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-4 md:mt-6 py-3 md:py-4 rounded-xl bg-[#c9a227] text-[#1a3325] font-display text-sm md:text-base tracking-wide hover:bg-[#dbb940] transition-colors"
                >
                  Request Detailed Quote
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 py-6 md:py-8 px-4 text-center border-t border-[#1a3325]/10">
        <p className="text-xs md:text-sm text-[#94a89c]/60 font-body">
          Requested by <a href="https://twitter.com/donethedirt" target="_blank" rel="noopener noreferrer" className="hover:text-[#c9a227] transition-colors">@donethedirt</a> · Built by <a href="https://twitter.com/clonkbot" target="_blank" rel="noopener noreferrer" className="hover:text-[#c9a227] transition-colors">@clonkbot</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
