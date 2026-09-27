import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Plus, Edit, Trash2, Star, StarOff, LogOut, Check, 
  X, Image as ImageIcon, Search, RefreshCw, AlertCircle, Eye, EyeOff,
  Lock, Mail, ArrowLeft, CheckCircle2, ShieldCheck, Home, KeyRound,
  Upload, Download, FolderDown, FileImage, ArrowLeftRight, Loader2
} from 'lucide-react';
import { Property, PropertyType, TransactionType } from '../types';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInAnonymously,
  fbSignOut, 
  onAuthStateChanged, 
  User, 
  getPropertiesFromFirestore, 
  savePropertyToFirestore, 
  deletePropertyFromFirestore, 
  seedPropertiesIfEmpty,
  AUTHORIZED_ADMIN_LOGIN,
  AUTHORIZED_ADMIN_PASSWORD,
  CANONICAL_ADMIN_EMAIL,
  isAuthorizedAdminAccount,
  isAuthorizedAdminPassword
} from '../lib/firebase';
import { 
  processImageFile, 
  downloadImageFile, 
  downloadMultipleImages 
} from '../lib/imageUtils';
import { COMPANY_INFO } from '../data/company';

interface AdminViewProps {
  onBackToSite: () => void;
  onPreviewProperty: (property: Property) => void;
  onPropertiesUpdated?: () => void;
}

const HORIZONTE_NEIGHBORHOODS = [
  'Centro',
  'Mangueiral',
  'Dourado',
  'Planalto Horizonte',
  'Catolé',
  'Diadema',
  'Zumbi',
  'Queimadas',
  'Alto da Estação',
  'Outro'
];

const DEFAULT_AMENITIES = [
  'Varanda gourmet',
  'Churrasqueira',
  'Suíte master',
  'Piscina privativa',
  'Portão elétrico',
  'Piso em porcelanato',
  'Cozinha americana',
  'Área de serviço coberta',
  'Garagem coberta',
  'Quintal amplo',
  'Iluminação em LED',
  'Cerca elétrica / Interfone'
];

// Helper: parse any Brazilian currency input (e.g. 350000, 350.000, 350.000,00, R$ 350.000, 350 mil, 1.2 mi)
export function parseBrazilianCurrencyToNumber(rawInput: string | number): number {
  if (typeof rawInput === 'number') {
    return isNaN(rawInput) ? 0 : Math.max(0, rawInput);
  }
  if (!rawInput) return 0;

  let str = String(rawInput).trim();
  if (!str) return 0;

  // Handle common shorthand like "mil", "k", "mi", "milhões", "milhao", "m"
  const milMatch = str.match(/^([\d.,]+)\s*(?:mil|k)\b/i);
  if (milMatch) {
    const base = parseSimpleDecimal(milMatch[1]);
    return Math.round(base * 1000);
  }

  const miMatch = str.match(/^([\d.,]+)\s*(?:mi|milh(?:ão|ao|ões|oes)|m)\b/i);
  if (miMatch) {
    const base = parseSimpleDecimal(miMatch[1]);
    return Math.round(base * 1000000);
  }

  // Remove currency symbols, spaces, letters
  str = str.replace(/[R$\s]/gi, '').trim();

  // If both dot and comma exist:
  if (str.includes('.') && str.includes(',')) {
    const lastDot = str.lastIndexOf('.');
    const lastComma = str.lastIndexOf(',');
    if (lastComma > lastDot) {
      // Brazilian standard: "350.000,00" -> 350000
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // US standard: "350,000.00" -> 350000
      str = str.replace(/,/g, '');
    }
  } else if (str.includes(',')) {
    const parts = str.split(',');
    if (parts.length > 2) {
      str = str.replace(/,/g, '');
    } else if (parts[1].length === 3) {
      str = str.replace(/,/g, '');
    } else {
      str = `${parts[0]}.${parts[1]}`;
    }
  } else if (str.includes('.')) {
    const parts = str.split('.');
    if (parts.length > 2) {
      str = str.replace(/\./g, '');
    } else if (parts[1].length === 3) {
      // e.g. "350.000" -> 350000 (thousands separator)
      str = str.replace(/\./g, '');
    } else if (parts[1].length === 1 || parts[1].length === 2) {
      // e.g. "1500.50"
    } else {
      str = str.replace(/\./g, '');
    }
  }

  const num = parseFloat(str);
  return isNaN(num) ? 0 : Math.max(0, num);
}

function parseSimpleDecimal(str: string): number {
  str = str.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(str);
  return isNaN(n) ? 0 : n;
}

export function formatNumberToBrazilianInput(val: number): string {
  if (!val || isNaN(val) || val <= 0) return '';
  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: val % 1 === 0 ? 0 : 2
  }).format(val);
}

export const AdminView: React.FC<AdminViewProps> = ({
  onBackToSite,
  onPreviewProperty,
  onPropertiesUpdated
}) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authorizedAccount, setAuthorizedAccount] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('lb_admin_account') || localStorage.getItem('lb_admin_account');
      if (saved && isAuthorizedAdminAccount(saved)) {
        return AUTHORIZED_ADMIN_LOGIN;
      }
    }
    return null;
  });
  const [authChecking, setAuthChecking] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Form auth fields
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // Data state
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [savingProperty, setSavingProperty] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Image Upload / Download states
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [downloadingPhotos, setDownloadingPhotos] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    type: 'casa' as PropertyType,
    transaction: 'venda' as TransactionType,
    price: 300000,
    priceInputValue: '300.000',
    condoFee: '',
    iptu: '',
    neighborhood: 'Centro',
    customNeighborhood: '',
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
    newImageUrl: '',
    newImageCaption: '',
    featured: false,
    isDemonstration: false
  });

  // Initialize portal and check authorized session
  useEffect(() => {
    const saved = sessionStorage.getItem('lb_admin_account') || localStorage.getItem('lb_admin_account');
    if (saved && isAuthorizedAdminAccount(saved)) {
      setAuthorizedAccount(AUTHORIZED_ADMIN_LOGIN);
      loadProperties();
    } else {
      setAuthorizedAccount(null);
    }
    setAuthChecking(false);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Load properties from Firestore
  const loadProperties = async () => {
    setLoadingProperties(true);
    try {
      const data = await getPropertiesFromFirestore();
      setProperties(data);
    } catch (err) {
      console.error('Failed to load properties:', err);
      setFeedbackMessage({
        type: 'error',
        text: 'Não foi possível carregar os imóveis do banco de dados.'
      });
    } finally {
      setLoadingProperties(false);
    }
  };

  // Seed sample properties
  const handleSeedData = async () => {
    if (!confirm('Deseja sincronizar e carregar os imóveis modelo no banco de dados Firestore?')) return;
    setLoadingProperties(true);
    try {
      const seeded = await seedPropertiesIfEmpty();
      setProperties(seeded);
      setFeedbackMessage({
        type: 'success',
        text: 'Catálogo inicial de imóveis inserido com sucesso no Firestore!'
      });
      if (onPropertiesUpdated) onPropertiesUpdated();
    } catch {
      setFeedbackMessage({
        type: 'error',
        text: 'Erro ao sincronizar catálogo com o banco de dados.'
      });
    } finally {
      setLoadingProperties(false);
    }
  };

  // Master Auth: Exclusively authenticate lbnegociosimobiliarios
  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAuth(true);
    setAuthError(null);
    setAuthSuccess(null);

    const cleanInput = loginInput.trim();

    // 1. STRICT AUTHORIZATION CHECK (LOGIN)
    if (!isAuthorizedAdminAccount(cleanInput)) {
      setAuthError('Login ou senha incorretos. Acesso restrito a administradores.');
      setSubmittingAuth(false);
      return;
    }

    // 2. STRICT PASSWORD CHECK
    if (!isAuthorizedAdminPassword(password.trim())) {
      setAuthError('Login ou senha incorretos. Acesso restrito a administradores.');
      setSubmittingAuth(false);
      return;
    }

    // Effective password used for backend authentication
    const effectivePassword = AUTHORIZED_ADMIN_PASSWORD;

    try {
      // Connect with Firebase Auth so Firestore security rules grant write access
      try {
        await signInWithEmailAndPassword(auth, CANONICAL_ADMIN_EMAIL, effectivePassword);
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code;
        if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/invalid-email') {
          try {
            await createUserWithEmailAndPassword(auth, CANONICAL_ADMIN_EMAIL, effectivePassword);
          } catch {
            await signInAnonymously(auth);
          }
        } else {
          try {
            await signInAnonymously(auth);
          } catch {
            // session authorization still proceeds
          }
        }
      }

      // Persist authorized session
      sessionStorage.setItem('lb_admin_account', AUTHORIZED_ADMIN_LOGIN);
      localStorage.setItem('lb_admin_account', AUTHORIZED_ADMIN_LOGIN);
      setAuthorizedAccount(AUTHORIZED_ADMIN_LOGIN);
      setAuthSuccess('Acesso concedido com sucesso!');
      await loadProperties();
      if (onPropertiesUpdated) onPropertiesUpdated();
    } catch (err) {
      console.error('Auth handler error:', err);
      sessionStorage.setItem('lb_admin_account', AUTHORIZED_ADMIN_LOGIN);
      localStorage.setItem('lb_admin_account', AUTHORIZED_ADMIN_LOGIN);
      setAuthorizedAccount(AUTHORIZED_ADMIN_LOGIN);
      setAuthSuccess('Acesso concedido com sucesso!');
      await loadProperties();
    } finally {
      setSubmittingAuth(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      sessionStorage.removeItem('lb_admin_account');
      localStorage.removeItem('lb_admin_account');
      setAuthorizedAccount(null);
      setCurrentUser(null);
      setLoginInput('');
      setPassword('');
      setAuthSuccess(null);
      setAuthError(null);
      await fbSignOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
      sessionStorage.removeItem('lb_admin_account');
      localStorage.removeItem('lb_admin_account');
      setAuthorizedAccount(null);
      setCurrentUser(null);
    }
  };

  // Open Form for Create
  const handleOpenCreateForm = () => {
    const nextCodeNum = properties.length + 101;
    setEditingProperty(null);
    setFormData({
      code: `LB-${nextCodeNum}`,
      title: '',
      type: 'casa',
      transaction: 'venda',
      price: 250000,
      priceInputValue: '250.000',
      condoFee: '',
      iptu: '',
      neighborhood: 'Centro',
      customNeighborhood: '',
      city: 'Horizonte',
      state: 'CE',
      addressSummary: 'Horizonte - CE',
      bedrooms: 3,
      bathrooms: 2,
      parkingSpaces: 2,
      areaM2: 120,
      shortDescription: '',
      fullDescription: '',
      features: ['Varanda gourmet', 'Piso em porcelanato', 'Portão elétrico'],
      newFeatureText: '',
      images: [],
      newImageUrl: '',
      newImageCaption: '',
      featured: false,
      isDemonstration: false
    });
    setIsFormOpen(true);
  };

  // Open Form for Edit
  const handleOpenEditForm = (prop: Property) => {
    setEditingProperty(prop);
    const isStandardNeighborhood = HORIZONTE_NEIGHBORHOODS.includes(prop.neighborhood);
    setFormData({
      code: prop.code,
      title: prop.title,
      type: prop.type,
      transaction: prop.transaction,
      price: prop.price,
      priceInputValue: formatNumberToBrazilianInput(prop.price),
      condoFee: prop.condoFee || '',
      iptu: prop.iptu || '',
      neighborhood: isStandardNeighborhood ? prop.neighborhood : 'Outro',
      customNeighborhood: isStandardNeighborhood ? '' : prop.neighborhood,
      city: prop.city || 'Horizonte',
      state: prop.state || 'CE',
      addressSummary: prop.addressSummary || `${prop.neighborhood}, Horizonte - CE`,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      parkingSpaces: prop.parkingSpaces,
      areaM2: prop.areaM2,
      shortDescription: prop.shortDescription,
      fullDescription: prop.fullDescription,
      features: [...prop.features],
      newFeatureText: '',
      images: [...prop.images],
      newImageUrl: '',
      newImageCaption: '',
      featured: prop.featured,
      isDemonstration: prop.isDemonstration || false
    });
    setIsFormOpen(true);
  };

  // Toggle Featured status directly from table
  const handleToggleFeatured = async (property: Property) => {
    const updatedProperty: Property = {
      ...property,
      featured: !property.featured
    };
    try {
      await savePropertyToFirestore(updatedProperty);
      setProperties(prev => prev.map(p => p.id === property.id ? updatedProperty : p));
      setFeedbackMessage({
        type: 'success',
        text: `Status de destaque do imóvel ${property.code} atualizado!`
      });
      if (onPropertiesUpdated) onPropertiesUpdated();
    } catch {
      setFeedbackMessage({
        type: 'error',
        text: 'Erro ao atualizar status do imóvel.'
      });
    }
  };

  // Delete property
  const handleDeleteProperty = async (propertyId: string) => {
    try {
      await deletePropertyFromFirestore(propertyId);
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      setDeleteConfirmId(null);
      setFeedbackMessage({
        type: 'success',
        text: 'Imóvel removido do banco de dados com sucesso.'
      });
      if (onPropertiesUpdated) onPropertiesUpdated();
    } catch {
      setFeedbackMessage({
        type: 'error',
        text: 'Erro ao excluir imóvel.'
      });
    }
  };

  // Add Feature tag
  const handleAddFeature = (feat: string) => {
    const trimmed = feat.trim();
    if (!trimmed || formData.features.includes(trimmed)) return;
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, trimmed],
      newFeatureText: ''
    }));
  };

  // Remove Feature tag
  const handleRemoveFeature = (feat: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feat)
    }));
  };

  // Add Image via URL
  const handleAddImage = () => {
    const url = formData.newImageUrl.trim();
    if (!url) return;
    setFormData(prev => ({
      ...prev,
      images: [
        ...prev.images,
        {
          url,
          alt: `${formData.title || 'Foto do imóvel'} - Horizonte CE`,
          caption: formData.newImageCaption.trim() || undefined
        }
      ],
      newImageUrl: '',
      newImageCaption: ''
    }));
  };

  // Handle image files selected or dropped from device (phone / PC)
  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsProcessingImages(true);

    try {
      const validFiles = Array.from(fileList).filter(f => f.type.startsWith('image/'));
      if (validFiles.length === 0) {
        setFeedbackMessage({
          type: 'error',
          text: 'Por favor, selecione arquivos de imagem válidos (JPG, PNG ou WebP).'
        });
        return;
      }

      const processedList: { url: string; alt: string; caption?: string }[] = [];
      for (const file of validFiles) {
        const result = await processImageFile(file, 860, 0.65);
        processedList.push({
          url: result.url,
          alt: `${formData.title || 'Foto do imóvel'} - ${result.alt}`,
          caption: result.caption
        });
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...processedList]
      }));

      setFeedbackMessage({
        type: 'success',
        text: `${processedList.length} foto(s) carregada(s) com sucesso no anúncio!`
      });
    } catch (err) {
      console.error('Erro ao processar fotos:', err);
      setFeedbackMessage({
        type: 'error',
        text: 'Ocorreu um erro ao processar uma ou mais fotos do dispositivo.'
      });
    } finally {
      setIsProcessingImages(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Download a single photo from the announcement to the device
  const handleDownloadSinglePhoto = async (url: string, index: number) => {
    try {
      const safeCode = formData.code.trim() || 'LB-IMOVEL';
      const isPng = url.includes('image/png') || url.toLowerCase().endsWith('.png');
      const filename = `${safeCode}-foto-${index + 1}.${isPng ? 'png' : 'jpg'}`;
      await downloadImageFile(url, filename);
    } catch (err) {
      console.error('Erro ao baixar foto:', err);
      setFeedbackMessage({
        type: 'error',
        text: 'Não foi possível baixar esta foto no momento.'
      });
    }
  };

  // Download all photos of the current form to the device
  const handleDownloadAllFormPhotos = async () => {
    if (!formData.images || formData.images.length === 0) return;
    setDownloadingPhotos(true);
    try {
      const safeCode = formData.code.trim() || 'LB-IMOVEL';
      await downloadMultipleImages(formData.images, safeCode);
      setFeedbackMessage({
        type: 'success',
        text: `Download das ${formData.images.length} foto(s) concluído com sucesso!`
      });
    } catch (err) {
      console.error('Erro no download em lote:', err);
      setFeedbackMessage({
        type: 'error',
        text: 'Falha durante o download das fotos do anúncio.'
      });
    } finally {
      setDownloadingPhotos(false);
    }
  };

  // Download all photos of a property from the admin table
  const handleDownloadPropertyPhotosFromTable = async (prop: Property) => {
    if (!prop.images || prop.images.length === 0) {
      setFeedbackMessage({
        type: 'error',
        text: `O imóvel ${prop.code} não possui fotos cadastradas para baixar.`
      });
      return;
    }
    setDownloadingPhotos(true);
    try {
      await downloadMultipleImages(prop.images, prop.code);
      setFeedbackMessage({
        type: 'success',
        text: `Download das ${prop.images.length} foto(s) do imóvel ${prop.code} iniciado com sucesso!`
      });
    } catch (err) {
      console.error('Erro ao baixar fotos:', err);
      setFeedbackMessage({
        type: 'error',
        text: `Erro ao baixar fotos do imóvel ${prop.code}.`
      });
    } finally {
      setDownloadingPhotos(false);
    }
  };

  // Set a specific photo as the primary cover photo (index 0)
  const handleSetPrimaryPhoto = (index: number) => {
    if (index === 0) return;
    setFormData(prev => {
      const nextImages = [...prev.images];
      const [selected] = nextImages.splice(index, 1);
      return {
        ...prev,
        images: [selected, ...nextImages]
      };
    });
  };

  // Update caption of an image in the form
  const handleUpdateImageCaption = (index: number, caption: string) => {
    setFormData(prev => {
      const nextImages = [...prev.images];
      nextImages[index] = {
        ...nextImages[index],
        caption
      };
      return {
        ...prev,
        images: nextImages
      };
    });
  };

  // Remove Image
  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Format currency
  const formatCurrency = (val: number, transaction?: TransactionType) => {
    if (!val || isNaN(val)) return 'Consulte';
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: val % 1 === 0 ? 0 : 2
    }).format(val);

    if (transaction === 'aluguel') {
      return `${formatted}/mês`;
    }
    return formatted;
  };

  // Submit property form
  const handleSavePropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProperty(true);
    setFeedbackMessage(null);

    // Parse and validate price
    const parsedPrice = parseBrazilianCurrencyToNumber(formData.priceInputValue || formData.price);
    if (!parsedPrice || parsedPrice <= 0) {
      setFeedbackMessage({
        type: 'error',
        text: 'Por favor, informe um valor numérico válido para o imóvel (maior que zero).'
      });
      setSavingProperty(false);
      return;
    }

    const chosenNeighborhood = formData.neighborhood === 'Outro'
      ? formData.customNeighborhood.trim() || 'Horizonte'
      : formData.neighborhood;

    const typeLabels: Record<PropertyType, string> = {
      casa: 'Casa',
      apartamento: 'Apartamento',
      terreno: 'Terreno',
      comercial: 'Comercial'
    };

    const transactionLabels: Record<TransactionType, string> = {
      venda: 'Venda',
      aluguel: 'Aluguel'
    };

    const propertyToSave: Property = {
      id: editingProperty ? editingProperty.id : `prop-${Date.now()}`,
      code: formData.code.trim().toUpperCase(),
      title: formData.title.trim(),
      type: formData.type,
      typeLabel: typeLabels[formData.type],
      transaction: formData.transaction,
      transactionLabel: transactionLabels[formData.transaction],
      price: parsedPrice,
      priceFormatted: formatCurrency(parsedPrice, formData.transaction),
      condoFee: formData.condoFee.trim() || '',
      iptu: formData.iptu.trim() || '',
      neighborhood: chosenNeighborhood,
      city: formData.city.trim() || 'Horizonte',
      state: formData.state.trim().toUpperCase() || 'CE',
      addressSummary: formData.addressSummary.trim() || `${chosenNeighborhood}, ${formData.city} - ${formData.state}`,
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      parkingSpaces: Number(formData.parkingSpaces),
      areaM2: Number(formData.areaM2),
      shortDescription: formData.shortDescription.trim(),
      fullDescription: formData.fullDescription.trim(),
      features: formData.features || [],
      images: (formData.images || []).map((img, idx) => ({
        url: img.url,
        alt: img.alt || `Foto ${idx + 1}`,
        caption: img.caption || ''
      })),
      featured: Boolean(formData.featured),
      isDemonstration: Boolean(formData.isDemonstration)
    };

    try {
      await savePropertyToFirestore(propertyToSave);
      // Immediately reflect in local state so it appears in the table without relying on a network reload
      setProperties(prev => {
        const idx = prev.findIndex(p => p.id === propertyToSave.id || p.code === propertyToSave.code);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = propertyToSave;
          return updated;
        }
        return [propertyToSave, ...prev];
      });
      setFeedbackMessage({
        type: 'success',
        text: `Imóvel ${propertyToSave.code} salvo com sucesso no Firestore!`
      });
      setIsFormOpen(false);
      await loadProperties();
      if (onPropertiesUpdated) onPropertiesUpdated();
    } catch (err) {
      console.error('Error saving property:', err);
      const msg = err instanceof Error ? err.message : 'Erro ao salvar imóvel no Firestore.';
      setFeedbackMessage({
        type: 'error',
        text: msg
      });
    } finally {
      setSavingProperty(false);
    }
  };

  // Filtered properties list for display
  const displayedProperties = properties.filter(prop => {
    const matchesSearch = 
      prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.neighborhood.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'todos' || prop.type === filterType;
    return matchesSearch && matchesType;
  });

  // Render: Loading Screen
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-md flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-[#0d213f] animate-spin" />
          <p className="text-sm font-medium text-slate-600">Verificando sessão administrativa...</p>
        </div>
      </div>
    );
  }

  // Render: Login Screen (if not logged in as the authorized account)
  if (!authorizedAccount) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <button
            type="button"
            onClick={onBackToSite}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao site público</span>
          </button>

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0d213f] border border-[#c59b27]/60 shadow-lg mb-4">
            <Lock className="w-8 h-8 text-[#dfb743]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-white tracking-tight">
            Área Administrativa
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            {COMPANY_INFO.name} • Acesso Restrito aos Administradores
          </p>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <div className="bg-white py-8 px-6 shadow-2xl rounded-xl sm:px-10 border border-slate-200">
            {authError && (
              <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="mb-5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-700">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                <span>{authSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAdminAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Login
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="Digite seu login"
                    className="block w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0d213f] focus:border-[#0d213f] outline-hidden font-medium text-slate-800"
                    id="admin-login-input"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-slate-500 hover:text-slate-700 font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Ocultar</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Mostrar</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="block w-full pl-9 pr-10 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0d213f] focus:border-[#0d213f] outline-hidden font-medium text-slate-800"
                    id="admin-password-input"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingAuth}
                className="w-full mt-2 py-3 px-4 rounded-lg bg-[#0d213f] hover:bg-[#14325e] text-[#dfb743] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                id="admin-submit-btn"
              >
                {submittingAuth ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Entrar na Área Administrativa</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <span className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Segurança ativa: apenas contas autorizadas são validadas
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render: Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Bar */}
      <header className="bg-[#0d213f] text-white sticky top-0 z-30 shadow-md border-b border-[#c59b27]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#14325e] border border-[#c59b27]/50 flex items-center justify-center shadow-xs">
              <span className="font-serif text-sm font-bold text-[#dfb743]">LB</span>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white leading-tight flex items-center gap-2">
                <span>Central de Publicação de Imóveis</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Tempo Real
                </span>
              </h1>
              <span className="text-xs text-amber-300 font-normal">
                {COMPANY_INFO.name} • Sincronizado com o site oficial
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://lbnegociosimobiliarios-tru.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 hover:text-white bg-slate-800/90 hover:bg-slate-800 border border-amber-500/40 transition-colors shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Site</span>
            </a>

            <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-700 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-300 font-medium">Área Restrita</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-900/40 border border-rose-800/50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Quick-Upload Banner */}
      <div className="bg-gradient-to-r from-[#0d213f] via-[#10294c] to-[#14325e] text-white border-b border-[#c59b27]/30 py-5 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-400/20 text-[#dfb743] font-bold text-[11px] uppercase tracking-wide border border-amber-400/30">
                Central de Upload Exclusiva
              </span>
              <span className="text-xs text-emerald-300 flex items-center gap-1.5 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Banco de Dados Firebase Ativo & Sincronizado
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
              Publique seus imóveis e fotos por aqui
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Tudo o que você adicionar, editar ou excluir por aqui salva no banco de dados e atualiza o seu site oficial no mesmo segundo. Otimizador de fotos automático ativado para fotos do celular ou computador.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleOpenCreateForm}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#dfb743] hover:bg-[#ebd06b] text-[#0d213f] font-extrabold text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all cursor-pointer transform active:scale-95"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>+ Subir Novo Imóvel com Fotos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Feedback Alert Toast */}
        {feedbackMessage && (
          <div className={`mb-6 p-4 rounded-xl flex items-center justify-between shadow-sm border ${
            feedbackMessage.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <div className="flex items-center gap-2.5 text-sm font-medium">
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              className="text-slate-500 hover:text-slate-800 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase">Total de Imóveis</span>
            <div className="text-2xl font-extrabold text-[#0d213f] mt-1">{properties.length}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase">Em Destaque</span>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">
              {properties.filter(p => p.featured).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase">Para Venda</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              {properties.filter(p => p.transaction === 'venda').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase">Para Aluguel</span>
            <div className="text-2xl font-extrabold text-blue-600 mt-1">
              {properties.filter(p => p.transaction === 'aluguel').length}
            </div>
          </div>
        </div>

        {/* Toolbar & Actions */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar código, título ou bairro..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0d213f] outline-hidden"
              />
            </div>

            {/* Type filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg bg-white text-slate-700 outline-hidden"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="casa">Casas</option>
              <option value="apartamento">Apartamentos</option>
              <option value="terreno">Terrenos</option>
              <option value="comercial">Comerciais</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {properties.length === 0 && (
              <button
                type="button"
                onClick={handleSeedData}
                disabled={loadingProperties}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-amber-500 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-bold transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loadingProperties ? 'animate-spin' : ''}`} />
                <span>Importar Imóveis Iniciais</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenCreateForm}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0d213f] hover:bg-[#14325e] text-[#dfb743] text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Anunciar Imóvel</span>
            </button>
          </div>
        </div>

        {/* Properties Table / Cards */}
        {loadingProperties ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <RefreshCw className="w-8 h-8 text-[#0d213f] animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-600">Sincronizando com o Firestore...</p>
          </div>
        ) : displayedProperties.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Nenhum imóvel encontrado</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Não há imóveis cadastrados que correspondam aos filtros. Adicione um novo imóvel ou sincronize com o banco.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleOpenCreateForm}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0d213f] text-[#dfb743] rounded-lg text-xs font-bold hover:bg-[#14325e]"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Primeiro Imóvel</span>
              </button>
              {properties.length === 0 && (
                <button
                  type="button"
                  onClick={handleSeedData}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-800 border border-amber-400 rounded-lg text-xs font-bold"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Carregar Imóveis Modelo</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Ref / Código</th>
                    <th className="py-3.5 px-4">Imóvel</th>
                    <th className="py-3.5 px-4">Tipo & Bairro</th>
                    <th className="py-3.5 px-4">Valor</th>
                    <th className="py-3.5 px-4 text-center">Destaque</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedProperties.map((prop) => {
                    const coverImage = prop.images && prop.images[0] ? prop.images[0].url : '';
                    return (
                      <tr key={prop.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Code */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-[#0d213f] bg-slate-100 px-2 py-1 rounded-sm border border-slate-200">
                            {prop.code}
                          </span>
                        </td>

                        {/* Title & Preview */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {coverImage ? (
                              <img
                                src={coverImage}
                                alt={prop.title}
                                className="w-12 h-10 object-cover rounded-md border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-10 bg-slate-100 rounded-md border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                                <Building2 className="w-5 h-5" />
                              </div>
                            )}
                            <div className="max-w-xs sm:max-w-sm">
                              <span className="font-bold text-slate-800 line-clamp-1 block">
                                {prop.title}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {prop.bedrooms} qtos • {prop.bathrooms} banh • {prop.areaM2} m²
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Type & Neighborhood */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-medium text-slate-700">{prop.typeLabel}</div>
                          <div className="text-xs text-slate-500">{prop.neighborhood}, Horizonte</div>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-bold text-[#0d213f]">
                            {prop.priceFormatted || formatCurrency(prop.price, prop.transaction)}
                          </span>
                          <span className="block text-[11px] text-slate-500 capitalize">
                            Para {prop.transaction}
                          </span>
                        </td>

                        {/* Featured Toggle */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(prop)}
                            title={prop.featured ? 'Remover dos destaques' : 'Destacar na página inicial'}
                            className={`p-1.5 rounded-md transition-colors ${
                              prop.featured 
                                ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' 
                                : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            {prop.featured ? <Star className="w-5 h-5 fill-amber-500" /> : <StarOff className="w-5 h-5" />}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDownloadPropertyPhotosFromTable(prop)}
                              title={`Baixar ${prop.images.length} fotos do anúncio ${prop.code}`}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onPreviewProperty(prop)}
                              title="Visualizar no site"
                              className="p-1.5 text-slate-500 hover:text-[#0d213f] hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditForm(prop)}
                              title="Editar anúncio"
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(prop.id)}
                              title="Excluir anúncio"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center">Confirmar exclusão?</h3>
            <p className="text-xs text-slate-600 text-center mt-2">
              Esta ação removerá permanentemente o imóvel do catálogo do Firestore.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteProperty(deleteConfirmId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer"
              >
                Sim, Excluir Imóvel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Property Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div>
                <h3 className="text-lg font-serif font-extrabold text-[#0d213f]">
                  {editingProperty ? `Editar Anúncio do Imóvel (${editingProperty.code})` : 'Anunciar Novo Imóvel'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingProperty ? 'Gerencie fotos e dados deste anúncio.' : 'Carregue as fotos do seu aparelho, baixe quando desejar e publique no catálogo.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePropertySubmit} className="space-y-6">
              {/* Row 1: Code, Title, Transaction, Type */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Código Ref *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0d213f] outline-hidden uppercase"
                    placeholder="LB-0101"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Título Principal do Imóvel *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0d213f] outline-hidden"
                    placeholder="Ex: Casa Residencial com 3 Quartos no Centro"
                  />
                </div>
              </div>

              {/* Row 2: Type, Transaction, Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tipo de Imóvel *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as PropertyType })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0d213f] outline-hidden font-medium"
                  >
                    <option value="casa">Casa</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="terreno">Terreno / Lote</option>
                    <option value="comercial">Ponto Comercial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Finalidade *
                  </label>
                  <select
                    value={formData.transaction}
                    onChange={(e) => {
                      const newTx = e.target.value as TransactionType;
                      setFormData(prev => {
                        const newPrice = newTx === 'aluguel' && prev.price > 20000 ? 1500 : (newTx === 'venda' && prev.price < 5000 ? 250000 : prev.price);
                        return {
                          ...prev,
                          transaction: newTx,
                          price: newPrice,
                          priceInputValue: formatNumberToBrazilianInput(newPrice)
                        };
                      });
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-[#0d213f] outline-hidden font-medium"
                  >
                    <option value="venda">Venda</option>
                    <option value="aluguel">Aluguel (Locação)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {formData.transaction === 'aluguel' ? 'Valor do Aluguel (R$/mês) *' : 'Valor do Imóvel (R$) *'}
                  </label>
                  <div className="relative flex rounded-lg">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-100 text-slate-700 font-bold text-xs select-none">
                      R$
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      value={formData.priceInputValue}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const parsed = parseBrazilianCurrencyToNumber(raw);
                        setFormData(prev => ({
                          ...prev,
                          priceInputValue: raw,
                          price: parsed
                        }));
                      }}
                      onBlur={() => {
                        if (formData.price > 0) {
                          setFormData(prev => ({
                            ...prev,
                            priceInputValue: formatNumberToBrazilianInput(prev.price)
                          }));
                        }
                      }}
                      placeholder={formData.transaction === 'aluguel' ? '1.500' : '350.000'}
                      className="block w-full rounded-r-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-[#0d213f] placeholder-slate-400 focus:ring-2 focus:ring-[#0d213f] outline-hidden bg-white"
                    />
                    {formData.priceInputValue && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, price: 0, priceInputValue: '' }))}
                        title="Limpar campo de valor"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {formData.price > 0 && (
                    <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
                      Confirmado: {formatCurrency(formData.price, formData.transaction)}
                    </span>
                  )}
                </div>
              </div>

              {/* Row 3: Bairro, Cidade, Estado */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Bairro em Horizonte *
                  </label>
                  <select
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    {HORIZONTE_NEIGHBORHOODS.map(nb => (
                      <option key={nb} value={nb}>{nb}</option>
                    ))}
                  </select>
                  {formData.neighborhood === 'Outro' && (
                    <input
                      type="text"
                      required
                      value={formData.customNeighborhood}
                      onChange={(e) => setFormData({ ...formData, customNeighborhood: e.target.value })}
                      placeholder="Nome do bairro ou distrito"
                      className="w-full mt-2 px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg uppercase"
                  />
                </div>
              </div>

              {/* Row 4: Specs: Quartos, Banheiros, Vagas, Área */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quartos / Suítes
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Banheiros
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vagas de Garagem
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.parkingSpaces}
                    onChange={(e) => setFormData({ ...formData, parkingSpaces: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Área Total (m²)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.areaM2}
                    onChange={(e) => setFormData({ ...formData, areaM2: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md bg-white"
                  />
                </div>
              </div>

              {/* Row 5: Descriptions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Resumo Curto (para o card de listagem)
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Ex: Excelente casa com acabamento de alto padrão e varanda gourmet no Centro."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Descrição Completa e Detalhada
                </label>
                <textarea
                  rows={4}
                  value={formData.fullDescription}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  placeholder="Descreva detalhes como posição solar, ventilação, materiais, proximidade a escolas ou rodovias..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              {/* Row 6: Features / Comodidades */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Comodidades & Características
                </label>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {formData.features.map(feat => (
                    <span
                      key={feat}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-300 text-xs font-medium text-slate-800"
                    >
                      <span>{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(feat)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.newFeatureText}
                    onChange={(e) => setFormData({ ...formData, newFeatureText: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature(formData.newFeatureText);
                      }
                    }}
                    placeholder="Adicionar característica personalizada..."
                    className="flex-grow px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddFeature(formData.newFeatureText)}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900"
                  >
                    Adicionar
                  </button>
                </div>

                {/* Quick select presets */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {DEFAULT_AMENITIES.map(preset => {
                    const alreadyAdded = formData.features.includes(preset);
                    if (alreadyAdded) return null;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleAddFeature(preset)}
                        className="text-[11px] px-2 py-0.5 rounded-full border border-slate-200 text-slate-600 hover:border-[#c59b27] hover:text-[#0d213f] bg-white transition-colors"
                      >
                        + {preset}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 7: Images Manager (Upload, Download, Reorganize) */}
              <div className="p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Fotos do Anúncio
                      </label>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#0d213f] text-[#dfb743]">
                        {formData.images.length} {formData.images.length === 1 ? 'foto' : 'fotos'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Adicione fotos do seu celular ou computador. Você também pode baixá-las a qualquer momento.
                    </p>
                  </div>

                  {formData.images.length > 0 && (
                    <button
                      type="button"
                      onClick={handleDownloadAllFormPhotos}
                      disabled={downloadingPhotos}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors shrink-0 cursor-pointer"
                      title="Baixar todas as fotos deste anúncio no seu aparelho"
                    >
                      {downloadingPhotos ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                      ) : (
                        <FolderDown className="w-3.5 h-3.5 text-emerald-700" />
                      )}
                      <span>{downloadingPhotos ? 'Baixando...' : 'Baixar Todas as Fotos'}</span>
                    </button>
                  )}
                </div>

                {/* Input Mode Selector: Upload (Celular/PC) vs URL (Link) */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setImageTab('upload')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      imageTab === 'upload'
                        ? 'bg-[#0d213f] text-[#dfb743] shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Carregar Fotos do Aparelho (Celular / PC)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageTab('url')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      imageTab === 'url'
                        ? 'bg-[#0d213f] text-[#dfb743] shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Inserir por Link (URL)</span>
                  </button>
                </div>

                {/* Tab 1: Direct File Upload (Drag & Drop + Mobile Photo Gallery Picker) */}
                {imageTab === 'upload' && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={(e) => handleFilesSelected(e.target.files)}
                      className="hidden"
                      id="property-file-picker"
                    />

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingFile(true);
                      }}
                      onDragLeave={() => setIsDraggingFile(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingFile(false);
                        handleFilesSelected(e.dataTransfer.files);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                        isDraggingFile
                          ? 'border-[#c59b27] bg-amber-50/70 scale-[0.99]'
                          : 'border-slate-300 hover:border-[#0d213f] bg-white hover:bg-slate-50'
                      }`}
                    >
                      {isProcessingImages ? (
                        <div className="py-3 flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-8 h-8 text-[#0d213f] animate-spin" />
                          <p className="text-xs font-bold text-slate-700">Otimizando e preparando fotos...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-amber-100 text-[#a9801a] flex items-center justify-center">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-800 block">
                              Clique para escolher fotos ou arraste aqui
                            </span>
                            <span className="text-xs text-slate-500 block mt-0.5">
                              Fotos da galeria do celular ou arquivos do computador (JPG, PNG ou WEBP)
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0d213f] text-[#dfb743] text-xs font-bold mt-1 shadow-xs">
                            <FileImage className="w-3.5 h-3.5" />
                            Selecionar Fotos do Aparelho
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 2: URL Link input */}
                {imageTab === 'url' && (
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="url"
                        value={formData.newImageUrl}
                        onChange={(e) => setFormData({ ...formData, newImageUrl: e.target.value })}
                        placeholder="Cole a URL da foto (https://...)"
                        className="flex-grow px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                      <input
                        type="text"
                        value={formData.newImageCaption}
                        onChange={(e) => setFormData({ ...formData, newImageCaption: e.target.value })}
                        placeholder="Legenda da foto (Ex: Fachada)"
                        className="sm:w-48 px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddImage}
                        className="px-4 py-2 bg-[#0d213f] text-[#dfb743] rounded-lg text-xs font-bold hover:bg-[#14325e] shrink-0 cursor-pointer"
                      >
                        + Inserir Foto
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Insira links de fotos já publicadas na web.
                    </p>
                  </div>
                )}

                {/* Photos List / Gallery with Download, Set Primary, Reorder, Remove */}
                {formData.images.length > 0 && (
                  <div className="pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {formData.images.map((img, idx) => (
                        <div
                          key={idx}
                          className={`relative rounded-xl border overflow-hidden bg-white shadow-xs transition-all ${
                            idx === 0 ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
                          }`}
                        >
                          {/* Image preview */}
                          <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden">
                            <img
                              src={img.url}
                              alt={img.alt || `Foto ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />

                            {/* Cover Badge */}
                            {idx === 0 ? (
                              <span className="absolute top-2 left-2 bg-[#0d213f] text-[#dfb743] text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                                <Star className="w-3 h-3 fill-[#dfb743]" />
                                Foto Principal (Capa)
                              </span>
                            ) : (
                              <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-medium px-1.5 py-0.5 rounded backdrop-blur-xs">
                                #{idx + 1}
                              </span>
                            )}
                          </div>

                          {/* Controls bar */}
                          <div className="p-2.5 bg-white space-y-2 border-t border-slate-100">
                            <input
                              type="text"
                              value={img.caption || ''}
                              onChange={(e) => handleUpdateImageCaption(idx, e.target.value)}
                              placeholder="Legenda (Ex: Sala, Quarto, Fachada)"
                              className="w-full px-2 py-1 text-[11px] border border-slate-200 rounded text-slate-700 placeholder-slate-400"
                            />

                            <div className="flex items-center justify-between gap-1.5 pt-0.5">
                              {/* Baixar Foto Individual */}
                              <button
                                type="button"
                                onClick={() => handleDownloadSinglePhoto(img.url, idx)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 cursor-pointer"
                                title="Baixar esta foto no seu aparelho"
                              >
                                <Download className="w-3 h-3" />
                                <span>Baixar foto</span>
                              </button>

                              {/* Definir como Principal */}
                              {idx !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryPhoto(idx)}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 cursor-pointer"
                                  title="Tornar esta a foto principal de capa"
                                >
                                  <Star className="w-3 h-3" />
                                  <span>Principal</span>
                                </button>
                              )}

                              {/* Remover Foto */}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors ml-auto cursor-pointer"
                                title="Remover foto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Row 8: Checkbox Options */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-[#0d213f] rounded-sm focus:ring-[#0d213f]"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Destacar imóvel na página inicial (IMÓVEIS EM DESTAQUE)
                  </span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  disabled={savingProperty}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingProperty}
                  className="px-6 py-2.5 text-xs font-bold text-[#dfb743] bg-[#0d213f] hover:bg-[#14325e] rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {savingProperty ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{editingProperty ? 'Salvar Alterações' : 'Publicar Imóvel'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
