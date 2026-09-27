import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  LogOut, 
  Lock, 
  KeyRound, 
  Mail, 
  EyeOff, 
  RefreshCw, 
  Search, 
  SlidersHorizontal, 
  X, 
  Image as ImageIcon,
  DollarSign,
  MapPin,
  Maximize2,
  Bed,
  Bath,
  Car,
  Layers,
  ExternalLink
} from 'lucide-react';
import { Property, PropertyType, TransactionType } from './types/property';
import { 
  getPropertiesFromFirestore, 
  subscribeToProperties, 
  savePropertyToFirestore, 
  deletePropertyFromFirestore,
  isAuthorizedAdminAccount,
  isAuthorizedAdminPassword,
  AUTHORIZED_ADMIN_LOGIN,
  fbSignOut,
  auth
} from './lib/firebase';
import { processFileToCompressedDataUrl } from './lib/imageUtils';

export default function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('lb_admin_account') || localStorage.getItem('lb_admin_account');
      return Boolean(saved && isAuthorizedAdminAccount(saved));
    }
    return false;
  });

  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Properties state
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');

  // Form / Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Multi-image upload state
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    type: 'casa' as PropertyType,
    transaction: 'venda' as TransactionType,
    price: 300000,
    priceFormatted: '300.000',
    condoFee: '',
    iptu: '',
    neighborhood: 'Centro',
    city: 'Horizonte',
    state: 'CE',
    addressSummary: '',
    bedrooms: 3,
    bathrooms: 2,
    parkingSpaces: 2,
    areaM2: 120,
    shortDescription: '',
    fullDescription: '',
    features: [] as string[],
    newFeatureText: '',
    images: [] as { url: string; alt: string; caption?: string }[],
    featured: false
  });

  // Load properties and subscribe to changes
  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      getPropertiesFromFirestore()
        .then((data) => setProperties(data))
        .finally(() => setLoading(false));

      const unsubscribe = subscribeToProperties((updatedList) => {
        setProperties(updatedList);
      });
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthSubmitting(true);
    setAuthError(null);

    const clean = loginInput.trim();
    if (!isAuthorizedAdminAccount(clean)) {
      setAuthError('Login ou senha incorretos. Acesso restrito a administradores.');
      setAuthSubmitting(false);
      return;
    }

    if (!isAuthorizedAdminPassword(password.trim())) {
      setAuthError('Login ou senha incorretos. Acesso restrito a administradores.');
      setAuthSubmitting(false);
      return;
    }

    sessionStorage.setItem('lb_admin_account', AUTHORIZED_ADMIN_LOGIN);
    localStorage.setItem('lb_admin_account', AUTHORIZED_ADMIN_LOGIN);
    setIsAuthenticated(true);
    setAuthSubmitting(false);
  };

  // Logout handler
  const handleLogout = async () => {
    sessionStorage.removeItem('lb_admin_account');
    localStorage.removeItem('lb_admin_account');
    setIsAuthenticated(false);
    setLoginInput('');
    setPassword('');
    try {
      await fbSignOut(auth);
    } catch {
      // Ignored
    }
  };

  // Open modal for new property
  const handleOpenNewModal = () => {
    setEditingProperty(null);
    setFormData({
      code: `LB-${Math.floor(1000 + Math.random() * 9000)}`,
      title: '',
      type: 'casa',
      transaction: 'venda',
      price: 250000,
      priceFormatted: '250.000',
      condoFee: '',
      iptu: '',
      neighborhood: 'Centro',
      city: 'Horizonte',
      state: 'CE',
      addressSummary: '',
      bedrooms: 3,
      bathrooms: 2,
      parkingSpaces: 2,
      areaM2: 100,
      shortDescription: '',
      fullDescription: '',
      features: ['Portão eletrônico', 'Quintal amplo', 'Garagem coberta'],
      newFeatureText: '',
      images: [],
      featured: false
    });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (prop: Property) => {
    setEditingProperty(prop);
    setFormData({
      code: prop.code || '',
      title: prop.title || '',
      type: prop.type || 'casa',
      transaction: prop.transaction || 'venda',
      price: prop.price || 0,
      priceFormatted: (prop.price || 0).toLocaleString('pt-BR'),
      condoFee: prop.condoFee ? String(prop.condoFee) : '',
      iptu: prop.iptu ? String(prop.iptu) : '',
      neighborhood: prop.neighborhood || '',
      city: prop.city || 'Horizonte',
      state: prop.state || 'CE',
      addressSummary: prop.addressSummary || '',
      bedrooms: prop.bedrooms || 0,
      bathrooms: prop.bathrooms || 0,
      parkingSpaces: prop.parkingSpaces || 0,
      areaM2: prop.areaM2 || 0,
      shortDescription: prop.shortDescription || '',
      fullDescription: prop.fullDescription || '',
      features: prop.features || [],
      newFeatureText: '',
      images: prop.images || [],
      featured: Boolean(prop.featured)
    });
    setIsModalOpen(true);
  };

  // Image file drop/upload handler
  const handleImageFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    setIsProcessingImages(true);
    try {
      const compressedList = await Promise.all(
        validFiles.map(async (file, idx) => {
          const dataUrl = await processFileToCompressedDataUrl(file, 1024, 0.72);
          return {
            url: dataUrl,
            alt: `${formData.title || 'Foto'} - Imagem ${formData.images.length + idx + 1}`,
            caption: ''
          };
        })
      );
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...compressedList]
      }));
    } catch (err) {
      console.error('Error processing images:', err);
      alert('Erro ao processar as fotos selecionadas.');
    } finally {
      setIsProcessingImages(false);
    }
  };

  // Save property submit
  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Por favor, informe o título do imóvel.');
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      const priceClean = Number(formData.priceFormatted.replace(/\D/g, '')) || formData.price;
      const condoClean = formData.condoFee ? Number(formData.condoFee.replace(/\D/g, '')) : undefined;
      const iptuClean = formData.iptu ? Number(formData.iptu.replace(/\D/g, '')) : undefined;

      const savedId = await savePropertyToFirestore({
        ...(editingProperty ? { id: editingProperty.id } : {}),
        code: formData.code.trim().toUpperCase(),
        title: formData.title.trim(),
        type: formData.type,
        transaction: formData.transaction,
        price: priceClean,
        condoFee: condoClean,
        iptu: iptuClean,
        neighborhood: formData.neighborhood.trim(),
        city: formData.city.trim(),
        state: formData.state.trim().toUpperCase(),
        addressSummary: formData.addressSummary.trim(),
        bedrooms: Number(formData.bedrooms) || 0,
        bathrooms: Number(formData.bathrooms) || 0,
        parkingSpaces: Number(formData.parkingSpaces) || 0,
        areaM2: Number(formData.areaM2) || 0,
        shortDescription: formData.shortDescription.trim(),
        fullDescription: formData.fullDescription.trim(),
        features: formData.features,
        images: formData.images,
        featured: formData.featured
      });

      // Update state immediately in UI
      const savedItem: Property = {
        id: editingProperty ? editingProperty.id : savedId,
        code: formData.code.trim().toUpperCase(),
        title: formData.title.trim(),
        type: formData.type,
        transaction: formData.transaction,
        price: priceClean,
        condoFee: condoClean,
        iptu: iptuClean,
        neighborhood: formData.neighborhood.trim(),
        city: formData.city.trim(),
        state: formData.state.trim().toUpperCase(),
        addressSummary: formData.addressSummary.trim(),
        bedrooms: Number(formData.bedrooms) || 0,
        bathrooms: Number(formData.bathrooms) || 0,
        parkingSpaces: Number(formData.parkingSpaces) || 0,
        areaM2: Number(formData.areaM2) || 0,
        shortDescription: formData.shortDescription.trim(),
        fullDescription: formData.fullDescription.trim(),
        features: formData.features,
        images: formData.images,
        featured: formData.featured,
        updatedAt: new Date().toISOString()
      };

      setProperties(prev => {
        const idx = prev.findIndex(p => p.id === savedItem.id || p.code === savedItem.code);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = savedItem;
          return updated;
        }
        return [savedItem, ...prev];
      });

      setFeedback({
        type: 'success',
        text: editingProperty ? 'Imóvel atualizado com sucesso!' : 'Novo imóvel publicado com sucesso no site!'
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving property:', err);
      setFeedback({
        type: 'error',
        text: 'Erro ao salvar o anúncio no banco de dados. Tente novamente.'
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete property
  const handleDeleteProperty = async (id: string) => {
    try {
      await deletePropertyFromFirestore(id);
      setProperties(prev => prev.filter(p => p.id !== id));
      setDeleteConfirmId(null);
      setFeedback({ type: 'success', text: 'Imóvel removido com sucesso!' });
    } catch (err) {
      console.error('Error deleting property:', err);
      setFeedback({ type: 'error', text: 'Não foi possível remover o imóvel.' });
    }
  };

  // Filtered properties
  const filteredProperties = properties.filter(prop => {
    const matchesSearch = 
      (prop.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prop.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prop.neighborhood || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prop.city || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'todos' || prop.type === filterType;
    return matchesSearch && matchesType;
  });

  // Login view
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0d213f] border border-[#c59b27]/60 shadow-xl mb-4">
            <Lock className="w-8 h-8 text-[#dfb743]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-tight">
            Painel Administrativo
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            LB Negócios Imobiliários • Central de Publicações
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-slate-900 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-800">
            {authError && (
              <div className="mb-5 p-3.5 rounded-lg bg-red-900/30 border border-red-500/40 flex items-start gap-2.5 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Login
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="Digite seu login"
                    className="block w-full pl-9 pr-3 py-2.5 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-[#c59b27] focus:border-transparent outline-none"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Ocultar' : 'Mostrar'}</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="block w-full pl-9 pr-10 py-2.5 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-[#c59b27] focus:border-transparent outline-none"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full mt-4 py-3 px-4 rounded-lg bg-[#c59b27] hover:bg-[#b0881e] text-slate-950 font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {authSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Entrar no Painel</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard view
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#dfb743] to-[#967417] flex items-center justify-center shadow-md">
              <Building2 className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 font-serif">
                LB Imóveis • Painel
                <span className="inline-flex items-center gap-1 text-[10px] font-sans font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Conectado à Nuvem
                </span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Central de Publicação de Imóveis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://lbnegociosimobiliarios-tru.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 hover:text-white bg-slate-800 border border-amber-500/30 hover:border-amber-400 transition-colors shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Site Principal</span>
            </a>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-900/40 border border-rose-800/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Feedback message */}
        {feedback && (
          <div className={`mb-6 p-4 rounded-xl flex items-center justify-between border ${
            feedback.type === 'success' 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}>
            <div className="flex items-center gap-3">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span className="text-sm font-medium">{feedback.text}</span>
            </div>
            <button 
              onClick={() => setFeedback(null)} 
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-white">
              Catálogo de Imóveis
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {properties.length} {properties.length === 1 ? 'imóvel cadastrado' : 'imóveis cadastrados'} no Firebase Firestore
            </p>
          </div>

          <button
            onClick={handleOpenNewModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#c59b27] hover:bg-[#b0881e] text-slate-950 font-bold text-sm shadow-lg hover:shadow-[#c59b27]/20 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Cadastrar Novo Imóvel</span>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código (ex: LB-101), título ou bairro..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#c59b27]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            {['todos', 'casa', 'apartamento', 'terreno', 'comercial'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap cursor-pointer ${
                  filterType === type 
                    ? 'bg-[#c59b27] text-slate-950 font-bold' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#c59b27]" />
            <p className="text-sm">Carregando imóveis da nuvem...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-200">Nenhum imóvel encontrado</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm || filterType !== 'todos' 
                ? 'Tente ajustar os filtros ou a busca digitada acima.' 
                : 'Você ainda não cadastrou nenhum imóvel. Clique em "Cadastrar Novo Imóvel" para começar!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((prop) => (
              <div 
                key={prop.id} 
                className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-all flex flex-col shadow-lg"
              >
                {/* Image */}
                <div className="relative aspect-16/10 bg-slate-950 overflow-hidden">
                  {prop.images && prop.images.length > 0 ? (
                    <img 
                      src={prop.images[0].url} 
                      alt={prop.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                      <ImageIcon className="w-8 h-8 mb-1" />
                      <span className="text-[10px]">Sem fotos</span>
                    </div>
                  )}

                  <span className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-xs text-[#dfb743] border border-amber-500/30 text-[11px] font-bold px-2 py-0.5 rounded-md">
                    {prop.code}
                  </span>

                  <span className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-xs text-slate-200 text-[11px] font-medium px-2 py-0.5 rounded-md capitalize">
                    {prop.transaction === 'venda' ? 'Venda' : 'Aluguel'} • {prop.type}
                  </span>

                  {prop.images && prop.images.length > 1 && (
                    <span className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-xs text-xs text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Layers className="w-3 h-3 text-[#dfb743]" />
                      {prop.images.length} fotos
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-white text-base line-clamp-1 mb-1">
                    {prop.title}
                  </h3>

                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-[#dfb743] shrink-0" />
                    <span>{prop.neighborhood}, {prop.city} - {prop.state}</span>
                  </p>

                  <div className="text-lg font-bold text-[#dfb743] mb-4">
                    R$ {(prop.price || 0).toLocaleString('pt-BR')}
                  </div>

                  {/* Highlights */}
                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-[11px] text-slate-300 mb-4">
                    <div className="flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{prop.areaM2}m²</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-slate-500" />
                      <span>{prop.bedrooms} qts</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5 text-slate-500" />
                      <span>{prop.bathrooms} ban</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Car className="w-3.5 h-3.5 text-slate-500" />
                      <span>{prop.parkingSpaces} vg</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenEditModal(prop)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Editar</span>
                    </button>

                    {deleteConfirmId === prop.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteProperty(prop.id)}
                          className="py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors cursor-pointer"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="py-2 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-400 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(prop.id)}
                        className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                        title="Excluir Imóvel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Property Creation / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white font-serif">
                  {editingProperty ? 'Editar Imóvel' : 'Cadastrar Novo Imóvel'}
                </h3>
                <p className="text-xs text-slate-400">
                  Preencha os dados e anexe as fotos para publicar no site.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProperty} className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Row 1: Code, Title */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Código do Imóvel *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-[#c59b27]"
                    placeholder="Ex: LB-101"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Título do Anúncio *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-[#c59b27]"
                    placeholder="Ex: Casa Moderna 3 Quartos com Piscina"
                  />
                </div>
              </div>

              {/* Row 2: Type, Transaction, Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipo de Imóvel
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as PropertyType })}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-[#c59b27]"
                  >
                    <option value="casa">Casa</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="terreno">Terreno</option>
                    <option value="comercial">Comercial</option>
                    <option value="rural">Rural</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Finalidade
                  </label>
                  <select
                    value={formData.transaction}
                    onChange={(e) => setFormData({ ...formData, transaction: e.target.value as TransactionType })}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-[#c59b27]"
                  >
                    <option value="venda">Venda</option>
                    <option value="aluguel">Aluguel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Preço (R$) *
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.priceFormatted}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        const num = Number(val) || 0;
                        setFormData({ 
                          ...formData, 
                          price: num, 
                          priceFormatted: num ? num.toLocaleString('pt-BR') : '' 
                        });
                      }}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-semibold focus:outline-none focus:border-[#c59b27]"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-[#c59b27]"
                    placeholder="Ex: Centro"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-[#c59b27]"
                    placeholder="Ex: Horizonte"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Estado (UF)
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-[#c59b27]"
                    placeholder="CE"
                  />
                </div>
              </div>

              {/* Row 4: Specifications */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Área (m²)
                  </label>
                  <input
                    type="number"
                    value={formData.areaM2}
                    onChange={(e) => setFormData({ ...formData, areaM2: Number(e.target.value) })}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-[#c59b27]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Quartos
                  </label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-[#c59b27]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Banheiros
                  </label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-[#c59b27]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Vagas Garagem
                  </label>
                  <input
                    type="number"
                    value={formData.parkingSpaces}
                    onChange={(e) => setFormData({ ...formData, parkingSpaces: Number(e.target.value) })}
                    className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-[#c59b27]"
                  />
                </div>
              </div>

              {/* Photos Uploader */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Fotos do Imóvel ({formData.images.length} anexadas)
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files) handleImageFiles(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                    isDragging 
                      ? 'border-[#c59b27] bg-[#c59b27]/10' 
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) handleImageFiles(e.target.files);
                    }}
                  />
                  {isProcessingImages ? (
                    <div className="flex flex-col items-center justify-center text-amber-400 gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span className="text-xs font-semibold">Otimizando e comprimindo fotos...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                      <Upload className="w-7 h-7 text-[#dfb743]" />
                      <p className="text-xs font-medium text-slate-300">
                        Clique ou arraste as fotos aqui para fazer o upload
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Otimizador inteligente incluso: Fotos de alta resolução são ajustadas automaticamente.
                      </p>
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-3">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-800 group">
                        <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== idx)
                            }));
                          }}
                          className="absolute top-1 right-1 bg-rose-600/90 hover:bg-rose-600 text-white p-1 rounded-md transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1 left-1 bg-black/80 text-[#dfb743] text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                            Principal
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descrição Completa
                </label>
                <textarea
                  rows={4}
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-[#c59b27]"
                  placeholder="Detalhes completos sobre o imóvel, diferenciais, localização..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || isProcessingImages}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-[#c59b27] hover:bg-[#b0881e] shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Salvando no Firestore...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingProperty ? 'Atualizar Imóvel' : 'Publicar Imóvel'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
