import React, { useState, useEffect, useCallback } from 'react';
import { Property } from './types';
import { AdminView } from './views/AdminView';
import { PropertyDetailView } from './views/PropertyDetailView';
import { 
  getPropertiesFromFirestore, 
  subscribeToProperties, 
  getLocalCachedProperties 
} from './lib/firebase';

export default function App() {
  const [previewProperty, setPreviewProperty] = useState<Property | null>(null);
  const [, setProperties] = useState<Property[]>(() => {
    return getLocalCachedProperties();
  });

  // Load properties from Firestore
  const loadProperties = useCallback(async () => {
    try {
      const data = await getPropertiesFromFirestore();
      if (data && data.length > 0) {
        setProperties(data);
      }
    } catch (err) {
      console.warn('Erro ao carregar do Firestore:', err);
    }
  }, []);

  useEffect(() => {
    loadProperties();

    // Subscribe to live Firestore updates
    const unsubscribeSnapshot = subscribeToProperties((updatedData) => {
      if (updatedData && updatedData.length > 0) {
        setProperties(updatedData);
      }
    });

    document.title = 'Central de Publicação de Imóveis | LB Negócios Imobiliários';

    return () => {
      unsubscribeSnapshot();
    };
  }, [loadProperties]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Dedicated Upload and Management Center */}
      <AdminView
        onBackToSite={() => window.open('https://lbnegociosimobiliarios-tru.vercel.app', '_blank')}
        onPreviewProperty={(property) => setPreviewProperty(property)}
        onPropertiesUpdated={loadProperties}
      />

      {/* Property Quick Preview Modal */}
      {previewProperty && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto relative shadow-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setPreviewProperty(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-900/90 text-white flex items-center justify-center hover:bg-slate-900 transition-colors shadow-lg cursor-pointer font-bold text-sm"
              title="Fechar prévia"
            >
              ✕
            </button>
            <PropertyDetailView
              property={previewProperty}
              onBack={() => setPreviewProperty(null)}
              onNavigateHome={() => setPreviewProperty(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
